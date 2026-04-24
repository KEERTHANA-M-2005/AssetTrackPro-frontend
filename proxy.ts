import { NextRequest, NextResponse } from "next/server"

// ── JWT decode (no crypto — middleware is edge-runtime, verification is backend's job) ──

interface JWTPayload {
  sub: string
  role: string
  email: string
  employee_id: number | null
  exp: number
}

function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    const json = Buffer.from(base64, "base64").toString("utf8")
    return JSON.parse(json) as JWTPayload
  } catch {
    return null
  }
}

function isExpired(payload: JWTPayload): boolean {
  return Date.now() / 1000 > payload.exp
}

// ── Route config ──────────────────────────────────────────────────────────────

const PUBLIC_PATHS = ["/login", "/signup"]
const ADMIN_ONLY_PATHS = ["/employees", "/admin"]
const EMPLOYEE_ONLY_PATHS = ["/employee"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("access_token")?.value

  // ── /login: let through; redirect authenticated users to their dashboard ──
  if (PUBLIC_PATHS.includes(pathname)) {
    if (token) {
      const payload = decodeJWT(token)
      if (payload && !isExpired(payload)) {
        return NextResponse.redirect(
          new URL(payload.role === "admin" ? "/dashboard" : "/employee", request.url)
        )
      }
    }
    return NextResponse.next()
  }

  // ── All other routes require a valid token ────────────────────────────────
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const payload = decodeJWT(token)
  if (!payload || isExpired(payload)) {
    const res = NextResponse.redirect(new URL("/login", request.url))
    res.cookies.delete("access_token")
    return res
  }

  // ── Admin-only routes ─────────────────────────────────────────────────────
  if (ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
    if (payload.role !== "admin") {
      return NextResponse.redirect(new URL("/employee", request.url))
    }
  }

  // ── Employee-only routes ──────────────────────────────────────────────────
  // Use exact match or sub-path so "/employees" doesn't incorrectly match "/employee"
  if (EMPLOYEE_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (payload.role === "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except Next.js internals and static files.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

export interface TokenPayload {
  sub: string        // user_id as string
  role: string       // "admin" | "employee"
  email: string
  employee_id: number | null
  exp: number
}

// ── Storage ───────────────────────────────────────────────────────────────────

export function setToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("access_token", token)
  // Mirror to cookie so Next.js middleware can read it server-side
  const maxAge = 24 * 60 * 60
  document.cookie = `access_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

export function clearAuth(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("access_token")
  document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
}

// ── Decode ────────────────────────────────────────────────────────────────────

export function decodeToken(token: string): TokenPayload | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    return JSON.parse(atob(base64)) as TokenPayload
  } catch {
    return null
  }
}

// ── State helpers ─────────────────────────────────────────────────────────────

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token)
  if (!payload) return true
  return Date.now() / 1000 > payload.exp
}

export function isAuthenticated(): boolean {
  const token = getToken()
  if (!token) return false
  return !isTokenExpired(token)
}

export function getCurrentUser(): TokenPayload | null {
  const token = getToken()
  if (!token) return null
  const payload = decodeToken(token)
  if (!payload || isTokenExpired(token)) return null
  return payload
}

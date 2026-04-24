import { redirect } from "next/navigation"

// Middleware handles auth; this just sends the root URL somewhere sensible.
export default function Home() {
  redirect("/dashboard")
}

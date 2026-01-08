import { LoginForm1 } from "./components/login-form-1"
import { Logo } from "@/components/logo"
import Link from "next/link"

export default function Page() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-lg flex-col -space-y-45">
        <Link href="/" className="flex items-center justify-center">
          <Logo size={300} showText={false} />
        </Link>
        <LoginForm1 />
      </div>
    </div>
  )
}

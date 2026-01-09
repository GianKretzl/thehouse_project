import { LoginForm1 } from "./components/login-form-1"
import { Logo } from "@/components/logo"
import Link from "next/link"

export default function Page() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-start p-6 md:p-10 pt-8">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <Link href="/" className="flex items-center justify-center">
          <Logo size={100} imageSize={800} showText={false} />
        </Link>
        <LoginForm1 />
      </div>
    </div>
  )
}

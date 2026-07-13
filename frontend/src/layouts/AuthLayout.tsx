import { Outlet, Link } from "react-router-dom"
import { ModeToggle } from "@/components/theme/mode-toggle"
import { appConfig } from "@/config/app"

export function AuthLayout() {
  return (
    <div className="relative flex min-h-svh flex-col bg-background md:flex-row">
      <ModeToggle />

      {/* Left side - Branding/Image */}
      <div className="relative hidden flex-1 flex-col justify-center overflow-hidden bg-zinc-900 px-10 text-white md:flex">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative z-20">
          <Link
            to="/"
            className="mb-10 inline-block text-2xl font-bold tracking-tight"
          >
            {appConfig.name}
          </Link>
          <div className="mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;{appConfig.testimonial.quote}&rdquo;
              </p>
              <footer className="text-sm">
                {appConfig.testimonial.author}
              </footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

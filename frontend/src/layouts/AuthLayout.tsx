import { Outlet, Link } from "react-router-dom"
import { ModeToggle } from "@/components/theme/mode-toggle"
import { appConfig } from "@/config/app"
import loginBg from "@/assets/loginBackground.png"

export function AuthLayout() {
  return (
    <div className="relative flex min-h-svh flex-col bg-background md:flex-row">
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>

      {/* Left side - Branding/Image */}
      <div
        className="relative hidden flex-1 flex-col justify-center overflow-hidden bg-zinc-900 bg-cover bg-center px-10 text-white md:flex"
        style={{ backgroundImage: `url(${loginBg})` }}
      >
        <div className="relative z-20">
          <div className="flex items-center gap-2">
            <img
              src={appConfig.logo}
              alt={appConfig.name}
              className="h-16 w-16"
              loading="lazy"
            />
            <Link
              to="/"
              className="inline-block text-2xl font-bold tracking-tight text-primary"
            >
              {appConfig.name}
            </Link>
          </div>
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

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import cat from "@/assets/cat.svg"

interface ErrorMessageProps {
  readonly message: string
  readonly onRetry?: () => void
  readonly className?: string
}

export function ErrorMessage({
  message,
  onRetry,
  className,
}: Readonly<ErrorMessageProps>) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-6 text-destructive",
        className
      )}
    >
      <div className="flex flex-col items-center">
        <img
          src={cat}
          alt="Error"
          className="h-70 w-70 object-contain opacity-90 drop-shadow-sm"
          loading="lazy"
        />
        <p className="text-center text-lg font-medium">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="lg" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  )
}

import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("relative w-full", containerClassName)}>
        <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          className={cn("bg-background pl-8", className)}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

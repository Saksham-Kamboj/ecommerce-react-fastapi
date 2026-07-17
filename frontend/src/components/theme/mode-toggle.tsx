import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "./theme-provider"

type Theme = "light" | "dark" | "system"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const themeMap: Record<Theme, Theme> = {
      light: "dark",
      dark: "system",
      system: "light",
    }
    setTheme(themeMap[theme as Theme])
  }

  // Theme configuration
  const themeConfig: Record<
    Theme,
    { Icon: LucideIcon; label: string; next: Theme }
  > = {
    light: { Icon: Sun, label: "Light mode", next: "dark" },
    dark: { Icon: Moon, label: "Dark mode", next: "system" },
    system: { Icon: Monitor, label: "System mode", next: "light" },
  }

  const current = themeConfig[theme as Theme]

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={`Switch to ${current.next} theme`}
    >
      <current.Icon className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">{current.label}</span>
    </Button>
  )
}

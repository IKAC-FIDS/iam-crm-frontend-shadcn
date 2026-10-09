import { Monitor, Moon, Sun } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import { useTheme, type Theme } from "@/components/theme-provider"
import { uiText } from "@/config/uiText"

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-xl"
            aria-label={uiText.common.theme.label}
          />
        }
      >
        <Icon aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" dir="rtl" className="w-52">
        <DropdownMenuRadioGroup
          aria-label={uiText.common.theme.label}
          value={theme}
          onValueChange={(value) => setTheme(value as Theme)}
        >
          <DropdownMenuRadioItem value="light">
            <Sun aria-hidden="true" />
            {uiText.common.theme.light}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon aria-hidden="true" />
            {uiText.common.theme.dark}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor aria-hidden="true" />
            {uiText.common.theme.system}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import { Menu } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { useSidebar } from "@workspace/ui/hooks/use-sidebar"

export function MobileNavigation() {
  const { toggleSidebar } = useSidebar()

  return (
    <Button type="button" variant="ghost" size="icon" className="size-10 rounded-xl md:hidden" aria-label="باز کردن منوی اصلی" onClick={toggleSidebar}>
      <Menu className="size-5" aria-hidden="true" />
    </Button>
  )
}

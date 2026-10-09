import { useEffect, useState, type ReactNode } from "react"
import { ImageOff } from "lucide-react"

import { api } from "@/lib/api"
import { cn } from "@workspace/ui/lib/utils"

type IdentityAvatarProps = {
  name: string
  mediaPath?: string | null
  hasMedia?: boolean
  mediaVersion?: string | null
  fallbackIcon?: ReactNode
  className?: string
  imageClassName?: string
}

export function IdentityAvatar({
  name,
  mediaPath,
  hasMedia,
  mediaVersion,
  fallbackIcon,
  className,
  imageClassName,
}: IdentityAvatarProps) {
  const [source, setSource] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    let objectUrl: string | null = null
    if (!mediaPath || !hasMedia) {
      setSource(null)
      return
    }
    api.get<Blob>(mediaPath, { responseType: "blob" }).then((response) => {
      if (!active) return
      objectUrl = URL.createObjectURL(response.data)
      setSource(objectUrl)
    }).catch(() => active && setSource(null))
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [hasMedia, mediaPath, mediaVersion])

  const initial = name.trim().slice(0, 1)
  return (
    <div className={cn("grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-[var(--app-primary-soft)] font-bold text-[var(--app-primary)] ring-1 ring-[var(--app-primary)]/10", className)}>
      {source ? (
        <img src={source} alt={name} className={cn("size-full object-cover", imageClassName)} />
      ) : initial ? initial : fallbackIcon || <ImageOff className="size-5" />}
    </div>
  )
}

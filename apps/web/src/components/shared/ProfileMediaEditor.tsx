import { useRef, useState } from "react"
import { ImagePlus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import { api } from "@/lib/api"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { IdentityAvatar } from "./IdentityAvatar"

type ProfileMediaEditorProps = {
  name: string
  mediaPath: string
  hasMedia: boolean
  mediaVersion?: string | null
  canEdit: boolean
  onChanged: (hasMedia: boolean) => void | Promise<void>
  label: string
}

export function ProfileMediaEditor({ name, mediaPath, hasMedia, mediaVersion, canEdit, onChanged, label }: ProfileMediaEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState(false)

  async function upload(file?: File) {
    if (!file) return
    const form = new FormData()
    form.append("file", file)
    setPending(true)
    try {
      await api.post(mediaPath, form)
      await onChanged(true)
      toast.success(`${label} به‌روزرسانی شد.`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, `به‌روزرسانی ${label} انجام نشد.`))
    } finally {
      setPending(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  async function remove() {
    setPending(true)
    try {
      await api.delete(mediaPath)
      await onChanged(false)
      toast.success(`${label} حذف شد.`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, `حذف ${label} انجام نشد.`))
    } finally { setPending(false) }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <IdentityAvatar name={name} mediaPath={mediaPath} hasMedia={hasMedia} mediaVersion={mediaVersion} className="size-20 text-2xl" />
      {canEdit ? <div className="flex flex-wrap gap-2">
        <input ref={inputRef} type="file" className="sr-only" accept="image/png,image/jpeg,image/webp" onChange={(event) => void upload(event.target.files?.[0])} />
        <Button type="button" variant="outline" disabled={pending} onClick={() => inputRef.current?.click()}><ImagePlus className="size-4" />{hasMedia ? "تغییر تصویر" : "افزودن تصویر"}</Button>
        {hasMedia ? <Button type="button" variant="ghost" disabled={pending} onClick={() => void remove()}><Trash2 className="size-4" />حذف</Button> : null}
        <p className="basis-full text-xs text-muted-foreground">PNG، JPG یا WEBP؛ حداکثر ۵ مگابایت</p>
      </div> : null}
    </div>
  )
}

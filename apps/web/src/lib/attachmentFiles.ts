import { api } from "@/lib/api"

export const ATTACHMENT_ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.json,.xml,.md,.txt,.csv"

export function canPreviewAttachment(mimeType?: string | null) {
  return mimeType === "application/pdf" || Boolean(mimeType?.startsWith("image/"))
}

export async function previewAttachment(attachmentId: string) {
  const previewWindow = window.open("about:blank", "_blank")
  if (previewWindow) previewWindow.opener = null
  try {
    const response = await api.get<Blob>(`/attachments/${attachmentId}/preview`, {
      responseType: "blob",
    })
    const url = URL.createObjectURL(response.data)
    if (previewWindow) previewWindow.location.href = url
    else window.open(url, "_blank", "noopener,noreferrer")
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (error) {
    previewWindow?.close()
    throw error
  }
}

export async function downloadAttachment(
  attachmentId: string,
  fileName: string
) {
  const response = await api.get<Blob>(
    `/attachments/${attachmentId}/download`,
    { responseType: "blob" }
  )
  const url = URL.createObjectURL(response.data)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

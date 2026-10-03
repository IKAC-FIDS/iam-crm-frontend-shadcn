import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Download, Eye, FileArchive, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import { FormSection } from "@/components/shared/FormSection"
import { EmptyState } from "@/components/shared/EmptyState"
import { QueryContent } from "@/components/shared/QueryContent"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { EntityRowActions } from "@/components/shared/EntityRowActions"
import { getApiErrorMessage } from "@/lib/apiResponse"
import {
  ATTACHMENT_ACCEPT,
  canPreviewAttachment,
  downloadAttachment,
  previewAttachment,
} from "@/lib/attachmentFiles"
type Attachment = {
  id: string
  originalFileName: string
  sizeBytes: number
  createdAt: string
  description?: string | null
  mimeType?: string | null
}
function attachmentRows(value: unknown): Attachment[] {
  const x = unwrapApiResponse<unknown>(value)
  if (
    x &&
    typeof x === "object" &&
    "data" in x &&
    Array.isArray((x as { data: unknown }).data)
  )
    return (x as { data: Attachment[] }).data
  return []
}
export function TechnicalAttachments({
  entityId,
  entityType,
  canView,
  canManage,
}: {
  entityId: string
  entityType: "TECHNICAL_DOCUMENT" | "TECHNICAL_RESOURCE"
  canView: boolean
  canManage: boolean
}) {
  const key = ["technical-attachments", entityType, entityId],
    q = useQuery({
      queryKey: key,
      queryFn: async () =>
        attachmentRows(
          (
            await api.get("/attachments", {
              params: { entityType, entityId, page: 1, limit: 50 },
            })
          ).data
        ),
      enabled: canView,
    }),
    client = useQueryClient(),
    [open, setOpen] = useState(false),
    [file, setFile] = useState<File>(),
    [description, setDescription] = useState("")
  const upload = useMutation({
      mutationFn: async () => {
        if (!file) throw new Error("file required")
        const form = new FormData()
        form.append("file", file)
        form.append("entityType", entityType)
        form.append("entityId", entityId)
        if (description.trim()) form.append("description", description.trim())
        await api.post("/attachments", form)
      },
      onSuccess: async () => {
        await client.invalidateQueries({ queryKey: key })
        setOpen(false)
        setFile(undefined)
        setDescription("")
      },
    }),
    remove = useMutation({
      mutationFn: (id: string) => api.delete(`/attachments/${id}`),
      onSuccess: () => client.invalidateQueries({ queryKey: key }),
    })
  async function openPreview(a: Attachment) {
    try {
      await previewAttachment(a.id)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "نمایش فایل ناموفق بود"))
    }
  }
  async function download(a: Attachment) {
    try {
      await downloadAttachment(a.id, a.originalFileName)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "دانلود فایل ناموفق بود"))
    }
  }
  if (!canView)
    return (
      <FormSection title="پیوست‌ها">
        <EmptyState
          icon={FileArchive}
          title="دسترسی به پیوست‌ها ندارید"
          description="برای مشاهده فایل‌های پیوست، مجوز مشاهده پیوست لازم است."
        />
      </FormSection>
    )
  return (
    <FormSection
      title="پیوست‌ها"
      actions={
        canManage ? (
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            بارگذاری
          </Button>
        ) : null
      }
    >
      <QueryContent query={q} errorTitle="دریافت پیوست‌ها ناموفق بود">
        {q.data?.length ? (
          <div className="grid gap-2 md:grid-cols-2">
            {q.data.map((a) => (
              <article
                key={a.id}
                className="flex min-w-0 items-center gap-3 rounded-xl border p-3"
              >
                <FileArchive className="size-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <b className="block truncate">{a.originalFileName}</b>
                  <span className="text-xs text-muted-foreground">
                    {Math.ceil(a.sizeBytes / 1024).toLocaleString("fa-IR")} KB
                  </span>
                </div>
                <EntityRowActions
                  actions={[
                    {
                      id: "preview",
                      label: "مشاهده",
                      icon: Eye,
                      visible: canPreviewAttachment(a.mimeType),
                      onClick: () => openPreview(a),
                    },
                    {
                      id: "download",
                      label: "دانلود",
                      icon: Download,
                      onClick: () => download(a),
                    },
                    {
                      id: "delete",
                      label: "حذف",
                      icon: Trash2,
                      enabled: canManage,
                      tone: "danger",
                      confirmation: {
                        title: "حذف پیوست",
                        description: "این فایل حذف شود؟",
                      },
                      onClick: () => remove.mutateAsync(a.id),
                    },
                  ]}
                />
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileArchive}
            title="پیوستی وجود ندارد"
            description="فایل‌ها از زیرساخت امن پیوست‌های موجود استفاده می‌کنند."
          />
        )}
      </QueryContent>
      <ResponsiveModal
        open={open}
        onClose={() => setOpen(false)}
        title="بارگذاری پیوست"
      >
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            upload.mutate()
          }}
        >
          <Input
            type="file"
            accept={ATTACHMENT_ACCEPT}
            required
            onChange={(e) => setFile(e.target.files?.[0])}
          />
          <textarea
            className="min-h-24 rounded-xl border p-3"
            placeholder="توضیحات"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button disabled={!file || upload.isPending}>بارگذاری</Button>
        </form>
      </ResponsiveModal>
    </FormSection>
  )
}

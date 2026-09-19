import { useEffect, useMemo, useRef, useState } from "react"
import { AtSign, CheckCircle2, MessageSquareText, Pencil, Reply, Send, Trash2, X } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { ErrorState } from "@/components/shared/ErrorState"
import { IdentityAvatar } from "@/components/shared/IdentityAvatar"
import { LoadingState } from "@/components/shared/LoadingState"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { formatJalaliDateTime } from "@/lib/date/jalali"
import { useAuthStore } from "@/store/authStore"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import { getConversationMentionOptions } from "../api/conversations.api"
import { useConversation, useConversationMutations } from "../hooks/useConversation"
import type { ConversationEntityType, ConversationMentionOption, ConversationMessage } from "../types/conversation.types"

export function EntityConversationPanel({ entityType, entityId, enabled = true }: { entityType: ConversationEntityType; entityId: string; enabled?: boolean }) {
  const user = useAuthStore((state) => state.user)
  const query = useConversation(entityType, entityId, enabled)
  const mutations = useConversationMutations(entityType, entityId)
  const [body, setBody] = useState("")
  const [type, setType] = useState<"COMMENT" | "QUESTION">("COMMENT")
  const [replyTo, setReplyTo] = useState<ConversationMessage | null>(null)
  const [editing, setEditing] = useState<ConversationMessage | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ConversationMessage | null>(null)
  const [mentionSearch, setMentionSearch] = useState("")
  const [mentionedUsers, setMentionedUsers] = useState<ConversationMentionOption[]>([])
  const debouncedMentionSearch = useDebouncedValue(mentionSearch, 250)
  const mentionOptions = useQuery({
    queryKey: ["conversation-mention-options", debouncedMentionSearch],
    queryFn: () => getConversationMentionOptions(debouncedMentionSearch),
    staleTime: 30_000,
  })
  const composer = useRef<HTMLTextAreaElement>(null)
  const markRead = mutations.read.mutate
  const isMarkingRead = mutations.read.isPending

  useEffect(() => {
    if (enabled && query.data?.unreadCount && !isMarkingRead) markRead()
  }, [enabled, isMarkingRead, markRead, query.data?.unreadCount])

  const answeredQuestions = useMemo(() => new Set((query.data?.messages ?? []).filter((item) => item.parentMessageId).map((item) => item.parentMessageId)), [query.data?.messages])
  const canModerate = user?.role === "ADMIN" || user?.role === "MANAGER"

  async function submit() {
    const value = body.trim()
    if (!value) return
    try {
      if (editing) await mutations.edit.mutateAsync({ messageId: editing.id, body: value })
      else await mutations.send.mutateAsync({ body: value, type: replyTo ? "ANSWER" : type, parentMessageId: replyTo?.id, mentionedUserIds: mentionedUsers.map((item) => item.id) })
      setBody("")
      setReplyTo(null)
      setEditing(null)
      setType("COMMENT")
      setMentionedUsers([])
      setMentionSearch("")
      composer.current?.focus()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "ثبت پیام انجام نشد."))
    }
  }

  if (query.isLoading) return <SurfaceCard id="conversation" className="p-5"><LoadingState rows={3} /></SurfaceCard>
  if (query.isError) return <SurfaceCard id="conversation" className="p-5"><ErrorState title="دریافت گفتگو ناموفق بود" description="لطفاً دوباره تلاش کنید." onRetry={() => void query.refetch()} /></SurfaceCard>

  const pending = mutations.send.isPending || mutations.edit.isPending
  return (
    <SurfaceCard id="conversation" className="scroll-mt-24 overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--app-divider)] p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]"><MessageSquareText className="size-5" /></span>
          <div><h2 className="ui-section-title">گفتگو</h2><p className="mt-1 text-xs text-[var(--app-text-secondary)]">پرسش‌ها و هماهنگی‌های داخلی این مورد</p></div>
          {query.data?.unreadCount ? <StatusBadge tone="info">{query.data.unreadCount.toLocaleString("fa-IR")} جدید</StatusBadge> : null}
        </div>
        {query.data?.thread ? (
          <div className="flex items-center gap-2">
            <StatusBadge tone={query.data.thread.status === "OPEN" ? "warning" : "success"}>{query.data.thread.status === "OPEN" ? "باز" : "حل‌شده"}</StatusBadge>
            {(canModerate || query.data.thread.createdById === user?.id) ? <Button type="button" size="sm" variant="outline" disabled={mutations.status.isPending} onClick={() => mutations.status.mutate({ threadId: query.data!.thread!.id, status: query.data!.thread!.status === "OPEN" ? "RESOLVED" : "OPEN" })}><CheckCircle2 className="size-4" />{query.data.thread.status === "OPEN" ? "حل شد" : "بازگشایی"}</Button> : null}
          </div>
        ) : null}
      </header>

      <div className="grid max-h-[520px] gap-3 overflow-y-auto p-4 sm:p-5" aria-live="polite">
        {query.data?.messages.length ? query.data.messages.map((message) => (
          <article key={message.id} className="rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <IdentityAvatar name={message.author.fullName} mediaPath={`/users/${message.author.id}/avatar`} hasMedia={Boolean(message.author.avatarObjectKey)} mediaVersion={message.author.avatarObjectKey} className="size-9 rounded-xl text-[10px]" />
                <div className="min-w-0"><p className="truncate text-sm font-bold text-[var(--app-heading)]">{message.author.fullName}</p><p className="text-[11px] text-[var(--app-text-secondary)]">{formatJalaliDateTime(message.createdAt)}{message.editedAt ? " · ویرایش‌شده" : ""}</p></div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-1">
                {message.type === "QUESTION" ? <StatusBadge tone={answeredQuestions.has(message.id) ? "success" : "warning"}>{answeredQuestions.has(message.id) ? "پاسخ داده شد" : "نیازمند پاسخ"}</StatusBadge> : message.type === "ANSWER" ? <StatusBadge tone="info">پاسخ</StatusBadge> : null}
                {!message.deletedAt ? <Button type="button" size="icon" variant="ghost" className="size-8" aria-label="پاسخ به پیام" onClick={() => { setReplyTo(message); setEditing(null); setBody(""); setMentionedUsers([]); setMentionSearch(""); composer.current?.focus() }}><Reply className="size-3.5" /></Button> : null}
                {!message.deletedAt && (message.authorId === user?.id || canModerate) ? <><Button type="button" size="icon" variant="ghost" className="size-8" aria-label="ویرایش پیام" onClick={() => { setEditing(message); setReplyTo(null); setBody(message.body || ""); setMentionedUsers([]); setMentionSearch(""); composer.current?.focus() }}><Pencil className="size-3.5" /></Button><Button type="button" size="icon" variant="ghost" className="size-8 text-[var(--destructive)]" aria-label="حذف پیام" onClick={() => setDeleteTarget(message)}><Trash2 className="size-3.5" /></Button></> : null}
              </div>
            </div>
            {message.parentMessage ? <div className="mt-3 rounded-xl border-r-2 border-[var(--app-primary)] bg-[var(--app-surface)] p-2.5 text-xs text-[var(--app-text-secondary)]"><span className="font-bold">{message.parentMessage.author.fullName}: </span>{message.parentMessage.body}</div> : null}
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--app-text-primary)]">{message.deletedAt ? "این پیام حذف شده است." : message.body}</p>
          </article>
        )) : <div className="rounded-2xl border border-dashed border-[var(--app-divider)] p-8 text-center"><MessageSquareText className="mx-auto size-8 text-[var(--app-text-secondary)]" /><p className="mt-3 text-sm font-bold">هنوز گفتگویی ثبت نشده است</p><p className="mt-1 text-xs text-[var(--app-text-secondary)]">اولین یادداشت یا پرسش را ثبت کنید.</p></div>}
      </div>

      <div className="border-t border-[var(--app-divider)] bg-[var(--app-background)]/45 p-4 sm:p-5">
        {replyTo || editing ? <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-[var(--app-primary-soft)] px-3 py-2 text-xs"><span className="line-clamp-1">{editing ? "ویرایش پیام" : `پاسخ به ${replyTo?.author.fullName}`}</span><Button type="button" variant="ghost" size="sm" onClick={() => { setReplyTo(null); setEditing(null); setBody(""); setMentionedUsers([]); setMentionSearch("") }}>انصراف</Button></div> : null}
        {!replyTo && !editing ? <div className="mb-3 flex gap-2" role="group" aria-label="نوع پیام"><Button type="button" size="sm" variant={type === "COMMENT" ? "default" : "outline"} onClick={() => setType("COMMENT")}>یادداشت</Button><Button type="button" size="sm" variant={type === "QUESTION" ? "default" : "outline"} onClick={() => setType("QUESTION")}>پرسش</Button></div> : null}
        {!editing ? (
          <div className="mb-3 grid gap-2">
            <SearchableOptionSelect
              options={(mentionOptions.data ?? [])
                .filter((option) => option.id !== user?.id && !mentionedUsers.some((selected) => selected.id === option.id))
                .map((option) => ({ id: option.id, label: option.fullName, secondary: option.email || undefined }))}
              onChange={(selectedId) => {
                const selected = mentionOptions.data?.find((option) => option.id === selectedId)
                if (selected) setMentionedUsers((current) => [...current, selected])
              }}
              search={mentionSearch}
              onSearchChange={setMentionSearch}
              loading={mentionOptions.isLoading || mentionOptions.isFetching}
              allowEmpty={false}
              placeholder="منشن کردن همکار"
              searchPlaceholder="جست‌وجوی نام یا ایمیل..."
              emptyText="کاربری پیدا نشد."
              ariaLabel="افزودن فرد به منشن‌های پیام"
            />
            {mentionedUsers.length ? (
              <div className="flex flex-wrap gap-2" aria-label="افراد منشن‌شده">
                {mentionedUsers.map((mentionedUser) => (
                  <span key={mentionedUser.id} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--app-primary-soft)] px-2.5 py-1 text-xs font-bold text-[var(--app-primary)]">
                    <AtSign className="size-3.5" />
                    {mentionedUser.fullName}
                    <button type="button" className="rounded-full p-0.5 hover:bg-black/5" aria-label={`حذف منشن ${mentionedUser.fullName}`} onClick={() => setMentionedUsers((current) => current.filter((item) => item.id !== mentionedUser.id))}>
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
            <p className="text-xs text-[var(--app-text-secondary)]">افراد منشن‌شده علاوه بر مسئولان مرتبط، اعلان این پیام را دریافت می‌کنند.</p>
          </div>
        ) : null}
        <label className="sr-only" htmlFor={`conversation-${entityType}-${entityId}`}>متن پیام</label>
        <textarea ref={composer} id={`conversation-${entityType}-${entityId}`} rows={3} maxLength={4000} value={body} onChange={(event) => setBody(event.target.value)} placeholder={replyTo ? "پاسخ خود را بنویسید..." : "یادداشت یا پرسش خود را بنویسید..."} className="w-full resize-y rounded-2xl border border-[var(--app-divider)] bg-[var(--app-surface)] px-3 py-2.5 text-sm leading-7 outline-none focus:border-[var(--app-primary)]" />
        <div className="mt-3 flex items-center justify-between gap-3"><span className="text-xs text-[var(--app-text-secondary)]">{body.length.toLocaleString("fa-IR")} از ۴۰۰۰</span><Button type="button" disabled={!body.trim() || pending} onClick={() => void submit()}><Send className="size-4" />{pending ? "در حال ثبت..." : editing ? "ذخیره" : "ارسال"}</Button></div>
      </div>

      <ConfirmDialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }} title="حذف پیام" description="متن پیام پنهان می‌شود اما سابقه آن در گفتگو باقی می‌ماند." confirmLabel="حذف پیام" isPending={mutations.remove.isPending} onConfirm={async () => { if (!deleteTarget) return; try { await mutations.remove.mutateAsync(deleteTarget.id); setDeleteTarget(null) } catch (error) { toast.error(getApiErrorMessage(error, "حذف پیام انجام نشد.")) } }} />
    </SurfaceCard>
  )
}

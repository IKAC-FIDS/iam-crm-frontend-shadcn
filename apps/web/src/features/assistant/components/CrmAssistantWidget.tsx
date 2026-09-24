import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Bot, CheckCircle2, ExternalLink, Send, Sparkles, UserRound, X } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { getApiErrorMessage } from '@/lib/apiResponse'
import { useAuthStore } from '@/store/authStore'
import {
  askCrmAssistant,
  confirmCrmAssistantAction,
  type AssistantActionResult,
  type AssistantHistoryItem,
  type PendingAssistantAction,
} from '../api/assistantApi'

const suggestions = [
  'عملکرد یکی از کارشناسان فروش در ۳۰ روز اخیر چطور بوده است؟',
  'فرصت‌های فروش مهم و نزدیک به تاریخ بسته‌شدن کدام‌اند؟',
  'کارهای عقب‌افتاده من را خلاصه کن.',
  'جلسات پیش رو را به ترتیب زمان بگو.',
]

type ChatItem = AssistantHistoryItem & { actions?: PendingAssistantAction[] }
type ActionState = { status: 'confirmed'; result: AssistantActionResult } | { status: 'cancelled' }

export function CrmAssistantWidget() {
  const user = useAuthStore((state) => state.user)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState<ChatItem[]>([])
  const [selectedAction, setSelectedAction] = useState<PendingAssistantAction | null>(null)
  const [actionStates, setActionStates] = useState<Record<string, ActionState>>({})
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const canUseAssistant = Boolean(user)

  const mutation = useMutation({
    mutationFn: (question: string) => askCrmAssistant(question, history.slice(-8).map(({ role, content }) => ({ role, content }))),
    onSuccess: (result, question) => {
      setHistory((current) => [...current, { role: 'user', content: question }, { role: 'assistant', content: result.answer, actions: result.pendingActions }])
      setMessage('')
      requestAnimationFrame(() => inputRef.current?.focus())
    },
  })
  const confirmMutation = useMutation({
    mutationFn: (action: PendingAssistantAction) => confirmCrmAssistantAction(action.token),
    onSuccess: (result, action) => {
      setActionStates((current) => ({ ...current, [action.token]: { status: 'confirmed', result } }))
      setSelectedAction(null)
    },
  })

  function submit(event?: FormEvent, suggested?: string) {
    event?.preventDefault()
    const question = (suggested ?? message).trim()
    if (!question || mutation.isPending) return
    mutation.mutate(question)
  }

  if (!canUseAssistant) return null

  return (
    <>
      <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-5 z-50 isolate sm:bottom-6 sm:left-6">
        <span aria-hidden="true" className="absolute -inset-1 rounded-full bg-[conic-gradient(from_0deg,#2563eb,#22d3ee,#a855f7,#f43f5e,#f59e0b,#22c55e,#2563eb)] opacity-80 blur-md animate-[spin_3s_linear_infinite] motion-reduce:animate-none" />
        <span aria-hidden="true" className="absolute -inset-[2px] rounded-full bg-[conic-gradient(from_0deg,#2563eb,#22d3ee,#a855f7,#f43f5e,#f59e0b,#22c55e,#2563eb)] animate-[spin_3s_linear_infinite] motion-reduce:animate-none" />
        <Button
          type="button"
          size="icon"
          className="relative size-14 rounded-full border-2 border-background bg-primary text-primary-foreground shadow-2xl transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-primary/30 sm:size-16"
          onClick={() => setOpen(true)}
          aria-label="باز کردن دستیار هوشمند CRM"
          aria-haspopup="dialog"
        >
          <Bot className="size-7 sm:size-8" strokeWidth={2.2} aria-hidden="true" />
          {history.length > 0 ? <span className="absolute -end-1 -top-1 size-3 rounded-full bg-emerald-400 ring-2 ring-background" aria-hidden="true" /> : null}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={(next) => {
        setOpen(next)
        if (next) requestAnimationFrame(() => inputRef.current?.focus())
      }}>
        <DialogContent dir="rtl" className="grid h-[min(48rem,calc(100dvh-2rem))] w-[calc(100%-1rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-3xl border-primary/20 p-0 shadow-2xl sm:w-[calc(100%-3rem)] sm:max-w-[calc(100%-3rem)] lg:max-w-4xl xl:max-w-5xl">
          <DialogHeader className="border-b border-[var(--app-divider)] bg-[var(--app-surface)] px-5 py-4 text-start sm:px-6">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary"><Sparkles className="size-5" aria-hidden="true" /></span>
              <div className="min-w-0">
                <DialogTitle className="text-lg font-black">دستیار هوشمند CRM</DialogTitle>
                <DialogDescription className="mt-1 truncate">پاسخ‌گویی بر اساس داده‌ها و دسترسی‌های شما</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="min-h-0 overflow-y-auto overscroll-contain bg-background/70 p-4 sm:p-6" aria-live="polite">
            {history.length === 0 ? (
              <div className="flex min-h-full flex-col items-center justify-center gap-5 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-primary/15 text-primary"><Bot className="size-7" aria-hidden="true" /></span>
                <div><h2 className="font-bold">چه چیزی می‌خواهید بدانید؟</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">دستیار فقط داده‌هایی را بررسی می‌کند که اجازه مشاهده آن‌ها را دارید.</p></div>
                <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                  {suggestions.map((suggestion) => <Button key={suggestion} type="button" variant="outline" className="h-auto justify-start whitespace-normal rounded-xl p-3 text-start text-sm leading-6" onClick={() => submit(undefined, suggestion)}>{suggestion}</Button>)}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {history.map((item, index) => (
                  <Card key={`${item.role}-${index}`} className={item.role === 'user' ? 'me-0 ms-auto max-w-[88%] border-primary/30 bg-primary/10' : 'me-auto ms-0 max-w-[95%]'}>
                    <CardContent className="flex gap-3 p-4">
                      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-primary">{item.role === 'user' ? <UserRound className="size-4" /> : <Bot className="size-4" />}</span>
                      <div className="min-w-0 flex-1 space-y-3">
                        <p className="whitespace-pre-wrap text-sm leading-7">{item.content}</p>
                        {item.actions?.map((action) => {
                          const state = actionStates[action.token]
                          return <div key={action.token} className="rounded-xl border border-primary/25 bg-primary/[0.06] p-3">
                            <p className="font-bold">{action.title}</p><p className="mt-1 text-xs leading-6 text-muted-foreground">{action.description}</p>
                            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">{action.fields.map((field) => <div key={`${field.label}-${field.value}`} className="flex gap-2"><dt className="text-muted-foreground">{field.label}:</dt><dd className="truncate font-medium">{field.value}</dd></div>)}</dl>
                            {state?.status === 'confirmed' ? <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="size-4" />{state.result.message}<Button type="button" size="sm" variant="outline" onClick={() => window.location.assign(state.result.entity.href)}>مشاهده<ExternalLink className="size-3.5" /></Button></div>
                              : state?.status === 'cancelled' ? <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><X className="size-4" /> عملیات لغو شد.</p>
                              : <div className="mt-3 flex gap-2"><Button type="button" size="sm" onClick={() => setSelectedAction(action)}>بررسی و اجرا</Button><Button type="button" size="sm" variant="ghost" onClick={() => setActionStates((current) => ({ ...current, [action.token]: { status: 'cancelled' } }))}>انصراف</Button></div>}
                          </div>
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {mutation.isPending ? <Card className="me-auto ms-0 max-w-[95%]"><CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground"><Bot className="size-4 animate-pulse text-primary" />در حال بررسی اطلاعات CRM…</CardContent></Card> : null}
                {mutation.isError ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{getApiErrorMessage(mutation.error, 'دریافت پاسخ ممکن نشد.')}</p> : null}
              </div>
            )}
          </div>

          <form onSubmit={submit} className="border-t border-[var(--app-divider)] bg-[var(--app-surface)] p-3 sm:p-4">
            <div className="flex items-end gap-2 rounded-2xl border border-[var(--app-divider)] bg-background p-2 focus-within:border-primary/60">
              <textarea ref={inputRef} value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit() } }} rows={2} maxLength={4000} aria-label="سؤال از دستیار CRM" placeholder="سؤال خود را درباره اطلاعات CRM بنویسید…" className="min-h-12 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 outline-none placeholder:text-muted-foreground" />
              <Button type="submit" size="icon" className="size-11 shrink-0 rounded-xl" disabled={!message.trim() || mutation.isPending} aria-label="ارسال سؤال"><Send className="size-4 rtl:rotate-180" /></Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={Boolean(selectedAction)} onOpenChange={(next) => { if (!next && !confirmMutation.isPending) setSelectedAction(null) }} title={selectedAction ? `تأیید ${selectedAction.title}` : 'تأیید عملیات'} description="پس از تأیید، این تغییر واقعاً در CRM ثبت می‌شود." confirmLabel="تأیید و اجرا" tone="primary" isPending={confirmMutation.isPending} onConfirm={() => { if (selectedAction) confirmMutation.mutate(selectedAction) }}>
        {selectedAction ? <dl className="space-y-2 rounded-xl border p-3 text-sm">{selectedAction.fields.map((field) => <div key={`${field.label}-${field.value}`} className="flex justify-between gap-4"><dt className="text-muted-foreground">{field.label}</dt><dd className="text-start font-medium">{field.value}</dd></div>)}{confirmMutation.isError ? <div role="alert" className="pt-2 text-destructive">{getApiErrorMessage(confirmMutation.error, 'اجرای عملیات ممکن نشد.')}</div> : null}</dl> : null}
      </ConfirmDialog>
    </>
  )
}

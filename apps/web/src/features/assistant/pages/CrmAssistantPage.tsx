import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Bot, CheckCircle2, ExternalLink, Send, Sparkles, UserRound, X } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'

import { EntityListPage } from '@/components/shared/EntityListPage'
import { PageHero } from '@/components/shared/PageHero'
import { SurfaceCard } from '@/components/shared/SurfaceCard'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { getApiErrorMessage } from '@/lib/apiResponse'
import {
  askCrmAssistant,
  confirmCrmAssistantAction,
  type AssistantActionResult,
  type AssistantHistoryItem,
  type PendingAssistantAction,
} from '../api/assistantApi'

const suggestions = [
  'فرصت‌های فروش مهم و نزدیک به تاریخ بسته‌شدن کدام‌اند؟',
  'کارهای عقب‌افتاده من را خلاصه کن.',
  'آخرین شرکت‌های به‌روزشده را معرفی کن.',
  'جلسات پیش رو را به ترتیب زمان بگو.',
  'یک شرکت جدید برای من ایجاد کن.',
  'برای یک شرکت موجود یک فرصت فروش بساز.',
  'یک کار جدید ثبت کن.',
  'برای یک شرکت موجود مخاطب جدید ثبت کن.',
  'یک جلسه جدید برنامه‌ریزی کن.',
  'کارکرد امروز من را ثبت کن.',
  'برای من درخواست مرخصی آماده کن.',
]

type ChatItem = AssistantHistoryItem & { actions?: PendingAssistantAction[] }
type ActionState = { status: 'confirmed'; result: AssistantActionResult } | { status: 'cancelled' }

export function CrmAssistantPage() {
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState<ChatItem[]>([])
  const [selectedAction, setSelectedAction] = useState<PendingAssistantAction | null>(null)
  const [actionStates, setActionStates] = useState<Record<string, ActionState>>({})
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const mutation = useMutation({
    mutationFn: (question: string) => askCrmAssistant(question, history.slice(-8).map(({ role, content }) => ({ role, content }))),
    onSuccess: (result, question) => {
      setHistory((current) => [
        ...current,
        { role: 'user', content: question },
        { role: 'assistant', content: result.answer, actions: result.pendingActions },
      ])
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

  return (
    <EntityListPage className="h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
      <PageHero
        title="دستیار هوشمند CRM"
        description="سؤال خود را درباره شرکت‌ها، فرصت‌ها، کارها و جلسات بپرسید؛ پاسخ فقط از داده‌های مجاز شما تهیه می‌شود."
        accessBadge={{ label: 'تحلیل داده‌های CRM', icon: Sparkles }}
        showRefresh={false}
      />

      <SurfaceCard className="flex min-h-0 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6" aria-live="polite">
          {history.length === 0 ? (
            <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center gap-6 py-10 text-center">
              <span className="grid size-16 place-items-center rounded-2xl bg-primary/15 text-primary">
                <Bot className="size-8" aria-hidden="true" />
              </span>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">چه چیزی می‌خواهید بدانید؟</h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  دستیار فقط داده‌هایی را می‌بیند که حساب شما اجازه مشاهده آن‌ها را دارد و هیچ تغییری در CRM ایجاد نمی‌کند.
                </p>
              </div>
              <div className="grid w-full gap-2 sm:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <Button key={suggestion} type="button" variant="outline" className="h-auto justify-start whitespace-normal rounded-xl p-4 text-start leading-6" onClick={() => submit(undefined, suggestion)}>
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto flex max-w-4xl flex-col gap-4">
              {history.map((item, index) => (
                <Card key={`${item.role}-${index}`} className={item.role === 'user' ? 'me-0 ms-auto max-w-[85%] border-primary/30 bg-primary/10' : 'me-auto ms-0 max-w-[92%]'}>
                  <CardContent className="flex gap-3 p-4">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-primary">
                      {item.role === 'user' ? <UserRound className="size-4" /> : <Bot className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1 space-y-3">
                      <p className="whitespace-pre-wrap text-sm leading-7">{item.content}</p>
                      {item.actions?.map((action) => {
                        const state = actionStates[action.token]
                        return (
                          <div key={action.token} className="rounded-xl border border-primary/25 bg-primary/[0.06] p-3">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div>
                                <p className="font-bold text-foreground">{action.title}</p>
                                <p className="mt-1 text-xs leading-6 text-muted-foreground">{action.description}</p>
                              </div>
                              <Sparkles className="size-5 shrink-0 text-primary" aria-hidden="true" />
                            </div>
                            <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                              {action.fields.map((field) => (
                                <div key={`${field.label}-${field.value}`} className="flex min-w-0 gap-2">
                                  <dt className="shrink-0 text-muted-foreground">{field.label}:</dt>
                                  <dd className="truncate font-medium" title={field.value}>{field.value}</dd>
                                </div>
                              ))}
                            </dl>
                            {state?.status === 'confirmed' ? (
                              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="size-4" /> {state.result.message}
                                <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={() => window.location.assign(state.result.entity.href)}>
                                  مشاهده {state.result.entity.label}<ExternalLink className="size-3.5" />
                                </Button>
                              </div>
                            ) : state?.status === 'cancelled' ? (
                              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><X className="size-4" /> عملیات لغو شد.</p>
                            ) : (
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Button type="button" size="sm" className="rounded-lg" onClick={() => setSelectedAction(action)}>بررسی و اجرا</Button>
                                <Button type="button" size="sm" variant="ghost" className="rounded-lg" onClick={() => setActionStates((current) => ({ ...current, [action.token]: { status: 'cancelled' } }))}>انصراف</Button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {mutation.isPending && (
                <Card className="me-auto ms-0 max-w-[92%]">
                  <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
                    <Bot className="size-4 animate-pulse text-primary" /> در حال بررسی اطلاعات CRM…
                  </CardContent>
                </Card>
              )}
              {mutation.isError && (
                <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {getApiErrorMessage(mutation.error, 'دریافت پاسخ ممکن نشد.')}
                </p>
              )}
            </div>
          )}
        </div>

        <form onSubmit={submit} className="border-t border-[var(--app-divider)] bg-[var(--app-surface)] p-3 sm:p-4">
          <div className="mx-auto flex max-w-4xl items-end gap-2 rounded-2xl border border-[var(--app-divider)] bg-background p-2 focus-within:border-primary/60">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  submit()
                }
              }}
              rows={2}
              maxLength={4000}
              aria-label="سؤال از دستیار CRM"
              placeholder="مثلاً فرصت‌های با اولویت بالا که هنوز بسته نشده‌اند کدام‌اند؟"
              className="min-h-12 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" size="icon" className="size-11 shrink-0 rounded-xl" disabled={!message.trim() || mutation.isPending} aria-label="ارسال سؤال">
              <Send className="size-4 rtl:rotate-180" />
            </Button>
          </div>
        </form>
      </SurfaceCard>

      <ConfirmDialog
        open={Boolean(selectedAction)}
        onOpenChange={(open) => { if (!open && !confirmMutation.isPending) setSelectedAction(null) }}
        title={selectedAction ? `تأیید ${selectedAction.title}` : 'تأیید عملیات'}
        description="پس از تأیید، این تغییر واقعاً در CRM ثبت می‌شود. جزئیات را یک‌بار دیگر بررسی کنید."
        confirmLabel="تأیید و اجرا"
        tone="primary"
        isPending={confirmMutation.isPending}
        onConfirm={() => { if (selectedAction) confirmMutation.mutate(selectedAction) }}
      >
        {selectedAction ? (
          <dl className="space-y-2 rounded-xl border border-[var(--app-divider)] bg-background p-3 text-sm">
            {selectedAction.fields.map((field) => <div key={`${field.label}-${field.value}`} className="flex justify-between gap-4"><dt className="text-muted-foreground">{field.label}</dt><dd className="text-start font-medium">{field.value}</dd></div>)}
            {confirmMutation.isError ? <div role="alert" className="pt-2 text-destructive">{getApiErrorMessage(confirmMutation.error, 'اجرای عملیات ممکن نشد.')}</div> : null}
          </dl>
        ) : null}
      </ConfirmDialog>
    </EntityListPage>
  )
}

import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Bot, Send, Sparkles, UserRound } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'

import { EntityListPage } from '@/components/shared/EntityListPage'
import { PageHero } from '@/components/shared/PageHero'
import { SurfaceCard } from '@/components/shared/SurfaceCard'
import { getApiErrorMessage } from '@/lib/apiResponse'
import { askCrmAssistant, type AssistantHistoryItem } from '../api/assistantApi'

const suggestions = [
  'فرصت‌های فروش مهم و نزدیک به تاریخ بسته‌شدن کدام‌اند؟',
  'کارهای عقب‌افتاده من را خلاصه کن.',
  'آخرین شرکت‌های به‌روزشده را معرفی کن.',
  'جلسات پیش رو را به ترتیب زمان بگو.',
]

export function CrmAssistantPage() {
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState<AssistantHistoryItem[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const mutation = useMutation({
    mutationFn: (question: string) => askCrmAssistant(question, history.slice(-8)),
    onSuccess: (result, question) => {
      setHistory((current) => [
        ...current,
        { role: 'user', content: question },
        { role: 'assistant', content: result.answer },
      ])
      setMessage('')
      requestAnimationFrame(() => inputRef.current?.focus())
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
                    <p className="whitespace-pre-wrap text-sm leading-7">{item.content}</p>
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
    </EntityListPage>
  )
}

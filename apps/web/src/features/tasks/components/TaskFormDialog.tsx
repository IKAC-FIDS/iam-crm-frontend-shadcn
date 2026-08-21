import { Loader2, Save } from "lucide-react"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { FormSection } from "@/components/shared/FormSection"
import { PersianDateTimePicker } from "@/components/shared/PersianDateTimePicker"
import { uiText } from "@/config/uiText"
import { SearchableCompanySelect } from "@/features/people/components/SearchableCompanySelect"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import {
  useCreateTask,
  useTaskAssignees,
  useTaskDocuments,
  useTaskOpportunityOptions,
  useTaskPayments,
  useTaskPeopleOptions,
  useUpdateTask,
} from "../hooks/useTasks"
import type {
  Task,
  TaskOption,
  TaskPayload,
  TaskPriority,
} from "../types/task.types"
import { TaskOptionSelect } from "./TaskOptionSelect"

function useDebounced(value: string) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), 300)
    return () => window.clearTimeout(timer)
  }, [value])
  return debounced
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  initialCompanyId,
  initialOpportunity,
  lockCompany = false,
  lockOpportunity = false,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  initialCompanyId?: string
  initialOpportunity?: TaskOption
  lockCompany?: boolean
  lockOpportunity?: boolean
  onSaved?: (task: Task) => void
}) {
  const text = uiText.tasks
  const create = useCreateTask()
  const update = useUpdateTask()
  const pending = create.isPending || update.isPending

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM")
  const [companyId, setCompanyId] = useState("")
  const [opportunity, setOpportunity] = useState<TaskOption>()
  const [person, setPerson] = useState<TaskOption>()
  const [document, setDocument] = useState<TaskOption>()
  const [payment, setPayment] = useState<TaskOption>()
  const [assignee, setAssignee] = useState<TaskOption>()
  const [dueAt, setDueAt] = useState<Date>()
  const [reminderAt, setReminderAt] = useState<Date>()

  const [opportunitySearch, setOpportunitySearch] = useState("")
  const [personSearch, setPersonSearch] = useState("")
  const [assigneeSearch, setAssigneeSearch] = useState("")

  useEffect(() => {
    if (!open) return
    setTitle(task?.title || "")
    setDescription(task?.description || "")
    setPriority(task?.priority || "MEDIUM")
    setCompanyId(task?.companyId || initialCompanyId || "")
    setOpportunity(
      task?.opportunity?.id
        ? {
            id: task.opportunity.id,
            label: task.opportunity.title || text.fallbacks.opportunity,
          }
        : initialOpportunity
    )
    setPerson(
      task?.person?.id
        ? {
            id: task.person.id,
            label: task.person.fullName || text.fallbacks.person,
            secondary: task.person.title || undefined,
          }
        : undefined
    )
    setDocument(
      task?.commercialDocument?.id
        ? {
            id: task.commercialDocument.id,
            label:
              task.commercialDocument.title ||
              task.commercialDocument.number ||
              text.fallbacks.document,
          }
        : undefined
    )
    setPayment(
      task?.payment?.id
        ? {
            id: task.payment.id,
            label:
              `${task.payment.amount ?? ""} ${task.payment.currency ?? ""}`.trim() ||
              text.fallbacks.payment,
          }
        : undefined
    )
    setAssignee(
      task?.assignedTo?.id
        ? {
            id: task.assignedTo.id,
            label:
              task.assignedTo.fullName ||
              task.assignedTo.email ||
              task.assignedTo.id,
            secondary: task.assignedTo.email || undefined,
          }
        : undefined
    )
    setDueAt(task?.dueAt ? new Date(task.dueAt) : undefined)
    setReminderAt(task?.reminderAt ? new Date(task.reminderAt) : undefined)
    setOpportunitySearch("")
    setPersonSearch("")
    setAssigneeSearch("")
  }, [initialCompanyId, initialOpportunity, open, task, text.fallbacks])

  const debouncedOpportunity = useDebounced(opportunitySearch)
  const debouncedPerson = useDebounced(personSearch)
  const debouncedAssignee = useDebounced(assigneeSearch)

  const opportunities = useTaskOpportunityOptions(
    companyId,
    debouncedOpportunity,
    open
  )
  const people = useTaskPeopleOptions(companyId, debouncedPerson, open)
  const assignees = useTaskAssignees(debouncedAssignee, open)
  const documents = useTaskDocuments(opportunity?.id || "", open)
  const payments = useTaskPayments(opportunity?.id || "", open)

  const opportunityOptions = useMemo(
    () =>
      opportunities.data?.pages
        .flatMap((page) => page.data)
        .map((item) => ({
          id: item.id,
          label: item.title,
          secondary:
            item.company?.brandName || item.company?.legalName || undefined,
        })) || [],
    [opportunities.data]
  )
  const peopleOptions = useMemo(
    () =>
      people.data?.pages
        .flatMap((page) => page.data)
        .map((item) => ({
          id: item.id,
          label: item.fullName,
          secondary: item.title || item.jobTitle || undefined,
        })) || [],
    [people.data]
  )
  const assigneeOptions = useMemo(
    () =>
      assignees.data?.pages
        .flatMap((page) => page.data)
        .map((item) => ({
          id: item.id,
          label: item.fullName || item.email || item.id,
          secondary: item.email || undefined,
        })) || [],
    [assignees.data]
  )
  const documentOptions = useMemo(
    () =>
      documents.data?.data.map((item) => ({
        id: item.id,
        label: item.title || item.number || text.fallbacks.document,
        secondary: item.number || item.type || undefined,
      })) || [],
    [documents.data, text.fallbacks.document]
  )
  const paymentOptions = useMemo(
    () =>
      payments.data?.data.map((item) => ({
        id: item.id,
        label: `${Number(item.amount).toLocaleString("fa-IR")} ${item.currency}`,
        secondary: item.status,
      })) || [],
    [payments.data]
  )

  const filteredPaymentOptions = useMemo(() => {
    if (!document) return paymentOptions
    return paymentOptions.filter((option) => {
      const item = payments.data?.data.find((row) => row.id === option.id)
      return (
        !item?.commercialDocumentId ||
        item.commercialDocumentId === document.id
      )
    })
  }, [document, paymentOptions, payments.data])

  const validation = useMemo(() => {
    if (!title.trim()) return text.validation.titleRequired
    if (reminderAt && dueAt && reminderAt >= dueAt)
      return text.validation.reminderBeforeDue
    if (person && !companyId) return text.validation.companyForPerson
    if ((document || payment) && !opportunity)
      return text.validation.opportunityForCommercialContext
    return ""
  }, [
    companyId,
    document,
    dueAt,
    opportunity,
    payment,
    person,
    reminderAt,
    text.validation,
    title,
  ])

  function changeCompany(next?: string) {
    if (lockCompany) return
    setCompanyId(next || "")
    setOpportunity(undefined)
    setPerson(undefined)
    setDocument(undefined)
    setPayment(undefined)
  }

  function changeOpportunity(next?: TaskOption) {
    if (lockOpportunity) return
    setOpportunity(next)
    setDocument(undefined)
    setPayment(undefined)
  }

  async function submit() {
    if (validation) return
    const payload: TaskPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueAt: dueAt?.toISOString(),
      reminderAt: reminderAt?.toISOString(),
      companyId: companyId || undefined,
      opportunityId: opportunity?.id,
      personId: person?.id,
      commercialDocumentId: document?.id,
      paymentId: payment?.id,
      assignedToId: assignee?.id,
    }

    try {
      const saved = task
        ? await update.mutateAsync({
            id: task.id,
            payload,
            previous: task,
          })
        : await create.mutateAsync(payload)

      toast.success(task ? text.feedback.updated : text.feedback.created)
      onSaved?.(saved)
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="max-h-[94vh] w-full max-w-[calc(100%_-_1rem)] min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-[26px] p-0 sm:max-w-[920px]"
      >
        <DialogHeader className="border-b border-[var(--app-divider)] px-5 py-4 sm:px-6">
          <DialogTitle className="text-base font-bold text-[var(--app-heading)]">
            {task ? text.dialogs.editTitle : text.dialogs.createTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-[var(--app-text-secondary)]">
            {text.dialogs.formDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 space-y-4 overflow-y-auto bg-[var(--app-background)]/45 p-4 sm:p-5">
          <FormSection
            title={text.sections.task}
            description={text.sections.taskDescription}
          >
            <div className="grid gap-4">
              <Field label={text.fields.title}>
                <Input
                  value={title}
                  maxLength={200}
                  onChange={(event) => setTitle(event.target.value)}
                  className="h-11 rounded-xl"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
                <Field label={text.fields.description}>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className={textareaClass}
                  />
                </Field>
                <Field label={text.fields.priority}>
                  <select
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value as TaskPriority)
                    }
                    className={selectClass}
                  >
                    {(["LOW", "MEDIUM", "HIGH", "STRATEGIC"] as TaskPriority[]).map(
                      (value) => (
                        <option key={value} value={value}>
                          {text.priorities[value]}
                        </option>
                      )
                    )}
                  </select>
                </Field>
              </div>
            </div>
          </FormSection>

          <FormSection
            title={text.sections.context}
            description={text.sections.contextDescription}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={text.fields.company}>
                <SearchableCompanySelect
                  value={companyId || undefined}
                  onChange={changeCompany}
                  disabled={lockCompany}
                  placeholder={text.placeholders.company}
                />
              </Field>

              <Field label={text.fields.opportunity}>
                <TaskOptionSelect
                  value={opportunity?.id}
                  selectedOption={opportunity}
                  options={opportunityOptions}
                  onChange={changeOpportunity}
                  search={opportunitySearch}
                  onSearchChange={setOpportunitySearch}
                  placeholder={text.placeholders.opportunity}
                  disabled={lockOpportunity}
                  loading={opportunities.isLoading}
                  hasMore={opportunities.hasNextPage}
                  loadingMore={opportunities.isFetchingNextPage}
                  onLoadMore={() => void opportunities.fetchNextPage()}
                />
              </Field>

              <Field label={text.fields.person}>
                <TaskOptionSelect
                  value={person?.id}
                  selectedOption={person}
                  options={peopleOptions}
                  onChange={setPerson}
                  search={personSearch}
                  onSearchChange={setPersonSearch}
                  placeholder={
                    companyId
                      ? text.placeholders.person
                      : text.placeholders.companyFirst
                  }
                  disabled={!companyId}
                  loading={people.isLoading}
                  hasMore={people.hasNextPage}
                  loadingMore={people.isFetchingNextPage}
                  onLoadMore={() => void people.fetchNextPage()}
                />
              </Field>

              <Field label={text.fields.commercialDocument}>
                <TaskOptionSelect
                  value={document?.id}
                  selectedOption={document}
                  options={documentOptions}
                  onChange={(next) => {
                    setDocument(next)
                    if (
                      payment &&
                      payments.data?.data.some(
                        (item) =>
                          item.id === payment.id &&
                          item.commercialDocumentId &&
                          item.commercialDocumentId !== next?.id
                      )
                    ) {
                      setPayment(undefined)
                    }
                  }}
                  search=""
                  onSearchChange={() => undefined}
                  searchable={false}
                  placeholder={
                    opportunity
                      ? text.placeholders.commercialDocument
                      : text.placeholders.opportunityFirst
                  }
                  disabled={!opportunity}
                  loading={documents.isLoading}
                />
              </Field>

              <Field label={text.fields.payment}>
                <TaskOptionSelect
                  value={payment?.id}
                  selectedOption={payment}
                  options={filteredPaymentOptions}
                  onChange={setPayment}
                  search=""
                  onSearchChange={() => undefined}
                  searchable={false}
                  placeholder={
                    opportunity
                      ? text.placeholders.payment
                      : text.placeholders.opportunityFirst
                  }
                  disabled={!opportunity}
                  loading={payments.isLoading}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title={text.sections.ownership}
            description={text.sections.ownershipDescription}
          >
            <Field label={text.fields.assignee}>
              <TaskOptionSelect
                value={assignee?.id}
                selectedOption={assignee}
                options={assigneeOptions}
                onChange={setAssignee}
                search={assigneeSearch}
                onSearchChange={setAssigneeSearch}
                placeholder={text.placeholders.systemAssignee}
                loading={assignees.isLoading}
                hasMore={assignees.hasNextPage}
                loadingMore={assignees.isFetchingNextPage}
                onLoadMore={() => void assignees.fetchNextPage()}
              />
            </Field>
          </FormSection>

          <FormSection
            title={text.sections.schedule}
            description={text.sections.scheduleDescription}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={text.fields.dueAt}>
                <PersianDateTimePicker value={dueAt} onChange={setDueAt} />
              </Field>
              <Field label={text.fields.reminderAt}>
                <PersianDateTimePicker value={reminderAt} onChange={setReminderAt} />
              </Field>
            </div>
          </FormSection>

          {validation ? (
            <p className="rounded-xl border border-[var(--destructive)]/20 bg-[var(--destructive-soft)] px-3 py-2 text-xs text-[var(--destructive)]">
              {validation}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--app-divider)] bg-[var(--app-surface)] px-5 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {uiText.common.cancel}
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)]"
            disabled={Boolean(validation) || pending}
            onClick={() => void submit()}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {pending ? uiText.common.processing : text.actions.save}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid min-w-0 gap-2">
      <Label className="text-[11px] font-bold text-[var(--app-heading)]">
        {label}
      </Label>
      {children}
    </div>
  )
}

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus:border-[var(--app-primary)]"
const textareaClass =
  "w-full resize-none rounded-xl border border-input bg-transparent p-3 text-sm outline-none focus:border-[var(--app-primary)]"

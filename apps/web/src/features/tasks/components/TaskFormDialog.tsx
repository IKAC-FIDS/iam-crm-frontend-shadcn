import {
  FormDialogBody,
  FormDialogFooter,
} from "@/components/shared/FormDialogLayout"
import { useDebouncedValue as useDebounced } from "@/lib/useDebouncedValue"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { applyServerFieldErrors } from "@/lib/formErrors"
import { FormActions } from "@/components/shared/FormActions"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { DialogHeroHeader } from "@/components/shared/DialogHeroHeader"
import { FormSection } from "@/components/shared/FormSection"
import { PersianDateTimePicker } from "@/components/shared/PersianDateTimePicker"
import { uiText } from "@/config/uiText"
import { SearchableCompanySelect } from "@/features/people/components/SearchableCompanySelect"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"

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

const formSchema = z.object({
  title: z.string().trim().min(1, uiText.tasks.validation.titleRequired),
  description: z.string(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "STRATEGIC"]),
  companyId: z.string(),
  opportunity: z.custom<TaskOption>().optional(),
  person: z.custom<TaskOption>().optional(),
  document: z.custom<TaskOption>().optional(),
  payment: z.custom<TaskOption>().optional(),
  assignee: z.custom<TaskOption>().optional(),
  dueAt: z.date().optional(),
  reminderAt: z.date().optional(),
})
type FormValues = z.infer<typeof formSchema>

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

  const defaultValues = useMemo<FormValues>(() => {
    return {
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || "MEDIUM",
      companyId: task?.companyId || initialCompanyId || "",
      opportunity: task?.opportunity?.id
        ? {
            id: task.opportunity.id,
            label: task.opportunity.title || text.fallbacks.opportunity,
          }
        : initialOpportunity,
      person: task?.person?.id
        ? {
            id: task.person.id,
            label: task.person.fullName || text.fallbacks.person,
            secondary: task.person.title || undefined,
          }
        : undefined,
      document: task?.commercialDocument?.id
        ? {
            id: task.commercialDocument.id,
            label:
              task.commercialDocument.title ||
              task.commercialDocument.number ||
              text.fallbacks.document,
          }
        : undefined,
      payment: task?.payment?.id
        ? {
            id: task.payment.id,
            label:
              `${task.payment.amount ?? ""} ${task.payment.currency ?? ""}`.trim() ||
              text.fallbacks.payment,
          }
        : undefined,
      assignee: task?.assignedTo?.id
        ? {
            id: task.assignedTo.id,
            label:
              task.assignedTo.fullName ||
              task.assignedTo.email ||
              task.assignedTo.id,
            secondary: task.assignedTo.email || undefined,
          }
        : undefined,
      dueAt: task?.dueAt ? new Date(task.dueAt) : undefined,
      reminderAt: task?.reminderAt ? new Date(task.reminderAt) : undefined,
    }
  }, [task, initialCompanyId, initialOpportunity, text.fallbacks])
  const {
    control,
    register,
    setValue,
    reset,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues, resolver: zodResolver(formSchema) })
  const {
    title,
    description,
    priority,
    companyId,
    opportunity,
    person,
    document,
    payment,
    assignee,
    dueAt,
    reminderAt,
  } = useWatch({ control }) as FormValues
  const setTitle = (value: FormValues["title"]) =>
    setValue("title", value, { shouldDirty: true, shouldValidate: true })
  const setDescription = (value: FormValues["description"]) =>
    setValue("description", value, { shouldDirty: true, shouldValidate: true })
  const setPriority = (value: FormValues["priority"]) =>
    setValue("priority", value, { shouldDirty: true, shouldValidate: true })
  const setCompanyId = (value: FormValues["companyId"]) =>
    setValue("companyId", value, { shouldDirty: true, shouldValidate: true })
  const setOpportunity = (value: FormValues["opportunity"]) =>
    setValue("opportunity", value, { shouldDirty: true, shouldValidate: true })
  const setPerson = (value: FormValues["person"]) =>
    setValue("person", value, { shouldDirty: true, shouldValidate: true })
  const setDocument = (value: FormValues["document"]) =>
    setValue("document", value, { shouldDirty: true, shouldValidate: true })
  const setPayment = (value: FormValues["payment"]) =>
    setValue("payment", value, { shouldDirty: true, shouldValidate: true })
  const setAssignee = (value: FormValues["assignee"]) =>
    setValue("assignee", value, { shouldDirty: true, shouldValidate: true })
  const setDueAt = (value: FormValues["dueAt"]) =>
    setValue("dueAt", value, { shouldDirty: true, shouldValidate: true })
  const setReminderAt = (value: FormValues["reminderAt"]) =>
    setValue("reminderAt", value, { shouldDirty: true, shouldValidate: true })
  const [previousOpen, setPreviousOpen] = useState(open)
  const [opportunitySearch, setOpportunitySearch] = useState("")
  const [personSearch, setPersonSearch] = useState("")
  const [assigneeSearch, setAssigneeSearch] = useState("")
  if (previousOpen !== open) {
    setPreviousOpen(open)
    if (open) {
      setOpportunitySearch("")
      setPersonSearch("")
      setAssigneeSearch("")
    }
  }
  useEffect(() => {
    if (open) {
      reset(defaultValues)
    }
  }, [open, defaultValues, reset])

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
        !item?.commercialDocumentId || item.commercialDocumentId === document.id
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
    clearErrors()
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
      applyServerFieldErrors(
        error,
        setError,
        [
          "title",
          "description",
          "priority",
          "companyId",
          "opportunity",
          "person",
          "document",
          "payment",
          "assignee",
          "dueAt",
          "reminderAt",
        ],
        {
          opportunityId: "opportunity",
          personId: "person",
          commercialDocumentId: "document",
          paymentId: "payment",
          assignedToId: "assignee",
        }
      )
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
        <DialogHeroHeader
          title={task ? text.dialogs.editTitle : text.dialogs.createTitle}
          description={text.dialogs.formDescription}
          onClose={() => onOpenChange(false)}
        />

        <form className="contents" noValidate onSubmit={handleSubmit(submit)}>
          <FormDialogBody>
            {errors.root?.server?.message ? (
              <p role="alert" className="text-sm text-destructive">
                {errors.root.server.message}
              </p>
            ) : null}
            <FormSection
              title={text.sections.task}
              description={text.sections.taskDescription}
            >
              <div className="grid gap-4">
                <Field label={text.fields.title} error={errors.title?.message}>
                  <Input
                    {...register("title")}
                    aria-invalid={Boolean(errors.title)}
                    value={title}
                    maxLength={200}
                    onChange={(event) => setTitle(event.target.value)}
                    className="h-11 rounded-xl"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
                  <Field
                    label={text.fields.description}
                    error={errors.description?.message}
                  >
                    <textarea
                      {...register("description")}
                      aria-invalid={Boolean(errors.description)}
                      rows={3}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      className={textareaClass}
                    />
                  </Field>
                  <Field
                    label={text.fields.priority}
                    error={errors.priority?.message}
                  >
                    <select
                      {...register("priority")}
                      aria-invalid={Boolean(errors.priority)}
                      value={priority}
                      onChange={(event) =>
                        setPriority(event.target.value as TaskPriority)
                      }
                      className={selectClass}
                    >
                      {(
                        ["LOW", "MEDIUM", "HIGH", "STRATEGIC"] as TaskPriority[]
                      ).map((value) => (
                        <option key={value} value={value}>
                          {text.priorities[value]}
                        </option>
                      ))}
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
                <Field
                  label={text.fields.company}
                  error={errors.companyId?.message}
                >
                  <SearchableCompanySelect
                    value={companyId || undefined}
                    onChange={changeCompany}
                    disabled={lockCompany}
                    placeholder={text.placeholders.company}
                  />
                </Field>

                <Field
                  label={text.fields.opportunity}
                  error={errors.opportunity?.message}
                >
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

                <Field
                  label={text.fields.person}
                  error={errors.person?.message}
                >
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

                <Field
                  label={text.fields.commercialDocument}
                  error={errors.document?.message}
                >
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

                <Field
                  label={text.fields.payment}
                  error={errors.payment?.message}
                >
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
              <Field
                label={text.fields.assignee}
                error={errors.assignee?.message}
              >
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
                <Field label={text.fields.dueAt} error={errors.dueAt?.message}>
                  <PersianDateTimePicker value={dueAt} onChange={setDueAt} />
                </Field>
                <Field
                  label={text.fields.reminderAt}
                  error={errors.reminderAt?.message}
                >
                  <PersianDateTimePicker
                    value={reminderAt}
                    onChange={setReminderAt}
                  />
                </Field>
              </div>
            </FormSection>

            {validation ? (
              <p className="rounded-xl border border-[var(--destructive)]/20 bg-[var(--destructive-soft)] px-3 py-2 text-xs text-[var(--destructive)]">
                {validation}
              </p>
            ) : null}
          </FormDialogBody>

          <FormDialogFooter>
            <FormActions
              onCancel={() => onOpenChange(false)}
              pending={pending}
              disabled={Boolean(validation)}
            />
          </FormDialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  children,
  error,
}: {
  label: string
  children: ReactNode
  error?: string
}) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-xs font-bold text-[var(--app-heading)]">
        {label}
      </span>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </label>
  )
}

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus:border-[var(--app-primary)]"
const textareaClass =
  "w-full resize-none rounded-xl border border-input bg-transparent p-3 text-sm outline-none focus:border-[var(--app-primary)]"

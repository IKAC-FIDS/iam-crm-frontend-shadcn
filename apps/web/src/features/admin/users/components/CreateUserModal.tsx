import { uiText } from "@/config/uiText"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import { DialogHeroHeader } from "@/components/shared/DialogHeroHeader"
import { FormActions } from "@/components/shared/FormActions"
import { FormSection } from "@/components/shared/FormSection"
import { Input } from "@workspace/ui/components/input"
import { applyServerFieldErrors } from "@/lib/formErrors"
import {
  USER_ROLES,
  USER_ROLE_LABELS,
  type Team,
  type Role,
} from "../api/adminUsersApi"
import { useCreateAdminUser } from "../hooks/useCreateAdminUser"
import { createUserSchema, type CreateUserValues } from "../schemas/createUser"

const defaults: CreateUserValues = {
  fullName: "",
  email: "",
  password: "",
  roleChoice: "BASE:REP",
  teamId: "",
}
const fieldNames = [
  "fullName",
  "email",
  "password",
  "roleChoice",
  "teamId",
] as const
const labels = uiText.adminUsers.fields

export function CreateUserModal({
  open,
  onClose,
  teams,
  roles,
  canChangeRole,
  canUseTeams,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  teams: Team[]
  roles: Role[]
  canChangeRole: boolean
  canUseTeams: boolean
  onCreated: (id: string) => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: defaults,
  })
  const mutation = useCreateAdminUser()
  useEffect(() => {
    if (open) reset(defaults)
  }, [open, reset])
  const pending = mutation.isPending || isSubmitting
  async function submit(values: CreateUserValues) {
    clearErrors()
    try {
      const user = await mutation.mutateAsync({ values, roles, canChangeRole })
      toast.success("کاربر با موفقیت ایجاد شد.")
      await onCreated(user.id)
    } catch (error) {
      applyServerFieldErrors(error, setError, fieldNames, {
        role: "roleChoice",
        roleId: "roleChoice",
      })
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="grid max-h-[92dvh] w-[calc(100%_-_1.5rem)] max-w-2xl grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-[26px] p-0 sm:max-w-2xl"
      >
        <DialogHeroHeader
          title={uiText.adminUsers.create}
          description="هویت، نقش و تیم اولیه کاربر را مشخص کنید."
          onClose={onClose}
        />
        <form
          onSubmit={handleSubmit(submit)}
          noValidate
          className="grid min-h-0 auto-rows-max gap-5 overflow-y-auto p-4 sm:p-5"
        >
          <FormSection title="اطلاعات کاربر">
            <div className="grid gap-4 sm:grid-cols-2">
              {fieldNames.map((name) => {
                const id = `create-user-${name}`
                return (
                  <div
                    key={name}
                    className={name === "fullName" ? "sm:col-span-2" : ""}
                  >
                    <label
                      htmlFor={id}
                      className="mb-1.5 block text-xs font-bold text-muted-foreground"
                    >
                      {labels[name]}
                      {name !== "teamId" ? " *" : ""}
                    </label>
                    {name === "roleChoice" ? (
                      <select
                        id={id}
                        {...register(name)}
                        aria-invalid={Boolean(errors[name])}
                        aria-describedby={
                          errors[name] ? `${id}-error` : undefined
                        }
                        className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                      >
                        <optgroup label="نقش‌های پایه">
                          {USER_ROLES.map((role) => (
                            <option key={role} value={`BASE:${role}`}>
                              {USER_ROLE_LABELS[role]}
                            </option>
                          ))}
                        </optgroup>
                        {canChangeRole && roles.length ? (
                          <optgroup label="نقش‌های سفارشی">
                            {roles
                              .filter((role) => role.isActive !== false)
                              .map((role) => (
                                <option key={role.id} value={`ROLE:${role.id}`}>
                                  {role.name} —{" "}
                                  {USER_ROLE_LABELS[role.baseRole]}
                                </option>
                              ))}
                          </optgroup>
                        ) : null}
                      </select>
                    ) : name === "teamId" ? (
                      <select
                        id={id}
                        {...register(name)}
                        disabled={!canUseTeams}
                        aria-invalid={Boolean(errors[name])}
                        aria-describedby={
                          errors[name] ? `${id}-error` : undefined
                        }
                        className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                      >
                        <option value="">{uiText.adminUsers.noTeam}</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id={id}
                        {...register(name)}
                        type={
                          name === "password"
                            ? "password"
                            : name === "email"
                              ? "email"
                              : "text"
                        }
                        dir={name === "fullName" ? "rtl" : "ltr"}
                        autoComplete={
                          name === "password" ? "new-password" : undefined
                        }
                        aria-invalid={Boolean(errors[name])}
                        aria-describedby={
                          errors[name] ? `${id}-error` : undefined
                        }
                      />
                    )}
                    {errors[name] ? (
                      <p
                        id={`${id}-error`}
                        className="mt-1 text-xs text-destructive"
                      >
                        {errors[name]?.message}
                      </p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </FormSection>
          <p className="rounded-2xl bg-muted/45 p-4 text-xs leading-6 text-muted-foreground">
            نقش سفارشی در صورت داشتن مجوز تغییر نقش، بلافاصله پس از ساخت حساب
            تخصیص داده می‌شود.
          </p>
          {errors.root?.server ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.root.server.message}
            </p>
          ) : null}
          <FormActions
            onCancel={onClose}
            pending={pending}
            submitLabel="ثبت کاربر"
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}

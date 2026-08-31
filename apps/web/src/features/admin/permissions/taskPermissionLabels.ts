import type { ManagedPermission } from "./api/adminPermissionsApi"

const TASK_PERMISSION_META: Record<string, { label: string; description: string }> = {
  "task:view": { label: "مشاهده کارها", description: "مشاهده کارهای قابل دسترس کاربر" },
  "task:view-team": { label: "مشاهده کارهای تیم", description: "مشاهده کارهای اعضای تیم کاربر" },
  "task:view-organization": { label: "مشاهده کارهای سازمان", description: "مشاهده کارهای همه تیم‌های سازمان" },
  "task:create": { label: "ثبت کار", description: "ایجاد کار برای خود؛ ارجاع به دیگران به task:assign نیاز دارد" },
  "task:create-subtask": { label: "ایجاد زیرکار", description: "ایجاد زیرکار در کارهای موجود" },
  "task:update": { label: "ویرایش کار", description: "ویرایش اطلاعات کار، بدون اختیار مستقل برای تغییر مسئول" },
  "task:assign": { label: "ارجاع کار به سایر کاربران یا تیم‌ها", description: "انتخاب کاربر، تیم یا دامنه سازمان هنگام ایجاد یا ارجاع" },
  "task:reassign": { label: "تغییر مسئول کار موجود", description: "تغییر مسئول، تیم یا دامنه واگذاری یک کار موجود" },
  "task:complete": { label: "تکمیل کار", description: "ثبت انجام‌شدن کار" },
  "task:delete": { label: "حذف کار", description: "حذف کار مطابق قواعد سامانه" },
}

export function groupName(permission: ManagedPermission) {
  if (permission.action.startsWith("task:")) return "کارها / مدیریت کار"
  return permission.group?.trim() || permission.action.split(":")[0] || "سایر"
}

function actionVerb(permission: ManagedPermission) {
  if (TASK_PERMISSION_META[permission.action]) return TASK_PERMISSION_META[permission.action].label
  return permission.action.split(":")[1] || permission.action
}

export function permissionLabel(permission: ManagedPermission) {
  return TASK_PERMISSION_META[permission.action]?.label || permission.name || actionVerb(permission)
}

export function permissionDescription(permission: ManagedPermission) {
  return TASK_PERMISSION_META[permission.action]?.description || permission.description
}

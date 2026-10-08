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

const COLLABORATION_PERMISSION_META: Record<string, { label: string; description: string }> = {
  "collaboration:view": { label: "مشاهده مرکز همکاری", description: "مشاهده موضوع‌ها، کانال‌ها و گفتگوهای قابل دسترس" },
  "collaboration:topic:create": { label: "ایجاد موضوع", description: "ایجاد موضوع در مرکز همکاری" },
  "collaboration:topic:update": { label: "ویرایش موضوع", description: "ویرایش نام، توضیح و دسته‌بندی موضوع" },
  "collaboration:topic:delete": { label: "بایگانی موضوع", description: "بایگانی موضوع و همه کانال‌های آن" },
  "collaboration:channel:create": { label: "ایجاد کانال", description: "ایجاد کانال عمومی یا خصوصی" },
  "collaboration:channel:update": { label: "ویرایش کانال", description: "ویرایش مشخصات و سطح مشاهده کانال" },
  "collaboration:channel:delete": { label: "بایگانی کانال", description: "بایگانی کانال بدون حذف گفتگوها" },
  "collaboration:member:manage": { label: "مدیریت اعضای کانال", description: "افزودن و حذف اعضای کانال‌های قابل دسترس" },
}

export function groupName(permission: ManagedPermission) {
  if (permission.action.startsWith("task:")) return "کارها / مدیریت کار"
  if (permission.action.startsWith("collaboration:")) return "مرکز همکاری"
  return permission.group?.trim() || permission.action.split(":")[0] || "سایر"
}

function actionVerb(permission: ManagedPermission) {
  if (TASK_PERMISSION_META[permission.action]) return TASK_PERMISSION_META[permission.action].label
  return permission.action.split(":")[1] || permission.action
}

export function permissionLabel(permission: ManagedPermission) {
  return TASK_PERMISSION_META[permission.action]?.label || COLLABORATION_PERMISSION_META[permission.action]?.label || permission.name || actionVerb(permission)
}

export function permissionDescription(permission: ManagedPermission) {
  return TASK_PERMISSION_META[permission.action]?.description || COLLABORATION_PERMISSION_META[permission.action]?.description || permission.description
}

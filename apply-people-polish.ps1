
$ErrorActionPreference = "Stop"

$uiTextPath = "apps/web/src/config/uiText.ts"

if (-not (Test-Path $uiTextPath)) {
    throw "uiText.ts not found. Run this script from the repository root."
}

# Read UTF-8 safely, with or without BOM.
$content = [System.IO.File]::ReadAllText(
    (Resolve-Path $uiTextPath),
    [System.Text.Encoding]::UTF8
)

$peopleBlock = @'
  people: {
    hero: {
      badge: "فضای هوشمند ارتباط با افراد",
      title: "افراد و ارتباطات",
      description:
        "نمایی یکپارچه از تصمیم‌گیرندگان، مخاطبان کلیدی و شبکه ارتباطی مشتریان برای دسترسی سریع‌تر به زمینه فروش.",
    },
    actions: {
      create: "افزودن فرد",
      edit: "ویرایش",
      delete: "حذف",
      save: "ذخیره تغییرات",
      close: "بستن",
    },
    metrics: {
      total: "کل افراد",
      primaryCurrentPage: "مخاطب اصلی در این صفحه",
      phoneCurrentPage: "دارای تلفن در این صفحه",
      emailCurrentPage: "دارای ایمیل در این صفحه",
      currentPageHint: "بر اساس صفحه جاری",
    },
    filters: {
      searchPlaceholder: "جستجو در نام، سمت، شرکت، ایمیل یا تلفن...",
      allCompanies: "همه شرکت‌ها",
      jobTitle: "سمت سازمانی",
      department: "دپارتمان",
      allContactRoles: "همه مخاطبان",
      notPrimary: "غیر اصلی",
      quickFilters: "فیلتر سریع",
      hasPhone: "دارای تلفن",
      hasEmail: "دارای ایمیل",
    },
    contactRole: {
      normal: "مخاطب عادی",
      primary: "مخاطب اصلی",
      secondary: "مخاطب دوم",
      primaryShort: "اصلی",
    },
    fields: {
      fullName: "نام کامل",
      company: "شرکت",
      jobTitle: "سمت سازمانی",
      department: "دپارتمان",
      personaRole: "نقش در فرآیند خرید",
      seniorityLevel: "سطح ارشدیت",
      contactRole: "نقش ارتباطی",
      phone: "تلفن",
      email: "ایمیل",
      linkedin: "لینکدین",
      owner: "مالک حساب",
      ownerTeam: "تیم مالک حساب",
      createdAt: "تاریخ ایجاد",
      updatedAt: "آخرین بروزرسانی",
    },
    sections: {
      profile: "پروفایل ارتباطی",
      contacts: "راه‌های ارتباطی",
      socials: "هویت اجتماعی",
      career: "مسیر شغلی",
      education: "تحصیلات",
    },
    form: {
      createTitle: "افزودن فرد جدید",
      editTitle: "ویرایش اطلاعات فرد",
      description:
        "پروفایل ارتباطی فرد را با تمرکز بر جایگاه سازمانی، نقش در فرآیند خرید و داده‌های تماس ثبت کنید.",
      identityTitle: "هویت و جایگاه سازمانی",
      identityDescription:
        "اطلاعات اصلی فرد و جایگاه او در ساختار سازمان مشتری.",
      salesProfileTitle: "پروفایل فروش و ارتباط",
      salesProfileDescription:
        "اطلاعاتی که برای شناخت نقش فرد در فرآیند خرید و برقراری ارتباط استفاده می‌شود.",
      selectCompany: "انتخاب شرکت",
    },
    career: {
      current: "سمت فعلی",
    },
    lookups: {
      personaRoles: {
        FINAL_DECISION_MAKER: "تصمیم‌گیر نهایی",
        TECHNICAL_DECISION_MAKER: "تصمیم‌گیر فنی",
        PROCUREMENT_ROLE: "مسئول خرید",
        PROCUREMENT: "خرید و تدارکات",
        INFLUENCER: "اثرگذار",
        CHAMPION: "حامی داخلی",
        GATEKEEPER: "دروازه‌بان",
        USER: "کاربر",
        EXPERT: "متخصص",
      },
      seniorityLevels: {
        C_LEVEL: "مدیر ارشد",
        EXECUTIVE: "مدیر اجرایی",
        DIRECTOR: "مدیر",
        MANAGER: "مدیر میانی",
        LEAD: "سرپرست",
        SENIOR: "ارشد",
        MID: "میانی",
        JUNIOR: "کارشناس",
        EXPERT: "متخصص",
      },
    },
    empty: {
      listTitle: "فردی مطابق فیلترها پیدا نشد",
      listDescription:
        "فیلترها را تغییر دهید یا در صورت داشتن مجوز، فرد جدیدی به CRM اضافه کنید.",
      contacts: "راه ارتباطی ثبت نشده است.",
      socials: "شبکه اجتماعی ثبت نشده است.",
      career: "سابقه شغلی ثبت نشده است.",
      education: "سابقه تحصیلی ثبت نشده است.",
    },
    errors: {
      listTitle: "دریافت فهرست افراد انجام نشد",
      listDescription:
        "در حال حاضر امکان دریافت فهرست افراد از سرور وجود ندارد. دوباره تلاش کنید.",
      detailTitle: "دریافت اطلاعات فرد انجام نشد",
      detailDescription:
        "پروفایل این فرد در حال حاضر قابل دریافت نیست. دوباره تلاش کنید.",
    },
    delete: {
      title: "حذف فرد",
      description:
        "آیا از حذف این فرد اطمینان دارید؟ این عملیات برای جلوگیری از حذف ناخواسته نیازمند تأیید نهایی است.",
    },
    notSpecified: "ثبت نشده",
  },
'@

$pattern = '(?ms)^  people:\s*\{.*?^  profile:\s*\{'

if (-not [System.Text.RegularExpressions.Regex]::IsMatch($content, $pattern)) {
    throw "Could not find the existing uiText.people block. No changes were made."
}

$replacement = $peopleBlock + "`r`n`r`n  profile: {"
$updated = [System.Text.RegularExpressions.Regex]::Replace(
    $content,
    $pattern,
    [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $replacement },
    1
)

# Write UTF-8 WITHOUT BOM to avoid the mojibake issue.
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText(
    (Resolve-Path $uiTextPath),
    $updated,
    $utf8NoBom
)

Write-Host "uiText.people replaced successfully in UTF-8 without BOM."

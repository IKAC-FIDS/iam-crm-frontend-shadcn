export const uiText = {
  app: {
    name: "NESHANE CRM",
    tagline: "فضای کاری امن و یکپارچه",
    workspaceSubtitle: "فضای کاری مدیریت ارتباط با مشتری",
  },

  common: {
    home: "خانه",
    profile: "پروفایل",
    logout: "خروج",
    loggingOut: "در حال خروج...",
    logoutFromAccount: "خروج از حساب",
    notifications: "اعلان‌ها",
    accountSecurity: "امنیت حساب",
    openCloseMainMenu: "باز و بسته کردن منوی اصلی",
    underDevelopment: "در حال توسعه",
    notAvailable: "-",
    fallbackUserInitial: "U",
  },

  navigation: {
    groups: {
      sales: "عملیات فروش",
      management: "مدیریت",
      account: "حساب",
    },
    dashboard: "داشبورد",
    companies: "شرکت‌ها",
    opportunities: "فرصت‌ها",
    pipeline: "پایپ‌لاین",
    tasks: "کارها",
    meetings: "جلسات",
    followUps: "پیگیری‌ها",
    notifications: "اعلان‌ها",
    people: "افراد",
    activities: "فعالیت‌ها",
    reports: "گزارش‌ها",
    users: "کاربران",
    teams: "تیم‌ها",
    exchangeRates: "نرخ دلار",
    rolesAndPermissions: "نقش‌ها و مجوزها",
    libraries: "کتابخانه‌ها",
    pipelineSettings: "تنظیمات پایپ‌لاین",
    auditLogs: "رویدادهای ممیزی",
    accountSecurity: "امنیت حساب",
    usageAndQuota: "مصرف و سهمیه",
  },

  auth: {
    login: {
      title: "خوش آمدید",
      description: "برای ورود به سامانه، اطلاعات حساب کاربری خود را وارد کنید.",
      emailLabel: "ایمیل سازمانی",
      emailPlaceholder: "your_mail@rsa.ir",
      passwordLabel: "رمز عبور",
      forgotPassword: "رمز عبور را فراموش کرده‌اید؟",
      submit: "ورود به سامانه",
      submitting: "در حال ورود...",
      passkeyNotice: "ورود با Passkey و حساب سازمانی در مرحله بعدی فعال خواهد شد.",
      accessNotice: "دسترسی به سامانه مطابق سطح مجوز سازمانی شما کنترل می‌شود.",
      passwordVisibility: {
        show: "نمایش رمز عبور",
        hide: "مخفی کردن رمز عبور",
      },
      validation: {
        invalidEmail: "ایمیل واردشده معتبر نیست",
        shortPassword: "رمز عبور باید حداقل ۶ کاراکتر باشد",
      },
      errors: {
        loginFailed: "ورود به سامانه انجام نشد",
      },
      hero: {
        badge: "تجربه جدید مدیریت فروش سازمانی",
        headline: "مدیریت ارتباط با مشتری، یکپارچه و هوشمند",
        highlights: [
          "مدیریت متمرکز ارتباط با مشتری",
          "کنترل دسترسی مبتنی بر نقش و مجوز",
          "زیرساخت آماده برای ورود بدون گذرواژه",
        ],
      },
    },
  },

  dashboard: {
    welcomeBadge: "فضای کاری مدیریت فروش",
    welcomeTitlePrefix: "خوش آمدید،",
    welcomeDescription: "داشبورد مدیریتی شما آماده است. اطلاعات، فرصت‌ها و فعالیت‌های مرتبط با سطح دسترسی شما از این فضا در دسترس خواهد بود.",
    actions: {
      opportunities: "مشاهده فرصت‌ها",
      activities: "مشاهده فعالیت‌ها",
    },
    nextStep: {
      title: "داشبورد تحلیلی",
      description: "در مرحله بعد، شاخص‌های فروش، وضعیت پایپ‌لاین، فرصت‌های فعال و فعالیت‌های کلیدی به این بخش اضافه می‌شوند.",
    },
  },

  profile: {
    title: "پروفایل کاربری",
    description: "اطلاعات حساب، هویت سازمانی و سطح دسترسی نشست فعلی",
    cards: {
      userName: "نام کاربر",
      organizationRole: "نقش سازمانی",
      permissionCount: "تعداد مجوزها",
      sessionStatus: "وضعیت نشست",
      sessionActive: "فعال",
    },
    account: {
      title: "اطلاعات حساب جاری",
      description: "اطلاعات احراز هویت و سطح دسترسی نشست فعلی",
      fields: {
        name: "نام",
        email: "ایمیل",
        role: "نقش",
        permissionCount: "تعداد مجوزها",
      },
    },
  },

  placeholders: {
    badge: "در حال توسعه",
    description: "پوسته این بخش آماده شده است. قابلیت‌های عملیاتی و اتصال به API در مراحل بعدی به این صفحه اضافه خواهد شد.",
  },

  date: {
    pickDate: "انتخاب تاریخ",
    pickDateTime: "انتخاب تاریخ و ساعت",
    pickDateRange: "انتخاب بازه تاریخ",
    rangeSeparator: "تا",
  },

  errors: {
    route: {
      title: "خطایی در نمایش صفحه رخ داد",
      description: "بخشی از رابط کاربری با خطا مواجه شد. می‌توانید به داشبورد بازگردید و دوباره تلاش کنید.",
      backToDashboard: "بازگشت به داشبورد",
    },
  },
} as const

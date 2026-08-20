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
    retry: "تلاش دوباره",
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
      description:
        "برای ورود به سامانه، اطلاعات حساب کاربری خود را وارد کنید.",
      emailLabel: "ایمیل سازمانی",
      emailPlaceholder: "your_mail@rsa.ir",
      passwordLabel: "رمز عبور",
      passwordPlaceholder: "••••••••",
      forgotPassword: "رمز عبور را فراموش کرده‌اید؟",
      submit: "ورود به سامانه",
      submitting: "در حال ورود...",
      passkeyNotice:
        "ورود با Passkey و حساب سازمانی در مرحله بعدی فعال خواهد شد.",
      accessNotice:
        "دسترسی به سامانه مطابق سطح مجوز سازمانی شما کنترل می‌شود.",
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
    hero: {
      badge: "نمای زنده عملکرد فروش",
      greeting: "سلام،",
      description:
        "تصویری یکپارچه از ارزش پایپ‌لاین، عملکرد فروش و نقاطی که امروز به توجه شما نیاز دارند.",
      limitedDescription:
        "فضای کاری شما آماده است. گزینه‌های در دسترس بر اساس مجوزهای سازمانی شما نمایش داده می‌شوند.",
      stats: {
        winRate: "نرخ موفقیت دوره",
        activeCount: "فرصت فعال",
      },
    },

    actions: {
      opportunities: "مشاهده فرصت‌ها",
      companies: "مشاهده شرکت‌ها",
      activities: "مشاهده فعالیت‌ها",
    },

    permissions: {
      title: "نمای مدیریتی برای این حساب فعال نیست",
      description:
        "برای مشاهده شاخص‌ها و نمودارهای تحلیلی داشبورد، مجوز گزارش‌گیری سازمانی موردنیاز است. سایر بخش‌های مجاز از منوی اصلی در دسترس هستند.",
    },

    units: {
      rial: "ریال",
      opportunity: "فرصت",
    },

    kpis: {
      totalPortfolio: {
        title: "ارزش کل سبد فرصت‌ها",
      },
      activePipeline: {
        title: "ارزش پایپ‌لاین فعال",
        subtitle: "فرصت فعال",
      },
      totalWon: {
        title: "فروش موفق تجمعی",
        subtitle: "فرصت موفق",
      },
      periodWon: {
        title: "فروش موفق دوره",
        subtitle: "فرصت موفق در دوره",
      },
    },

    trend: {
      title: "ریتم ۱۲ ماهه فرصت‌ها",
      modes: {
        count: "تعداد",
        value: "ارزش",
      },
      series: {
        created: "ایجادشده",
        won: "موفق",
        lost: "از دست‌رفته",
      },
      axis: {
        count: "تعداد فرصت",
        value: "ارزش",
        valueHint:
          "مقادیر محور عمودی در حالت ارزش به‌صورت خلاصه نمایش داده می‌شوند.",
      },
      activeSummary: {
        countPrefix: "تعداد فرصت‌های فعال تا",
        valuePrefix: "ارزش فرصت‌های فعال تا",
        monthSuffix: "ماه",
      },
      currentPeriodFallback: "ماه جاری",
      ariaLabel: "نمودار روند دوازده‌ماهه فرصت‌ها",
    },

    status: {
      title: "ترکیب سبد فرصت‌ها",
      description:
        "سهم فرصت‌های فعال، موفق و از دست‌رفته از کل سبد جاری",
      total: "کل فرصت‌ها",
      active: "فعال",
      won: "موفق",
      lost: "از دست‌رفته",
      ariaLabel: "نمودار ترکیب سبد فرصت‌ها",
      legend: {
        countLabel: "تعداد فرصت",
        shareLabel: "سهم از کل",
      },
    },

    attention: {
      title: "نیازمند توجه",
      description:
        "مواردی که از زمان‌بندی مورد انتظار عبور کرده‌اند یا نیاز به اقدام دارند",
      empty: "در حال حاضر مورد فوری قابل نمایشی وجود ندارد.",
      types: {
        opportunity: "فرصت",
        task: "کار",
        meeting: "جلسه",
      },
    },

    recentActivities: {
      title: "آخرین فعالیت‌ها",
      description: "جدیدترین تعاملات ثبت‌شده در محدوده دسترسی شما",
      viewAll: "مشاهده همه",
      empty: "هنوز فعالیتی برای نمایش وجود ندارد.",
      restrictedTitle: "فعالیت‌های اخیر در دسترس نیست",
      restrictedDescription:
        "این بخش فقط برای کاربران دارای مجوز مشاهده فعالیت‌ها نمایش داده می‌شود.",
    },

    errors: {
      summaryTitle: "دریافت اطلاعات داشبورد انجام نشد",
      summaryFallback:
        "در حال حاضر امکان دریافت اطلاعات تحلیلی داشبورد وجود ندارد.",
      activitiesFallback:
        "در حال حاضر امکان دریافت آخرین فعالیت‌ها وجود ندارد.",
      retry: "تلاش دوباره",
    },

    welcomeBadge: "فضای کاری مدیریت فروش",
    welcomeTitlePrefix: "خوش آمدید،",
    welcomeDescription:
      "داشبورد مدیریتی شما آماده است. اطلاعات، فرصت‌ها و فعالیت‌های مرتبط با سطح دسترسی شما از این فضا در دسترس خواهد بود.",
    nextStep: {
      title: "داشبورد تحلیلی",
      description:
        "در مرحله بعد، شاخص‌های فروش، وضعیت پایپ‌لاین، فرصت‌های فعال و فعالیت‌های کلیدی به این بخش اضافه می‌شوند.",
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
    description:
      "پوسته این بخش آماده شده است. قابلیت‌های عملیاتی و اتصال به API در مراحل بعدی به این صفحه اضافه خواهد شد.",
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
      description:
        "بخشی از رابط کاربری با خطا مواجه شد. می‌توانید به داشبورد بازگردید و دوباره تلاش کنید.",
      backToDashboard: "بازگشت به داشبورد",
    },
  },
} as const

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
    confirm: "تأیید",
    cancel: "انصراف",
    processing: "در حال انجام...",
    table: {
      searchPlaceholder: "جستجو...",
      clearFilters: "پاک کردن فیلترها",
    },
    pagination: {
      page: "صفحه",
      of: "از",
      previous: "قبلی",
      next: "بعدی",
    },
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
      totalPortfolio: { title: "ارزش کل سبد فرصت‌ها" },
      activePipeline: { title: "ارزش پایپ‌لاین فعال", subtitle: "فرصت فعال" },
      totalWon: { title: "فروش موفق تجمعی", subtitle: "فرصت موفق" },
      periodWon: { title: "فروش موفق دوره", subtitle: "فرصت موفق در دوره" },
    },
    trend: {
      title: "ریتم ۱۲ ماهه فرصت‌ها",
      modes: { count: "تعداد", value: "ارزش" },
      series: { created: "ایجادشده", won: "موفق", lost: "از دست‌رفته" },
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
      description: "سهم فرصت‌های فعال، موفق و از دست‌رفته از کل سبد جاری",
      total: "کل فرصت‌ها",
      active: "فعال",
      won: "موفق",
      lost: "از دست‌رفته",
      ariaLabel: "نمودار ترکیب سبد فرصت‌ها",
      legend: { countLabel: "تعداد فرصت", shareLabel: "سهم از کل" },
    },
    attention: {
      title: "نیازمند توجه",
      description:
        "مواردی که از زمان‌بندی مورد انتظار عبور کرده‌اند یا نیاز به اقدام دارند",
      empty: "در حال حاضر مورد فوری قابل نمایشی وجود ندارد.",
      types: { opportunity: "فرصت", task: "کار", meeting: "جلسه" },
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

  companies: {
    list: {
      title: "شرکت‌ها",
      description:
        "نمای یکپارچه مشتریان سازمانی، مالکیت حساب‌ها و وضعیت ارتباطات فروش",
      create: "ایجاد شرکت",
      searchPlaceholder: "جستجو در نام، صنعت، شهر یا شماره تماس...",
      unassigned: "بدون مالک",
      archived: "بایگانی‌شده",
      active: "فعال",
      openCompany: "مشاهده جزئیات شرکت",
      columns: {
        company: "شرکت",
        industry: "صنعت",
        priority: "اولویت",
        owner: "مالک",
        status: "وضعیت",
        updatedAt: "آخرین بروزرسانی",
      },
      filters: {
        allPriorities: "همه اولویت‌ها",
        allOwners: "همه مالکیت‌ها",
        mine: "شرکت‌های من",
        team: "تیم من",
        unassigned: "بدون مالک",
        activeOnly: "فعال",
        archivedOnly: "بایگانی‌شده",
        allArchiveStates: "همه وضعیت‌ها",
      },
      priorities: {
        LOW: "کم",
        MEDIUM: "متوسط",
        HIGH: "زیاد",
        STRATEGIC: "استراتژیک",
      },
      emptyTitle: "شرکتی برای نمایش وجود ندارد",
      emptyDescription:
        "فیلترها را تغییر دهید یا در صورت داشتن مجوز، یک شرکت جدید ایجاد کنید.",
      errorTitle: "دریافت فهرست شرکت‌ها انجام نشد",
      errorDescription:
        "امکان دریافت اطلاعات شرکت‌ها از سرور وجود ندارد. دوباره تلاش کنید.",
    },

    detail: {
      back: "بازگشت به شرکت‌ها",
      edit: "ویرایش شرکت",
      active: "فعال",
      archived: "بایگانی‌شده",
      unassigned: "بدون مالک",
      notSpecified: "ثبت نشده",
      errorTitle: "دریافت اطلاعات شرکت انجام نشد",
      errorDescription:
        "اطلاعات این شرکت در حال حاضر قابل دریافت نیست. دوباره تلاش کنید.",
      metrics: {
        pipelineValue: "ارزش پایپ‌لاین فعال",
        pipelineHint: "جمع فرصت‌های غیرنهایی",
        openOpportunities: "فرصت فعال",
        people: "افراد مرتبط",
        lastInteraction: "آخرین تعامل",
      },
      sections: {
        overview: "تصویر کلی شرکت",
        overviewDescription:
          "اطلاعات کلیدی حساب برای تصمیم‌گیری سریع در یک نگاه",
        opportunities: "فرصت‌های فروش",
        opportunitiesDescription:
          "آخرین فرصت‌های مرتبط با این شرکت و وضعیت فعلی آن‌ها",
        legal: "اطلاعات ثبتی و سازمانی",
        people: "افراد کلیدی",
        peopleDescription: "مخاطبان و افراد ثبت‌شده در این حساب",
        timeline: "خط زمانی تعاملات",
        timelineDescription:
          "آخرین فعالیت‌های ثبت‌شده برای حفظ Context ارتباط با مشتری",
        ecosystem: "اکوسیستم حساب",
        ecosystemDescription:
          "دارایی‌ها و اطلاعات تکمیلی متصل به این شرکت",
      },
      fields: {
        legalName: "نام حقوقی",
        brandName: "نام تجاری",
        industry: "صنعت",
        owner: "مالک حساب",
        team: "تیم مالک",
        city: "شهر / استان",
        phone: "تلفن مرکزی",
        website: "وب‌سایت",
        source: "منبع ورود",
        registrationNumber: "شماره ثبت",
        nationalId: "شناسه ملی",
        economicCode: "کد اقتصادی",
        establishmentDate: "تاریخ تأسیس",
        activityStatus: "وضعیت فعالیت",
        employeeCount: "تعداد پرسنل",
        registeredCapital: "سرمایه ثبتی",
        createdAt: "تاریخ ایجاد",
        updatedAt: "آخرین بروزرسانی",
      },
      empty: {
        opportunitiesTitle: "فرصت فروشی ثبت نشده",
        opportunitiesDescription:
          "هنوز فرصت فروشی برای این شرکت ثبت نشده است.",
        peopleTitle: "فردی ثبت نشده",
        peopleDescription:
          "هنوز فرد یا مخاطبی برای این شرکت ثبت نشده است.",
      },
      timeline: {
        emptyTitle: "فعالیتی ثبت نشده",
        emptyDescription:
          "با ثبت تماس، جلسه یا تعامل بعدی، تاریخچه ارتباط اینجا شکل می‌گیرد.",
        fallbackTitle: "فعالیت شرکت",
      },
      ecosystem: {
        branches: "شعب",
        social: "کانال اجتماعی",
        legalDocuments: "اسناد حقوقی",
        callCard: "کال کارت",
      },
    },

    form: {
      createTitle: "ثبت شرکت جدید",
      createDescription:
        "اطلاعات پایه، بازار و مشخصات ثبتی شرکت را در یک فرم یکپارچه ثبت کنید.",
      editTitle: "ویرایش اطلاعات شرکت",
      editDescription:
        "اطلاعات حساب سازمانی را با حفظ ساختار فعلی و بدون خروج از صفحه بروزرسانی کنید.",
      createSubmit: "ثبت شرکت",
      editSubmit: "ذخیره تغییرات",
      close: "بستن فرم",
      sideBadge: "پروفایل سازمانی",
      previewFallback: "شرکت جدید",
      sideDescription:
        "اطلاعات این فرم هسته پروفایل ۳۶۰ درجه شرکت را می‌سازد و در فرآیندهای فروش استفاده می‌شود.",
      qualityTitle: "ثبت داده با کیفیت",
      qualityDescription:
        "نام حقوقی دقیق و اطلاعات تماس معتبر، جستجو و گزارش‌گیری CRM را قابل‌اعتمادتر می‌کند.",
      journey: {
        identity: "هویت شرکت",
        identityHint: "نام، نوع مالکیت و وضعیت فعالیت",
        market: "بازار و ارتباط",
        marketHint: "صنعت، اولویت، منبع و اطلاعات تماس",
        legal: "اطلاعات ثبتی",
        legalHint: "شناسه‌ها، تاریخ تأسیس و اندازه سازمان",
      },
      sections: {
        identity: "هویت و وضعیت سازمان",
        identityDescription:
          "اطلاعاتی که شرکت را در سطح سازمانی و عملیاتی تعریف می‌کند.",
        market: "پروفایل بازار و ارتباط",
        marketDescription:
          "اطلاعات موردنیاز تیم فروش برای شناخت و برقراری ارتباط با حساب.",
        legal: "اطلاعات ثبتی و اندازه شرکت",
        legalDescription:
          "مشخصات حقوقی و داده‌های سازمانی برای شناخت دقیق‌تر مشتری.",
      },
      fields: {
        legalName: "نام حقوقی",
        brandName: "نام تجاری",
        industry: "صنعت",
        ownership: "نوع مالکیت",
        priority: "اولویت حساب",
        source: "منبع ورود",
        city: "شهر / استان",
        phone: "تلفن مرکزی",
        website: "وب‌سایت",
        activityStatus: "وضعیت فعالیت",
        registrationNumber: "شماره ثبت",
        nationalId: "شناسه ملی",
        economicCode: "کد اقتصادی",
        establishmentDate: "تاریخ تأسیس",
        employeeCount: "تعداد پرسنل",
        registeredCapital: "سرمایه ثبتی",
      },
      placeholders: {
        legalName: "مثلاً شرکت ره‌آورد سامانه‌های امن",
        brandName: "نام تجاری یا نام شناخته‌شده",
        industry: "مثلاً فناوری اطلاعات",
        source: "مثلاً معرفی، رویداد یا وب‌سایت",
        city: "مثلاً تهران",
        phone: "+982112345678",
        website: "https://example.com",
        establishmentDate: "انتخاب تاریخ تأسیس",
      },
      validation: {
        legalNameRequired: "نام حقوقی الزامی است",
        invalidPhone: "شماره تماس معتبر نیست",
        invalidCapital: "سرمایه ثبتی باید عدد معتبر باشد",
        invalidEmployeeCount: "تعداد پرسنل باید عدد صحیح باشد",
      },
      selectPlaceholder: "انتخاب کنید",
      priorities: {
        LOW: "کم",
        MEDIUM: "متوسط",
        HIGH: "زیاد",
        STRATEGIC: "استراتژیک",
      },
      ownerships: {
        PRIVATE: "خصوصی",
        STATE: "دولتی",
        SEMI_STATE: "نیمه‌دولتی",
        PUBLIC_LISTED: "بورسی",
        BANK: "بانک",
        HOLDING: "هلدینگ",
      },
      activityStatuses: {
        ACTIVE: "فعال",
        INACTIVE: "غیرفعال",
        MERGED: "ادغام‌شده",
        UNKNOWN: "نامشخص",
      },
      unsavedHint: "تغییرات ثبت‌نشده دارید.",
      savedStateHint: "فرم آماده ثبت اطلاعات است.",
      submitError:
        "ثبت اطلاعات شرکت انجام نشد. اطلاعات واردشده را بررسی و دوباره تلاش کنید.",
    },
  },

  people: {
    hero: {
      badge: "People Intelligence Workspace",
      title: "Ø§ÙØ±Ø§Ø¯ Ùˆ Ø§Ø±ØªØ¨Ø§Ø·Ø§Øª",
      description:
        "Ù†Ù…Ø§ÛŒÛŒ ÛŒÚ©Ù¾Ø§Ø±Ú†Ù‡ Ø§Ø² ØªØµÙ…ÛŒÙ…â€ŒÚ¯ÛŒØ±Ù†Ø¯Ú¯Ø§Ù†ØŒ Ù…Ø®Ø§Ø·Ø¨Ø§Ù† Ú©Ù„ÛŒØ¯ÛŒ Ùˆ Ø´Ø¨Ú©Ù‡ Ø§Ø±ØªØ¨Ø§Ø·ÛŒ Ù…Ø´ØªØ±ÛŒØ§Ù† Ø¨Ø±Ø§ÛŒ Ø¯Ø³ØªØ±Ø³ÛŒ Ø³Ø±ÛŒØ¹â€ŒØªØ± Ø¨Ù‡ Context ÙØ±ÙˆØ´.",
    },
    actions: {
      create: "Ø§ÙØ²ÙˆØ¯Ù† ÙØ±Ø¯",
      edit: "ÙˆÛŒØ±Ø§ÛŒØ´",
      delete: "Ø­Ø°Ù",
      save: "Ø°Ø®ÛŒØ±Ù‡ ØªØºÛŒÛŒØ±Ø§Øª",
      close: "Ø¨Ø³ØªÙ†",
    },
    metrics: {
      total: "Ú©Ù„ Ø§ÙØ±Ø§Ø¯",
      primaryInPage: "Ù…Ø®Ø§Ø·Ø¨ Ø§ØµÙ„ÛŒ",
      phoneInPage: "Ø¯Ø§Ø±Ø§ÛŒ ØªÙ„ÙÙ†",
      emailInPage: "Ø¯Ø§Ø±Ø§ÛŒ Ø§ÛŒÙ…ÛŒÙ„",
      currentPageHint: "Ø¯Ø± ØµÙØ­Ù‡ Ø¬Ø§Ø±ÛŒ",
    },
    filters: {
      searchPlaceholder: "Ø¬Ø³ØªØ¬Ùˆ Ø¯Ø± Ù†Ø§Ù…ØŒ Ø³Ù…ØªØŒ Ø´Ø±Ú©ØªØŒ Ø§ÛŒÙ…ÛŒÙ„ ÛŒØ§ ØªÙ„ÙÙ†...",
      allCompanies: "Ù‡Ù…Ù‡ Ø´Ø±Ú©Øªâ€ŒÙ‡Ø§",
      jobTitle: "Ø³Ù…Øª Ø³Ø§Ø²Ù…Ø§Ù†ÛŒ",
      department: "Ø¯Ù¾Ø§Ø±ØªÙ…Ø§Ù†",
      allContactRoles: "Ù‡Ù…Ù‡ Ù…Ø®Ø§Ø·Ø¨Ø§Ù†",
      notPrimary: "ØºÛŒØ± Ø§ØµÙ„ÛŒ",
      quickFilters: "ÙÛŒÙ„ØªØ± Ø³Ø±ÛŒØ¹",
      hasPhone: "Ø¯Ø§Ø±Ø§ÛŒ ØªÙ„ÙÙ†",
      hasEmail: "Ø¯Ø§Ø±Ø§ÛŒ Ø§ÛŒÙ…ÛŒÙ„",
    },
    contactRole: {
      normal: "Ø¹Ø§Ø¯ÛŒ",
      primary: "Ù…Ø®Ø§Ø·Ø¨ Ø§ØµÙ„ÛŒ",
      secondary: "Ù…Ø®Ø§Ø·Ø¨ Ø¯ÙˆÙ…",
      primaryShort: "Ø§ØµÙ„ÛŒ",
    },
    fields: {
      fullName: "Ù†Ø§Ù… Ú©Ø§Ù…Ù„",
      company: "Ø´Ø±Ú©Øª",
      jobTitle: "Ø³Ù…Øª Ø³Ø§Ø²Ù…Ø§Ù†ÛŒ",
      department: "Ø¯Ù¾Ø§Ø±ØªÙ…Ø§Ù†",
      personaRole: "Ù†Ù‚Ø´ Ù¾Ø±Ø³ÙˆÙ†Ø§",
      seniorityLevel: "Ø³Ø·Ø­ Ø§Ø±Ø´Ø¯ÛŒØª",
      contactRole: "Ù†Ù‚Ø´ Ø§Ø±ØªØ¨Ø§Ø·ÛŒ",
      phone: "ØªÙ„ÙÙ†",
      email: "Ø§ÛŒÙ…ÛŒÙ„",
      linkedin: "Ù„ÛŒÙ†Ú©Ø¯ÛŒÙ†",
      owner: "Ù…Ø§Ù„Ú© Ø­Ø³Ø§Ø¨",
    },
    sections: {
      profile: "Ù¾Ø±ÙˆÙØ§ÛŒÙ„ Ø§Ø±ØªØ¨Ø§Ø·ÛŒ",
      contacts: "Ø±Ø§Ù‡â€ŒÙ‡Ø§ÛŒ Ø§Ø±ØªØ¨Ø§Ø·ÛŒ",
      socials: "Ù‡ÙˆÛŒØª Ø§Ø¬ØªÙ…Ø§Ø¹ÛŒ",
      career: "Ù…Ø³ÛŒØ± Ø´ØºÙ„ÛŒ",
      education: "ØªØ­ØµÛŒÙ„Ø§Øª",
    },
    form: {
      createTitle: "Ø§ÙØ²ÙˆØ¯Ù† ÙØ±Ø¯ Ø¬Ø¯ÛŒØ¯",
      editTitle: "ÙˆÛŒØ±Ø§ÛŒØ´ Ø§Ø·Ù„Ø§Ø¹Ø§Øª ÙØ±Ø¯",
      description:
        "Ù¾Ø±ÙˆÙØ§ÛŒÙ„ Ø§Ø±ØªØ¨Ø§Ø·ÛŒ ÙØ±Ø¯ Ø±Ø§ Ø¨Ø§ ØªÙ…Ø±Ú©Ø² Ø¨Ø± Ù†Ù‚Ø´ Ø³Ø§Ø²Ù…Ø§Ù†ÛŒØŒ Ø§Ù‡Ù…ÛŒØª Ø§Ø±ØªØ¨Ø§Ø·ÛŒ Ùˆ Ø¯Ø§Ø¯Ù‡â€ŒÙ‡Ø§ÛŒ ØªÙ…Ø§Ø³ Ø«Ø¨Øª Ú©Ù†ÛŒØ¯.",
      identityTitle: "Ù‡ÙˆÛŒØª Ùˆ Ø¬Ø§ÛŒÚ¯Ø§Ù‡ Ø³Ø§Ø²Ù…Ø§Ù†ÛŒ",
      identityDescription:
        "Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø§ØµÙ„ÛŒ ÙØ±Ø¯ Ùˆ Ø¬Ø§ÛŒÚ¯Ø§Ù‡ Ø§Ùˆ Ø¯Ø± Ø³Ø§Ø®ØªØ§Ø± Ø³Ø§Ø²Ù…Ø§Ù† Ù…Ø´ØªØ±ÛŒ.",
      salesProfileTitle: "Ù¾Ø±ÙˆÙØ§ÛŒÙ„ ÙØ±ÙˆØ´ Ùˆ Ø§Ø±ØªØ¨Ø§Ø·",
      salesProfileDescription:
        "Ø§Ø·Ù„Ø§Ø¹Ø§ØªÛŒ Ú©Ù‡ Ø¨Ø±Ø§ÛŒ Ø´Ù†Ø§Ø®Øª Ù†Ù‚Ø´ ÙØ±Ø¯ Ø¯Ø± ÙØ±Ø¢ÛŒÙ†Ø¯ Ø®Ø±ÛŒØ¯ Ùˆ Ø¨Ø±Ù‚Ø±Ø§Ø±ÛŒ Ø§Ø±ØªØ¨Ø§Ø· Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯.",
      selectCompany: "Ø§Ù†ØªØ®Ø§Ø¨ Ø´Ø±Ú©Øª",
    },
    career: {
      current: "Ø³Ù…Øª ÙØ¹Ù„ÛŒ",
    },
    empty: {
      listTitle: "ÙØ±Ø¯ÛŒ Ù…Ø·Ø§Ø¨Ù‚ ÙÛŒÙ„ØªØ±Ù‡Ø§ Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯",
      listDescription:
        "ÙÛŒÙ„ØªØ±Ù‡Ø§ Ø±Ø§ ØªØºÛŒÛŒØ± Ø¯Ù‡ÛŒØ¯ ÛŒØ§ Ø¯Ø± ØµÙˆØ±Øª Ø¯Ø§Ø´ØªÙ† Ù…Ø¬ÙˆØ²ØŒ ÙØ±Ø¯ Ø¬Ø¯ÛŒØ¯ÛŒ Ø¨Ù‡ CRM Ø§Ø¶Ø§ÙÙ‡ Ú©Ù†ÛŒØ¯.",
      contacts: "Ø±Ø§Ù‡ Ø§Ø±ØªØ¨Ø§Ø·ÛŒ Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.",
      socials: "Ø´Ø¨Ú©Ù‡ Ø§Ø¬ØªÙ…Ø§Ø¹ÛŒ Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.",
      career: "Ø³Ø§Ø¨Ù‚Ù‡ Ø´ØºÙ„ÛŒ Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.",
      education: "Ø³Ø§Ø¨Ù‚Ù‡ ØªØ­ØµÛŒÙ„ÛŒ Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.",
    },
    errors: {
      listTitle: "Ø¯Ø±ÛŒØ§ÙØª ÙÙ‡Ø±Ø³Øª Ø§ÙØ±Ø§Ø¯ Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯",
      listDescription:
        "Ø¯Ø± Ø­Ø§Ù„ Ø­Ø§Ø¶Ø± Ø§Ù…Ú©Ø§Ù† Ø¯Ø±ÛŒØ§ÙØª People Directory Ø§Ø² Ø³Ø±ÙˆØ± ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯. Ø¯ÙˆØ¨Ø§Ø±Ù‡ ØªÙ„Ø§Ø´ Ú©Ù†ÛŒØ¯.",
      detailTitle: "Ø¯Ø±ÛŒØ§ÙØª Ø§Ø·Ù„Ø§Ø¹Ø§Øª ÙØ±Ø¯ Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯",
      detailDescription:
        "Ù¾Ø±ÙˆÙØ§ÛŒÙ„ Ø§ÛŒÙ† ÙØ±Ø¯ Ø¯Ø± Ø­Ø§Ù„ Ø­Ø§Ø¶Ø± Ù‚Ø§Ø¨Ù„ Ø¯Ø±ÛŒØ§ÙØª Ù†ÛŒØ³Øª. Ø¯ÙˆØ¨Ø§Ø±Ù‡ ØªÙ„Ø§Ø´ Ú©Ù†ÛŒØ¯.",
    },
    delete: {
      title: "Ø­Ø°Ù ÙØ±Ø¯",
      description:
        "Ø¢ÛŒØ§ Ø§Ø² Ø­Ø°Ù Ø§ÛŒÙ† ÙØ±Ø¯ Ø§Ø·Ù…ÛŒÙ†Ø§Ù† Ø¯Ø§Ø±ÛŒØ¯ØŸ Ø§ÛŒÙ† Ø¹Ù…Ù„ÛŒØ§Øª Ø¨Ø±Ø§ÛŒ Ø¬Ù„ÙˆÚ¯ÛŒØ±ÛŒ Ø§Ø² Ø­Ø°Ù Ù†Ø§Ø®ÙˆØ§Ø³ØªÙ‡ Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ ØªØ£ÛŒÛŒØ¯ Ù†Ù‡Ø§ÛŒÛŒ Ø§Ø³Øª.",
    },
    notSpecified: "Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡",
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
    rangeFrom: "از تاریخ",
    rangeTo: "تا تاریخ",
    rangeSeparator: "تا",
    timeLabel: "ساعت",
    calendar: {
      previousMonth: "ماه قبل",
      nextMonth: "ماه بعد",
      selectMonth: "انتخاب ماه",
      selectYear: "انتخاب سال",
      today: "امروز",
      clear: "پاک کردن",
      weekdays: ["ش", "ی", "د", "س", "چ", "پ", "ج"],
      months: [
        "فروردین",
        "اردیبهشت",
        "خرداد",
        "تیر",
        "مرداد",
        "شهریور",
        "مهر",
        "آبان",
        "آذر",
        "دی",
        "بهمن",
        "اسفند",
      ],
    },
  },

  inputs: {
    currency: {
      defaultUnit: "ریال",
    },
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

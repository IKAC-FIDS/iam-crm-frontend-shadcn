export const uiText = {
  app: {
    name: "NESHANE CRM",
    tagline: "فضای کاری امن و یکپارچه",
  },

  auth: {
    login: {
      title: "خوش آمدید",
      description:
        "برای ورود به سامانه، اطلاعات حساب کاربری خود را وارد کنید.",

      emailLabel: "ایمیل سازمانی",
      emailPlaceholder: "your_mail@rsa.ir",

      passwordLabel: "رمز عبور",
      forgotPassword: "رمز عبور را فراموش کرده‌اید؟",

      submit: "ورود به سامانه",
      submitting: "در حال ورود...",

      passkeyNotice:
        "ورود با Passkey و حساب سازمانی در مرحله بعدی فعال خواهد شد.",

      accessNotice:
        "دسترسی به سامانه مطابق سطح مجوز سازمانی شما کنترل می‌شود.",

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

    passwordVisibility: {
    show: "نمایش رمز عبور",
    hide: "مخفی کردن رمز عبور",
    },
    },
  },
} as const
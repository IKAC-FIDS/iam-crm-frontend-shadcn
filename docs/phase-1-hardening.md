# گزارش اولیه فاز اول سخت‌سازی فرانت (تاریخی)

گزارش به‌روزِ تکمیل، نتایج بررسی‌های فرانت/بک‌اند و موارد باقی‌مانده در [گزارش پذیرش](./phase-1-acceptance.md) ثبت شده است. متن زیر سابقه مرحله قبلی است، نه وضعیت فعلی.

## وضعیت

پیاده‌سازی زیرساخت انجام شده، اما معیار پذیرش «همه بررسی‌ها سبز» هنوز محقق نشده است: lint سراسری به خطاهای از قبل موجود پروژه می‌خورد. هیچ قاعده lint خاموش نشده و CI این خطاها را نادیده نمی‌گیرد. تغییرات محلی‌اند؛ انتشار، push و تغییر بک‌اند انجام نشده است.

## بررسی معماری قبل از تغییر

- Axios با withCredentials و refresh روی 401، accessToken در localStorage و user در Zustand persist بود.
- refresh قبلی حتی در خطای شبکه session را پاک و مرورگر را به login هدایت می‌کرد.
- Router بزرگ، زنجیره exclusion و مسیرهای تکراری account داشت؛ مجوزها جداگانه در Registry و Router تعریف شده بودند.
- مجوزهای مستقیم نرخ ارز و مدیریت نقش‌ها از منوی مربوطه گسترده‌تر بودند.
- مسیر ناشناخته و دسترسی غیرمجاز به dashboard هدایت می‌شدند.
- helper خطا ممکن بود message خام Axios را نمایش دهد.
- ابزار تست و workflow CI وجود نداشت؛ lint پایه UI سه خطا و web سی‌وپنج خطا داشت.
- قرارداد backend به‌صورت فقط‌خواندنی بررسی شد: POST /auth/refresh از کوکی HttpOnly استفاده می‌کند، refresh را rotate می‌کند و accessToken/user برمی‌گرداند. Secure در تنظیم پیش‌فرض production فعال است. تغییری در backend یا تنظیم cookie داده نشد.

## معماری و امنیت session

- accessToken و user فقط در حافظه Zustand نگه‌داری می‌شوند؛ persist حذف شد.
- کلیدهای قدیمی accessToken و auth-storage حذف می‌شوند؛ هیچ refresh token به JavaScript یا storage منتقل نمی‌شود.
- SessionBoundary پیش از نمایش برنامه session را بازیابی می‌کند؛ loading، anonymous و خطای موقت با retry از هم جدا هستند.
- refresh درخواست‌های هم‌زمان در یک tab مشترک است. 401 درخواست‌های محافظت‌شده فقط یک بار retry می‌شود؛ login و endpointهای public Passkey وارد این چرخه نمی‌شوند.
- خطای شبکه/5xx به‌تنهایی نشست معتبر را پاک نمی‌کند؛ 401/403 endpoint refresh نشست را نامعتبر می‌کند.
- revision نشست مانع اعمال refresh دیررس یا مصرف پاسخ متعلق به ورود قبلی می‌شود. تغییر هویت/سازمان نیز پاسخ قبلی را معتبر نمی‌کند.
- logout حافظه و React Query cache را پاک می‌کند و پیش از revoke منتظر پایان rotation جاری می‌ماند؛ در طول آن ورود جدید نمایش داده نمی‌شود. شکست logout سرور پیام هشدار دارد و ادعای revoke موفق نمی‌شود.
- هیچ TLS، کوکی، مجوز backend یا مسیر تجاری تضعیف نشده است. حافظه‌ای‌کردن token جای پیشگیری از XSS را نمی‌گیرد.

## Router و مجوز

مسیرها به public/core/sales/technical/admin/account تقسیم شدند. routeGroup مسیر اصلی و policy را از Registry می‌گیرد؛ detailها و aliasها همان policy را ارث می‌برند. دیگر آرایه‌های مجوز در router.tsx تکرار نمی‌شوند.

دسترسی مستقیم قبلی نرخ ارز و نقش‌ها حفظ شد؛ Registry با همان مجوزهای view/manage هماهنگ شد، بنابراین منو هم با دسترسی واقعی مسیر تطبیق دارد. این اصلاح اختلاف موجود است، نه مجوز جدید.

مرکز فنی authenticated-only باقی مانده و مجوز ساختگی backend اضافه نشد. تست manifest یکتایی مسیرها و هویت مشترک policy را کنترل می‌کند.

Lazy loading عمداً در این فاز انجام نشد؛ اولویت حفظ رفتار و قابل‌آزمون‌کردن ساختار بود. هشدار bundle بزرگ باقی است.

## خطاها

- AppError شامل kind/status/message/fieldErrors/retryable است.
- پیام‌های 401، 403، 404، 409، 422/400، 5xx و شبکه مرکزی و قابل‌فهم‌اند؛ متن خام transport و جزئیات خطای سرور نمایش داده نمی‌شود.
- پیام تجاری 409/validation در envelopeهای پشتیبانی‌شده حفظ می‌شود.
- fieldErrors برای اتصال تدریجی به فرم‌ها آماده است؛ تمام فرم‌های تجاری بازنویسی نشده‌اند.
- PermissionRoute حالت 403 اختصاصی دارد؛ wildcard مسیرها 404 واقعی نمایش می‌دهد و به dashboard نمی‌رود.
- خطای route و retry از کامپوننت مشترک استفاده می‌کنند؛ React Query فقط خطاهای موقت شناخته‌شده را retry می‌کند.

## تست و CI

Vitest، React Testing Library، user-event، jest-dom، jsdom و پوشش V8 به devDependencies اضافه شدند. پنج فایل تست، ۳۰ تست رفتاری دارند؛ snapshot شکننده اضافه نشده است.

سناریوها: normalization کاربر، storage، bootstrap، هم‌زمانی refresh، cookie نامعتبر، شبکه، logout، پاسخ دیررس، retry 401، policy any/all، منو و route، مسیرهای قدیمی/تکراری، 403/404، خطاهای API و Pagination.

GitHub Actions روی push به main و PR با cache وابستگی‌ها اجرا می‌شود:
npm ci → lint → typecheck → test:run → build
هیچ deploy خودکار یا continue-on-error اضافه نشده است. اجرای واقعی GitHub Actions از این محیط تأیید نشده است.

E2E Playwright نصب/اجرا نشده است؛ نقشه سناریوها، ایزوله‌سازی tenant و پیش‌نیازهای cookie/TLS در e2e/README.md ثبت شده‌اند. نبود backend آزمایشی و قرارداد پاک‌سازی داده، مانع اجرای ایمن جریان‌های تجاری است؛ تستی روی داده تولید اجرا نشده است.

## نتیجه فرمان‌ها

| فرمان | نتیجه |
| --- | --- |
| npm ci | موفق؛ ۰ آسیب‌پذیری گزارش‌شده توسط npm |
| npm run lint | ناموفق؛ ۳ خطای قبلی react-refresh در پکیج UI؛ pipeline در همین مرحله متوقف می‌شود |
| npm run lint --workspace web / بررسی مستقیم ESLint | خطاهای قدیمی باقی‌اند؛ پس از انتقال hook موبایل ۳۴ خطا، بدون خطای جدید در زیرساخت تغییرکرده |
| ESLint مسیرهای auth/router/navigation/lib/store/test و تنظیم Vitest | موفق |
| npm run typecheck | موفق در هر دو workspace |
| npm run test:run | موفق؛ ۳۰ تست در ۵ فایل |
| npm run test:coverage | موفق؛ اجرای آن هنگام وجود ۲۸ تست انجام شد؛ coverage فقط ماژول‌های انتخاب‌شده زیرساخت را اندازه می‌گیرد، نه کل برنامه |
| npm run build | موفق؛ هشدارهای قبلی حجم bundle و Vite __dirname باقی است |
| git diff --check | موفق |

typecheck وب قبلاً با tsc --noEmit روی tsconfig دارای references ممکن بود بررسی واقعی فایل‌های اپ را انجام ندهد؛ به tsc -b تغییر کرد. همچنین وابستگی معکوس UI به hook داخل web رفع شد: hook مشترک در UI است و مسیر قبلی web re-export می‌کند.

## بدهی و پیشنهاد مرحله بعد

- اصلاح جداگانه lint قدیمی فرم‌ها/Hookها و exportهای UI؛ تا آن زمان CI قرمز است و این فاز تأیید نهایی ندارد.
- تست واقعی cookie/CORS/Secure روی staging، ورود Passkey، چند tab و logout در قطع شبکه.
- refresh در هر tab dedupe می‌شود، اما هماهنگی rotation میان tabها هنوز پیاده نشده است؛ سیاست grace/reuse backend باید با تست چندتب بررسی شود.
- بررسی CSRF/Origin برای endpointهای کوکی و سیاست production cookie در backend پیشنهاد می‌شود؛ در این تغییر backend دست‌کاری نشده است.
- تکمیل E2E با tenant آزمایشی و fixtures، سپس lazy loading صفحات سنگین.
- اتصال fieldErrors به فرم‌های بیشتر؛ خطاهای عمومی همه فرم‌ها از helper مشترک عبور می‌کنند، ولی فرم‌ها بازطراحی نشده‌اند.

## رفتارهای عمداً حفظ‌شده

URLها، aliasها، فرم‌ها و جریان‌های شرکت/فرصت/جلسه/کار، قیمت‌گذاری، مرکز فنی placeholder، UI فارسی RTL، کتابخانه کامپوننت‌ها، قرارداد endpointها، مقصد dashboard بعد از login، و الزامی‌بودن authorization سمت backend حفظ شدند. تغییرات عمدی UX محدود به bootstrap نشست، retry خطای موقت، صفحه 403 و 404 و پیام‌های امن خطا هستند.

## فایل‌های افزوده‌شده

- .github/workflows/ci.yml
- apps/web/src/app/router/AppErrorPage.tsx
- apps/web/src/app/router/access.test.tsx
- apps/web/src/app/router/manifest.test.tsx
- apps/web/src/app/router/routes/accountRoutes.tsx
- apps/web/src/app/router/routes/adminRoutes.tsx
- apps/web/src/app/router/routes/coreRoutes.tsx
- apps/web/src/app/router/routes/publicRoutes.tsx
- apps/web/src/app/router/routes/routeGroup.tsx
- apps/web/src/app/router/routes/salesRoutes.tsx
- apps/web/src/app/router/routes/technicalRoutes.tsx
- apps/web/src/components/shared/PaginationControls.test.tsx
- apps/web/src/features/auth/components/SessionBoundary.tsx
- apps/web/src/features/auth/services/session.service.ts
- apps/web/src/features/auth/services/session.test.ts
- apps/web/src/lib/appError.test.ts
- apps/web/src/lib/appError.ts
- apps/web/src/lib/httpConfig.ts
- apps/web/src/test/fixtures.ts
- apps/web/src/test/setup.ts
- apps/web/vitest.config.ts
- e2e/README.md
- packages/ui/src/hooks/use-mobile.ts
- docs/phase-1-hardening.md

## فایل‌های تغییرکرده

- .gitignore
- apps/web/package.json
- apps/web/src/app/navigation/routeRegistry.ts
- apps/web/src/app/providers/AppProviders.tsx
- apps/web/src/app/router/PermissionRoute.tsx
- apps/web/src/app/router/ProtectedRoute.tsx
- apps/web/src/app/router/RouteErrorPage.tsx
- apps/web/src/app/router/router.tsx
- apps/web/src/config/uiText.ts
- apps/web/src/features/account/pages/AccountSecurityPage.tsx
- apps/web/src/features/auth/hooks/useAuth.ts
- apps/web/src/features/auth/hooks/usePasskeyLogin.ts
- apps/web/src/features/auth/services/auth.service.ts
- apps/web/src/features/auth/utils/authSession.ts
- apps/web/src/hooks/use-mobile.ts
- apps/web/src/lib/api.ts
- apps/web/src/lib/apiResponse.ts
- apps/web/src/lib/queryClient.ts
- apps/web/src/store/authStore.ts
- apps/web/tsconfig.node.json
- package-lock.json
- package.json
- packages/ui/src/components/sidebar.tsx

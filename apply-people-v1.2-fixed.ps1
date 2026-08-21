$ErrorActionPreference = "Stop"

$uiTextPath = "apps/web/src/config/uiText.ts"

if (-not (Test-Path $uiTextPath)) {
    throw "uiText.ts not found. Run this script from repository root."
}

$content = [System.IO.File]::ReadAllText(
    (Resolve-Path $uiTextPath),
    [System.Text.Encoding]::UTF8
)

function Replace-OnceLiteral {
    param(
        [string]$Source,
        [string]$OldText,
        [string]$NewText
    )

    $index = $Source.IndexOf($OldText, [System.StringComparison]::Ordinal)
    if ($index -lt 0) {
        return $Source
    }

    return $Source.Substring(0, $index) + $NewText + $Source.Substring($index + $OldText.Length)
}

if ($content -notmatch 'allJobTitles:\s*"همه سمت‌های سازمانی"') {
    $oldFilters = @'
      allCompanies: "همه شرکت‌ها",
'@

    $newFilters = @'
      allCompanies: "همه شرکت‌ها",
      allJobTitles: "همه سمت‌های سازمانی",
      allDepartments: "همه دپارتمان‌ها",
      allPersonaRoles: "همه نقش‌ها در فرآیند خرید",
      allSeniorityLevels: "همه سطوح ارشدیت",
'@

    $content = Replace-OnceLiteral -Source $content -OldText $oldFilters -NewText $newFilters
}

if ($content -notmatch 'selectJobTitle:\s*"انتخاب سمت سازمانی"') {
    $oldForm = @'
      selectCompany: "انتخاب شرکت",
'@

    $newForm = @'
      selectCompany: "انتخاب شرکت",
      selectJobTitle: "انتخاب سمت سازمانی",
      selectDepartment: "انتخاب دپارتمان",
      selectPersonaRole: "انتخاب نقش در فرآیند خرید",
      selectSeniority: "انتخاب سطح ارشدیت",
'@

    $content = Replace-OnceLiteral -Source $content -OldText $oldForm -NewText $newForm
}

if ($content -notmatch '(?m)^\s{4}companySelect:\s*\{') {
    $marker = @'
    contactRole: {
'@

    $insert = @'
    companySelect: {
      placeholder: "انتخاب شرکت",
      searchPlaceholder: "جستجو در نام شرکت، شناسه ملی یا شماره ثبت...",
      loading: "در حال دریافت شرکت‌ها...",
      empty: "شرکتی مطابق جستجو پیدا نشد.",
      clear: "همه شرکت‌ها",
      firstTenHint: "حداکثر ۱۰ نتیجه نمایش داده می‌شود؛ برای یافتن شرکت‌های دیگر جستجو کنید.",
    },

    contactRole: {
'@

    $content = Replace-OnceLiteral -Source $content -OldText $marker -NewText $insert
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText(
    (Resolve-Path $uiTextPath),
    $content,
    $utf8NoBom
)

Write-Host "People V1.2 uiText updated successfully in UTF-8 without BOM."

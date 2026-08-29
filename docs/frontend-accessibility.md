# Frontend accessibility

The frontend targets WCAG 2.2 AA. Native buttons, links, headings, labels and table semantics are preferred. Icon-only actions require an accessible name; statuses include text/dot and never rely only on color. Focus rings must remain visible and dialogs must trap focus and restore it on close.

`jest-axe` runs in the normal Vitest suite for PageHero, DataTableShell, MobileEntityCard, PaginationControls, ResponsiveModal and EntityRowActions. These focused tests complement keyboard and responsive manual QA; they are not a substitute for testing complete authenticated workflows.

| Area                  | Keyboard           | Labels               | Focus                | Axe                | Status             |
| --------------------- | ------------------ | -------------------- | -------------------- | ------------------ | ------------------ |
| Navigation            | Native controls    | Named links/buttons  | Visible focus        | Indirect           | Reviewed           |
| PageHero              | Native actions     | Visible text         | Native order         | Yes                | Covered            |
| Entity lists          | Row Enter/Space    | Table caption/fields | Visible              | Yes                | Covered            |
| Dialogs/forms         | Escape/Tab         | Titles and labels    | Trap/return          | Yes                | Covered            |
| Pagination            | Buttons/select     | ARIA names           | Native               | Yes                | Covered            |
| Action menus          | Trigger/menu keys  | ARIA/title           | Managed by primitive | Yes                | Covered            |
| Dashboard/admin pages | Native composition | Shared primitives    | Normal order         | Component coverage | Manual QA required |

Specialized dense permission and pipeline tables may scroll horizontally. This is intentional; page-level overflow is not.

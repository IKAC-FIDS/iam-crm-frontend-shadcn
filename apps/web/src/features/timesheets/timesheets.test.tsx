import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { user, httpError } from '@/test/fixtures'
import { appMenuRoutes } from '@/app/navigation/routeRegistry'
import { listEntries, saveEntry } from './api'
import { editable, minutesLabel } from './presentation'
import { EntryForm } from './EntryForm'
import { PersonalTimesheetsPage, PersonalLeavePage, ManagerTimesheetsPage, TimesheetReportsPage } from './TimesheetPages'

vi.mock('@/lib/api', () => ({ api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }))
const meta = { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrevious: false }
const row = { id: 'entry', userId: 'someone-else', status: 'DRAFT', type: 'REGULAR', workDate: '2026-09-22', durationMinutes: 90, startMinute: null, endMinute: null, user: { id: 'someone-else', fullName: 'کارمند نمونه' } }
const metrics = { regularWorkedMinutes: 90, approvedOvertimeMinutes: 30, pendingOvertimeMinutes: 50, actualWorkedMinutes: 120, approvedLeaveMinutes: 60, pendingLeaveMinutes: 0, scheduledMinutes: null, attendanceVarianceMinutes: null }
function setup(element: React.ReactNode) { return render(<MemoryRouter><QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>{element}</QueryClientProvider></MemoryRouter>) }
beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ user: { ...user, permissions: ['timesheet:view', 'timesheet:manage', 'leave:view', 'leave:manage', 'timesheet:approve', 'timesheet:report', 'timesheet:export'] } })
  vi.mocked(api.get).mockImplementation(async url => ({ data: String(url).includes('filter-options') ? { success: true, data: { teams: [{ id: 't', name: 'تیم نمونه' }], employees: [{ id: 'u', fullName: 'کارمند نمونه' }] } } : String(url).includes('summary') || String(url).includes('reports') ? { success: true, data: { data: [], totals: metrics, meta, reportingMetadata: { boundaryLeaveRequests: 0 } } } : { success: true, data: [row], meta } }))
  vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: row } })
  vi.mocked(api.patch).mockResolvedValue({ data: { success: true, data: row } })
})
describe('Timesheet contracts', () => {
  it('preserves pagination envelope', async () => { const result = await listEntries('timesheets', false, { page: 1 }); expect(result.meta).toEqual(meta); expect(result.data[0].id).toBe('entry') })
  it('edits using the actual full replacement DTO', async () => { await saveEntry('timesheets', { workDate: '2026-09-22', type: 'OVERTIME', durationMinutes: 50 }, 'entry'); expect(api.patch).toHaveBeenCalledWith('/timesheets/entry', { workDate: '2026-09-22', type: 'OVERTIME', durationMinutes: 50 }) })
  it('does not allow pending or approved cancellation', () => { expect(editable('PENDING')).toBe(false); expect(editable('APPROVED')).toBe(false); expect(editable('REJECTED')).toBe(true) })
  it('formats durations without converting leave into work', () => { expect(minutesLabel(90)).toBe('۱:۳۰'); expect(minutesLabel(null)).toBe('نامشخص') })
  it('registers permissions, not role names', () => { for (const id of ['account-timesheets', 'account-leave', 'admin-timesheets', 'admin-timesheet-reports']) expect(appMenuRoutes.find(route => route.id === id)?.access.type).toBe('permissions') })
})
describe('Timesheet screens', () => {
  it('loads personal list and uses backend summary', async () => { setup(<PersonalTimesheetsPage />); expect(await screen.findByText('کل کار واقعی')).toBeInTheDocument(); await waitFor(() => expect(api.get).toHaveBeenCalledWith('/timesheets/me', expect.anything())); expect(screen.getByRole('button', { name: 'ثبت کارکرد' })).toBeInTheDocument() })
  it('hides create when user has view permission only', async () => { useAuthStore.setState({ user: { ...user, permissions: ['timesheet:view'] } }); setup(<PersonalTimesheetsPage />); await waitFor(() => expect(api.get).toHaveBeenCalled()); expect(screen.queryByRole('button', { name: 'ثبت کارکرد' })).not.toBeInTheDocument() })
  it('creates overtime duration-only draft and prevents missing duration', async () => { setup(<EntryForm domain="timesheets" onClose={vi.fn()} onSaved={vi.fn()} />); fireEvent.change(screen.getByLabelText('نوع'), { target: { value: 'OVERTIME' } }); fireEvent.click(screen.getByRole('button', { name: 'ذخیره پیش‌نویس' })); await waitFor(() => expect(api.post).toHaveBeenCalledWith('/timesheets', expect.objectContaining({ type: 'OVERTIME', durationMinutes: 480 }))) })
  it('populates existing form values', () => { setup(<EntryForm domain="timesheets" entry={row} onClose={vi.fn()} onSaved={vi.fn()} />); expect(screen.getByLabelText('مدت خالص (دقیقه)')).toHaveValue('90') })
  it('creates leave without assuming an eight-hour work day', async () => { setup(<EntryForm domain="leave-requests" onClose={vi.fn()} onSaved={vi.fn()} />); fireEvent.click(screen.getByRole('button', { name: 'ذخیره پیش‌نویس' })); await waitFor(() => expect(api.post).toHaveBeenCalledWith('/leave-requests', expect.objectContaining({ type: 'ANNUAL', unit: 'FULL_DAY' }))); expect(vi.mocked(api.post).mock.calls[0][1]).not.toHaveProperty('requestedMinutes') })
  it('does not offer cancel for pending leave', async () => { vi.mocked(api.get).mockResolvedValue({ data: { data: [{ ...row, type: 'ANNUAL', status: 'PENDING', startDate: '2026-09-22', endDate: '2026-09-22', unit: 'FULL_DAY' }], meta } }); setup(<PersonalLeavePage />); await waitFor(() => expect(api.get).toHaveBeenCalled()); expect(screen.queryByRole('button', { name: 'لغو' })).not.toBeInTheDocument() })
  it('requires rejection reason and refreshes after concurrent decision', async () => {
    vi.mocked(api.get).mockImplementation(async url => ({ data: String(url).includes('filter-options') ? { data: { teams: [], employees: [] } } : { data: [{ ...row, status: 'SUBMITTED' }], meta } }))
    vi.mocked(api.post).mockRejectedValue(httpError(409)); setup(<ManagerTimesheetsPage />)
    fireEvent.click((await screen.findAllByRole('button', { name: 'رد' }))[0]); expect(screen.getByRole('button', { name: 'رد درخواست' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText('دلیل رد'), { target: { value: 'نیاز به اصلاح' } }); fireEvent.click(screen.getByRole('button', { name: 'رد درخواست' }))
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/admin/timesheets/entry/reject', { reason: 'نیاز به اصلاح' }))
    expect((await screen.findAllByText(/وضعیت این درخواست تغییر کرده/)).length).toBeGreaterThan(0)
  })
  it('sends report employee and type filters to the server', async () => {
    setup(<TimesheetReportsPage />)
    fireEvent.click(screen.getByRole('button', { name: 'نوع کار' }))
    fireEvent.click(await screen.findByRole('button', { name: 'اضافه‌کاری' }))
    fireEvent.click(screen.getByRole('button', { name: 'فیلترها' }))
    fireEvent.click(await screen.findByRole('button', { name: 'تیم' }))
    fireEvent.click(await screen.findByRole('button', { name: 'تیم نمونه' }))
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/admin/timesheets/reports', { params: expect.objectContaining({ teamId: 't', entryType: 'OVERTIME' }) }))
  })
  it('renders a single operational card with visible actions instead of a table', async () => {
    setup(<PersonalTimesheetsPage />)
    expect(await screen.findByRole('button', { name: 'ارسال برای تأیید' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'ویرایش' })).toHaveLength(1)
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
  it('explains self approval without granting permission', async () => {
    vi.mocked(api.get).mockImplementation(async url => ({ data: String(url).includes('filter-options') ? { data: { teams: [], employees: [] } } : { data: [{ ...row, userId: user.id, status: 'SUBMITTED' }], meta } }))
    setup(<ManagerTimesheetsPage />)
    expect(await screen.findByText('درخواست شما باید توسط مدیر مجاز دیگری تأیید شود.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'تأیید' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'رد' })).not.toBeInTheDocument()
  })
  it('shows leave metrics without unrelated work metrics', async () => {
    setup(<PersonalLeavePage />)
    expect(await screen.findByText('مرخصی تأییدشده')).toBeInTheDocument()
    expect(screen.queryByText('کل کار واقعی')).not.toBeInTheDocument()
  })
  it('filters the personal list by clicking an overtime metric', async () => {
    setup(<PersonalTimesheetsPage />)
    fireEvent.click(await screen.findByRole('button', { name: /اضافه‌کاری در انتظار/ }))
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/timesheets/me', { params: expect.objectContaining({ type: 'OVERTIME', status: 'SUBMITTED', page: 1 }) }))
  })
  it('restores URL filters and ignores legacy presentation parameters in API requests', async () => {
    render(<MemoryRouter initialEntries={['/account/timesheets?page=2&limit=10&type=OVERTIME&status=SUBMITTED&view=table&startDate=2026-09-01&endDate=2026-09-23']}><QueryClientProvider client={new QueryClient()}><PersonalTimesheetsPage /></QueryClientProvider></MemoryRouter>)
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/timesheets/me', { params: { startDate: '2026-09-01', endDate: '2026-09-23', page: 2, limit: 10, type: 'OVERTIME', status: 'SUBMITTED' } }))
  })
})

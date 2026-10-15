import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ScheduleForm, WorkSchedulesPage } from './WorkSchedulesPage'
import { weekDays } from './presentation'
import { api } from '@/lib/api'
import { appMenuRoutes } from '@/app/navigation/routeRegistry'
vi.mock('@/lib/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }))
function wrapper({ children }: { children: React.ReactNode }) { return <MemoryRouter><QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider></MemoryRouter> }
describe('work schedule setup', () => {
  beforeEach(() => vi.clearAllMocks())
  it('announces loading before rendering list content', () => {
    vi.mocked(api.get).mockImplementation(async () => await new Promise<never>(() => undefined))
    render(<WorkSchedulesPage />, { wrapper })
    expect(screen.getByRole('status', { name: /در حال دریافت اطلاعات/ })).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
  it('shows absent non-working days as holidays, not unknown durations', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [{ id: 's', effectiveFrom: '2026-09-23', effectiveTo: null, days: [6, 0, 1, 2, 3].map(weekday => ({ weekday, regularMinutes: 480 })) }] } })
    render(<WorkSchedulesPage />, { wrapper })
    expect(await screen.findAllByText('تعطیل')).toHaveLength(2)
    expect(screen.queryByText('نامشخص')).not.toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'برنامه‌های کاری سازمان' })).toBeInTheDocument()
    const mobileCard = screen.getByRole('article')
    expect(within(mobileCard).getByText('روزهای کاری')).toBeInTheDocument()
    expect(within(mobileCard).getByText('روزهای تعطیل')).toBeInTheDocument()
    expect(within(mobileCard).getByText('مجموع هفتگی')).toBeInTheDocument()
  })
  it('shows a true empty state with the existing create workflow', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [] } })
    render(<WorkSchedulesPage />, { wrapper })
    expect(await screen.findAllByText('برنامه کاری تعریف نشده است')).toHaveLength(2)
    await userEvent.click(screen.getAllByRole('button', { name: 'ثبت برنامه کاری' }).at(-1)!)
    expect(screen.getByRole('dialog', { name: 'ثبت برنامه کاری سازمان' })).toBeInTheDocument()
  })
  it('offers a safe retry after a recoverable query failure', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('private transport detail')).mockResolvedValue({ data: { data: [] } })
    render(<WorkSchedulesPage />, { wrapper })
    expect(await screen.findByRole('alert')).not.toHaveTextContent('private transport detail')
    await userEvent.click(screen.getByRole('button', { name: 'تلاش دوباره' }))
    expect(await screen.findAllByText('برنامه کاری تعریف نشده است')).toHaveLength(2)
    expect(api.get).toHaveBeenCalledTimes(2)
  })
  it('registers a permission guarded page', () => expect(appMenuRoutes.find(route => route.id === 'admin-work-schedules')?.access).toEqual({ type: 'permissions', mode: 'any', permissions: ['organization:manage'] }));
  it('does not assume eight-hour days or an effective date', () => {
    render(<MemoryRouter><QueryClientProvider client={new QueryClient()}><ScheduleForm onClose={vi.fn()} onSaved={vi.fn()} /></QueryClientProvider></MemoryRouter>);
    weekDays.forEach(day => expect(screen.getByLabelText(`${day.label} (دقیقه)`)).toHaveValue(''));
    expect(screen.getByRole('button', { name: 'ثبت برنامه کاری' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('شنبه (دقیقه)'), { target: { value: '450' } });
    expect(screen.getByText('۷:۳۰')).toBeInTheDocument();
  });
});

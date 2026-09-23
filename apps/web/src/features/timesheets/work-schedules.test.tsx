import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ScheduleForm, weekDays } from './WorkSchedulesPage'
import { appMenuRoutes } from '@/app/navigation/routeRegistry'
vi.mock('@/lib/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }))
describe('work schedule setup', () => {
  it('registers a permission guarded page', () => expect(appMenuRoutes.find(route => route.id === 'admin-work-schedules')?.access).toEqual({ type: 'permissions', mode: 'any', permissions: ['organization:manage'] }));
  it('does not assume eight-hour days or an effective date', () => {
    render(<MemoryRouter><QueryClientProvider client={new QueryClient()}><ScheduleForm onClose={vi.fn()} onSaved={vi.fn()} /></QueryClientProvider></MemoryRouter>);
    weekDays.forEach(day => expect(screen.getByLabelText(`${day.label} (دقیقه)`)).toHaveValue(''));
    expect(screen.getByRole('button', { name: 'ثبت برنامه کاری' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('شنبه (دقیقه)'), { target: { value: '450' } });
    expect(screen.getByText('۷:۳۰')).toBeInTheDocument();
  });
});

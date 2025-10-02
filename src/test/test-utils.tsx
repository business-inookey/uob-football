import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import { NavigationProvider } from '@/contexts/NavigationContext'

// Mock theme provider for tests
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    {children}
  </ThemeProvider>
)

// Mock navigation provider for tests
const MockNavigationProvider = ({ children }: { children: React.ReactNode }) => (
  <NavigationProvider>
    {children}
  </NavigationProvider>
)

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MockThemeProvider>
      <MockNavigationProvider>
        {children}
      </MockNavigationProvider>
    </MockThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Test data factories
export const createMockPlayer = (overrides = {}) => ({
  id: 'test-player-id',
  full_name: 'Test Player',
  primary_position: 'MID' as const,
  current_team: '1s' as const,
  ...overrides,
})

export const createMockTeam = (overrides = {}) => ({
  id: 'test-team-id',
  code: '1s',
  name: 'Firsts',
  ...overrides,
})

export const createMockStat = (overrides = {}) => ({
  player_id: 'test-player-id',
  stat_key: 'pace',
  value: 75,
  team_id: 'test-team-id',
  ...overrides,
})

export const createMockAttendance = (overrides = {}) => ({
  player_id: 'test-player-id',
  team_id: 'test-team-id',
  date: '2024-01-15',
  status: 'present' as const,
  notes: null,
  ...overrides,
})

export const createMockGame = (overrides = {}) => ({
  id: 'test-game-id',
  home_team: 'test-home-team-id',
  away_team: 'test-away-team-id',
  kickoff_at: '2024-01-15T15:00:00Z',
  location: 'Test Stadium',
  notes: 'Test game',
  ...overrides,
})

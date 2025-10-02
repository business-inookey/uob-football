import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import PlayersClient from '@/app/(dashboard)/players/PlayersClient'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock data
const mockPlayers = [
  {
    id: '1',
    full_name: 'John Doe',
    primary_position: 'MID',
    current_team: '1s'
  },
  {
    id: '2',
    full_name: 'Jane Smith',
    primary_position: 'DEF',
    current_team: '1s'
  }
]

const mockTeams = [
  { id: '1', code: '1s', name: 'Firsts' },
  { id: '2', code: '2s', name: 'Seconds' }
]

describe('Players Page Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(
      <PlayersClient 
        players={mockPlayers} 
        teams={mockTeams} 
        selectedTeam="1s"
        router={{} as any}
      />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper heading structure', () => {
    render(
      <PlayersClient 
        players={mockPlayers} 
        teams={mockTeams} 
        selectedTeam="1s"
        router={{} as any}
      />
    )
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/players/i)
  })

  it('should have proper form controls', () => {
    render(
      <PlayersClient 
        players={mockPlayers} 
        teams={mockTeams} 
        selectedTeam="1s"
        router={{} as any}
      />
    )
    
    // Check for team selector
    const teamSelect = screen.getByRole('combobox', { name: /team/i })
    expect(teamSelect).toBeInTheDocument()
    expect(teamSelect).toHaveAttribute('aria-label')
  })

  it('should have proper button accessibility', () => {
    render(
      <PlayersClient 
        players={mockPlayers} 
        teams={mockTeams} 
        selectedTeam="1s"
        router={{} as any}
      />
    )
    
    const importButton = screen.getByRole('button', { name: /import players/i })
    expect(importButton).toBeInTheDocument()
    
    const statsButton = screen.getByRole('button', { name: /enter stats/i })
    expect(statsButton).toBeInTheDocument()
  })

  it('should have proper list structure for players', () => {
    render(
      <PlayersClient 
        players={mockPlayers} 
        teams={mockTeams} 
        selectedTeam="1s"
        router={{} as any}
      />
    )
    
    const playerList = screen.getByRole('list')
    expect(playerList).toBeInTheDocument()
    
    const playerItems = screen.getAllByRole('listitem')
    expect(playerItems).toHaveLength(mockPlayers.length)
  })

  it('should have proper player card accessibility', () => {
    render(
      <PlayersClient 
        players={mockPlayers} 
        teams={mockTeams} 
        selectedTeam="1s"
        router={{} as any}
      />
    )
    
    // Check for player names
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    
    // Check for position badges
    const positionBadges = screen.getAllByText(/MID|DEF/)
    expect(positionBadges).toHaveLength(2)
  })

  it('should have proper loading state accessibility', () => {
    render(
      <PlayersClient 
        players={[]} 
        teams={mockTeams} 
        selectedTeam="1s"
        router={{} as any}
        isLoading={true}
      />
    )
    
    const loadingIndicator = screen.getByRole('status')
    expect(loadingIndicator).toBeInTheDocument()
    expect(loadingIndicator).toHaveAttribute('aria-live', 'polite')
  })

  it('should have proper empty state accessibility', () => {
    render(
      <PlayersClient 
        players={[]} 
        teams={mockTeams} 
        selectedTeam="1s"
        router={{} as any}
        isLoading={false}
      />
    )
    
    const emptyMessage = screen.getByText(/no players found/i)
    expect(emptyMessage).toBeInTheDocument()
  })

  it('should have proper keyboard navigation', () => {
    render(
      <PlayersClient 
        players={mockPlayers} 
        teams={mockTeams} 
        selectedTeam="1s"
        router={{} as any}
      />
    )
    
    const teamSelect = screen.getByRole('combobox', { name: /team/i })
    const importButton = screen.getByRole('button', { name: /import players/i })
    const statsButton = screen.getByRole('button', { name: /enter stats/i })
    
    // All interactive elements should be focusable
    expect(teamSelect).not.toHaveAttribute('tabindex', '-1')
    expect(importButton).not.toHaveAttribute('tabindex', '-1')
    expect(statsButton).not.toHaveAttribute('tabindex', '-1')
  })

  it('should have proper ARIA labels and descriptions', () => {
    render(
      <PlayersClient 
        players={mockPlayers} 
        teams={mockTeams} 
        selectedTeam="1s"
        router={{} as any}
      />
    )
    
    const teamSelect = screen.getByRole('combobox', { name: /team/i })
    expect(teamSelect).toHaveAttribute('aria-label')
    
    const playerList = screen.getByRole('list')
    expect(playerList).toHaveAttribute('aria-label', 'Players list')
  })

  it('should have proper color contrast', async () => {
    const { container } = render(
      <PlayersClient 
        players={mockPlayers} 
        teams={mockTeams} 
        selectedTeam="1s"
        router={{} as any}
      />
    )
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true }
      }
    })
    expect(results).toHaveNoViolations()
  })

  it('should have proper focus management', () => {
    render(
      <PlayersClient 
        players={mockPlayers} 
        teams={mockTeams} 
        selectedTeam="1s"
        router={{} as any}
      />
    )
    
    const teamSelect = screen.getByRole('combobox', { name: /team/i })
    const importButton = screen.getByRole('button', { name: /import players/i })
    
    // Test focus order
    teamSelect.focus()
    expect(document.activeElement).toBe(teamSelect)
    
    importButton.focus()
    expect(document.activeElement).toBe(importButton)
  })
})

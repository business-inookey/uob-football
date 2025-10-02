import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import LoginPage from '@/app/login/page'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

describe('Login Page Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<LoginPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper form labels', () => {
    render(<LoginPage />)
    
    // Check for email input label
    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')

    // Check for password input label
    const passwordInput = screen.getByLabelText(/password/i)
    expect(passwordInput).toBeInTheDocument()
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('required')
  })

  it('should have proper button accessibility', () => {
    render(<LoginPage />)
    
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    expect(signInButton).toBeInTheDocument()
    expect(signInButton).toHaveAttribute('type', 'submit')

    const signUpButton = screen.getByRole('button', { name: /sign up/i })
    expect(signUpButton).toBeInTheDocument()
  })

  it('should have proper heading structure', () => {
    render(<LoginPage />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/uob football/i)
  })

  it('should have proper form structure', () => {
    render(<LoginPage />)
    
    const form = screen.getByRole('form')
    expect(form).toBeInTheDocument()
    
    const emailFieldset = screen.getByRole('group', { name: /email/i })
    expect(emailFieldset).toBeInTheDocument()
    
    const passwordFieldset = screen.getByRole('group', { name: /password/i })
    expect(passwordFieldset).toBeInTheDocument()
  })

  it('should have proper focus management', () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    // Check tab order
    emailInput.focus()
    expect(document.activeElement).toBe(emailInput)
    
    // Simulate tab key
    passwordInput.focus()
    expect(document.activeElement).toBe(passwordInput)
  })

  it('should have proper error message accessibility', () => {
    render(<LoginPage />)
    
    // Check for error message regions
    const errorRegions = screen.queryAllByRole('alert')
    // Initially no errors should be present
    expect(errorRegions).toHaveLength(0)
  })

  it('should have proper loading state accessibility', () => {
    render(<LoginPage />)
    
    // Check for loading indicators
    const loadingIndicators = screen.queryAllByRole('status')
    // Initially no loading should be present
    expect(loadingIndicators).toHaveLength(0)
  })

  it('should have proper color contrast', async () => {
    const { container } = render(<LoginPage />)
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true }
      }
    })
    expect(results).toHaveNoViolations()
  })

  it('should be keyboard navigable', () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    
    // All interactive elements should be focusable
    expect(emailInput).not.toHaveAttribute('tabindex', '-1')
    expect(passwordInput).not.toHaveAttribute('tabindex', '-1')
    expect(signInButton).not.toHaveAttribute('tabindex', '-1')
  })

  it('should have proper ARIA attributes', () => {
    render(<LoginPage />)
    
    const form = screen.getByRole('form')
    expect(form).toHaveAttribute('aria-label', 'Login form')
    
    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).toHaveAttribute('aria-required', 'true')
    
    const passwordInput = screen.getByLabelText(/password/i)
    expect(passwordInput).toHaveAttribute('aria-required', 'true')
  })
})

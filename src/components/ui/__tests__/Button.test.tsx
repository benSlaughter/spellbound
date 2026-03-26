import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('onClick handler fires', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Press</Button>);
    fireEvent.click(screen.getByText('Press'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders icon when provided', () => {
    render(<Button icon={<span data-testid="party-icon">party</span>}>Party</Button>);
    expect(screen.getByTestId('party-icon')).toBeInTheDocument();
  });

  it('does not render icon span when not provided', () => {
    const { container } = render(<Button>No Icon</Button>);
    const iconSpan = container.querySelector('[aria-hidden="true"]');
    expect(iconSpan).toBeNull();
  });

  it('applies primary variant styles by default', () => {
    const { container } = render(<Button>Primary</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('bg-primary');
  });

  it('applies secondary variant styles', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('bg-secondary');
  });

  it('applies fun variant styles', () => {
    const { container } = render(<Button variant="fun">Fun</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toMatch(/bg-fun/);
  });

  it('shows different sizes', () => {
    const { container: sm } = render(<Button size="sm">Small</Button>);
    const { container: lg } = render(<Button size="lg">Large</Button>);

    const smButton = sm.querySelector('button');
    const lgButton = lg.querySelector('button');

    expect(smButton?.className).toContain('text-sm');
    expect(lgButton?.className).toContain('text-lg');
  });

  it('passes through additional props', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled').closest('button');
    expect(button).toBeDisabled();
  });
});

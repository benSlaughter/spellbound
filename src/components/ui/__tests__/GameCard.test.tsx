import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GameCard from '../GameCard';

describe('GameCard', () => {
  const defaultProps = {
    title: 'Spelling Bee',
    description: 'Practice your spelling words',
    emoji: <span data-testid="bee-icon">bee</span>,
    href: '/spelling',
    color: 'bg-yellow-100',
  };

  it('renders title', () => {
    render(<GameCard {...defaultProps} />);
    expect(screen.getByText('Spelling Bee')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<GameCard {...defaultProps} />);
    expect(screen.getByText('Practice your spelling words')).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(<GameCard {...defaultProps} />);
    expect(screen.getByTestId('bee-icon')).toBeInTheDocument();
  });

  it('links to correct href when not locked', () => {
    render(<GameCard {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/spelling');
  });

  it('shows locked state when locked=true', () => {
    const { container } = render(<GameCard {...defaultProps} locked={true} />);
    // Should show Lock icon (SVG)
    const lockIcon = container.querySelector('svg');
    expect(lockIcon).not.toBeNull();
    // Should not be a link when locked
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('does not show lock when not locked', () => {
    const { container } = render(<GameCard {...defaultProps} locked={false} />);
    // No lock overlay
    const overlay = container.querySelector('.bg-white\\/40');
    expect(overlay).toBeNull();
  });
});

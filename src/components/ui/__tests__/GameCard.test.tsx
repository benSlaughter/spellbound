import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GameCard from '../GameCard';

describe('GameCard', () => {
  const defaultProps = {
    title: 'Spelling Bee',
    description: 'Practice your spelling words',
    emoji: '🐝',
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

  it('renders emoji', () => {
    render(<GameCard {...defaultProps} />);
    expect(screen.getByText('🐝')).toBeInTheDocument();
  });

  it('links to correct href when not locked', () => {
    render(<GameCard {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/spelling');
  });

  it('shows locked state when locked=true', () => {
    render(<GameCard {...defaultProps} locked={true} />);
    // Should show lock emoji instead of the game emoji
    const locks = screen.getAllByText('🔒');
    expect(locks.length).toBeGreaterThanOrEqual(1);
    // Should not be a link when locked
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('does not show lock when not locked', () => {
    render(<GameCard {...defaultProps} locked={false} />);
    expect(screen.queryByText('🔒')).toBeNull();
  });
});

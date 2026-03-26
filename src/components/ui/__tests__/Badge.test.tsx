import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../Badge';

describe('Badge', () => {
  it('renders emoji and title when unlocked', () => {
    render(<Badge emoji="🌟" title="Star Player" unlocked={true} />);
    expect(screen.getByText('🌟')).toBeInTheDocument();
    expect(screen.getByText('Star Player')).toBeInTheDocument();
  });

  it('shows "?" when locked', () => {
    render(<Badge emoji="🌟" title="Star Player" unlocked={false} />);
    expect(screen.getByText('?')).toBeInTheDocument();
    expect(screen.queryByText('🌟')).toBeNull();
  });

  it('defaults to locked state', () => {
    render(<Badge emoji="🏆" title="Champion" />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('applies correct visual styles when unlocked', () => {
    const { container } = render(<Badge emoji="⭐" title="Star" unlocked={true} />);
    const circle = container.querySelector('.bg-secondary');
    expect(circle).not.toBeNull();
  });

  it('applies correct visual styles when locked', () => {
    const { container } = render(<Badge emoji="⭐" title="Star" unlocked={false} />);
    const circle = container.querySelector('.bg-gray-200');
    expect(circle).not.toBeNull();
  });

  it('renders the title text regardless of unlock state', () => {
    render(<Badge emoji="🎵" title="Music" unlocked={false} />);
    expect(screen.getByText('Music')).toBeInTheDocument();
  });
});

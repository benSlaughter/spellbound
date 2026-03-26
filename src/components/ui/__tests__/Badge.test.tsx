import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../Badge';

describe('Badge', () => {
  it('renders icon and title when unlocked', () => {
    render(<Badge emoji={<span data-testid="star-icon">star</span>} title="Star Player" unlocked={true} />);
    expect(screen.getByTestId('star-icon')).toBeInTheDocument();
    expect(screen.getByText('Star Player')).toBeInTheDocument();
  });

  it('shows Question icon when locked', () => {
    render(<Badge emoji={<span data-testid="star-icon">star</span>} title="Star Player" unlocked={false} />);
    // Should not show the icon when locked
    expect(screen.queryByTestId('star-icon')).toBeNull();
  });

  it('defaults to locked state', () => {
    render(<Badge emoji={<span data-testid="trophy-icon">trophy</span>} title="Champion" />);
    expect(screen.queryByTestId('trophy-icon')).toBeNull();
  });

  it('applies correct visual styles when unlocked', () => {
    const { container } = render(<Badge emoji={<span>star</span>} title="Star" unlocked={true} />);
    const circle = container.querySelector('.bg-secondary');
    expect(circle).not.toBeNull();
  });

  it('applies correct visual styles when locked', () => {
    const { container } = render(<Badge emoji={<span>star</span>} title="Star" unlocked={false} />);
    const circle = container.querySelector('.bg-gray-200');
    expect(circle).not.toBeNull();
  });

  it('renders the title text regardless of unlock state', () => {
    render(<Badge emoji={<span>music</span>} title="Music" unlocked={false} />);
    expect(screen.getByText('Music')).toBeInTheDocument();
  });
});

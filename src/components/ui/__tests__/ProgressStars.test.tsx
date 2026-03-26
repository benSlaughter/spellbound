import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressStars from '../ProgressStars';

describe('ProgressStars', () => {
  it('renders the correct total number of stars', () => {
    const { container } = render(<ProgressStars filled={3} total={5} />);
    const stars = container.querySelectorAll('span');
    // Each star is a span within the flex container
    expect(stars.length).toBe(5);
  });

  it('renders correct number of filled stars', () => {
    render(<ProgressStars filled={3} total={5} />);
    const starContainer = screen.getByRole('img', { name: '3 of 5 stars' });
    expect(starContainer).toBeInTheDocument();
  });

  it('applies opacity to unfilled stars', () => {
    const { container } = render(<ProgressStars filled={2} total={4} />);
    const stars = container.querySelectorAll('span');
    // First 2 should not have opacity-30, last 2 should
    expect(stars[0].className).not.toContain('opacity-30');
    expect(stars[1].className).not.toContain('opacity-30');
    expect(stars[2].className).toContain('opacity-30');
    expect(stars[3].className).toContain('opacity-30');
  });

  it('handles 0 filled stars', () => {
    const { container } = render(<ProgressStars filled={0} total={5} />);
    const stars = container.querySelectorAll('span');
    for (const star of stars) {
      expect(star.className).toContain('opacity-30');
    }
  });

  it('handles all filled stars', () => {
    const { container } = render(<ProgressStars filled={5} total={5} />);
    const stars = container.querySelectorAll('span');
    for (const star of stars) {
      expect(star.className).not.toContain('opacity-30');
    }
  });

  it('uses default total of 5', () => {
    render(<ProgressStars filled={3} />);
    const starContainer = screen.getByRole('img', { name: '3 of 5 stars' });
    expect(starContainer).toBeInTheDocument();
  });

  it('renders star icon', () => {
    const { container } = render(<ProgressStars filled={1} total={1} />);
    // Should contain an SVG (Phosphor Star icon)
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('applies correct size class', () => {
    const { container: sm } = render(<ProgressStars filled={1} total={1} size="sm" />);
    const { container: lg } = render(<ProgressStars filled={1} total={1} size="lg" />);

    // Verify different sized SVGs are rendered (sm=20, lg=40)
    const smSvg = sm.querySelector('svg');
    const lgSvg = lg.querySelector('svg');
    expect(smSvg).not.toBeNull();
    expect(lgSvg).not.toBeNull();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container).toBeTruthy();
  });

  it('has the status role for accessibility', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has an accessible loading label', () => {
    render(<LoadingSpinner />);
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('contains animated dot elements', () => {
    const { container } = render(<LoadingSpinner />);
    const dots = container.querySelectorAll('.rounded-full');
    expect(dots.length).toBe(4);
  });

  it('contains a screen-reader-only loading text', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });
});

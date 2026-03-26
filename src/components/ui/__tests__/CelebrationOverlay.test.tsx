import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CelebrationOverlay from '../CelebrationOverlay';

describe('CelebrationOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders message and emoji when show=true', () => {
    render(
      <CelebrationOverlay
        show={true}
        emoji="🏆"
        message="Great job!"
        onDismiss={() => {}}
      />
    );
    expect(screen.getByText('Great job!')).toBeInTheDocument();
    expect(screen.getByText('🏆')).toBeInTheDocument();
  });

  it('does not render when show=false', () => {
    render(
      <CelebrationOverlay
        show={false}
        emoji="🏆"
        message="Great job!"
        onDismiss={() => {}}
      />
    );
    expect(screen.queryByText('Great job!')).toBeNull();
  });

  it('calls onDismiss when clicked', () => {
    const onDismiss = vi.fn();
    render(
      <CelebrationOverlay
        show={true}
        emoji="🏆"
        message="Click me!"
        onDismiss={onDismiss}
      />
    );
    // Click the overlay backdrop
    fireEvent.click(screen.getByText('Click me!').closest('.fixed')!);
    expect(onDismiss).toHaveBeenCalled();
  });

  it('auto-dismisses after autoCloseMs', () => {
    const onDismiss = vi.fn();
    render(
      <CelebrationOverlay
        show={true}
        emoji="🎉"
        message="Auto close"
        onDismiss={onDismiss}
        autoCloseMs={2000}
      />
    );

    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('uses default message when message prop is not provided', () => {
    render(
      <CelebrationOverlay show={true} onDismiss={() => {}} />
    );
    // Default message is MESSAGES[0] = 'Amazing! 🎉'
    expect(screen.getByText('Amazing! 🎉')).toBeInTheDocument();
  });

  it('uses default emoji when emoji prop is not provided', () => {
    render(
      <CelebrationOverlay show={true} onDismiss={() => {}} />
    );
    expect(screen.getByText('🏆')).toBeInTheDocument();
  });

  it('clears timeout when unmounted', () => {
    const onDismiss = vi.fn();
    const { unmount } = render(
      <CelebrationOverlay
        show={true}
        emoji="🎉"
        message="Unmount"
        onDismiss={onDismiss}
        autoCloseMs={5000}
      />
    );

    unmount();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Should not have been called after unmount
    expect(onDismiss).not.toHaveBeenCalled();
  });
});

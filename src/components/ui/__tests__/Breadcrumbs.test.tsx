import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Track current path for the mock
let currentPath = '/';

// Override the global next/navigation mock with one we control
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => currentPath,
}));

import Breadcrumbs from '../Breadcrumbs';

describe('Breadcrumbs', () => {
  beforeEach(() => {
    currentPath = '/';
  });

  it('renders "Home" for root path', () => {
    render(<Breadcrumbs />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('Home is the only breadcrumb at root path', () => {
    render(<Breadcrumbs />);
    const nav = screen.getByLabelText('Breadcrumb');
    const links = nav.querySelectorAll('a');
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(links).toHaveLength(0);
  });

  describe('nested paths', () => {
    beforeEach(() => {
      currentPath = '/spelling/scramble';
    });

    it('renders correct breadcrumb trail', () => {
      render(<Breadcrumbs />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Spelling')).toBeInTheDocument();
      expect(screen.getByText('Word Scramble')).toBeInTheDocument();
    });

    it('last segment is not a link', () => {
      render(<Breadcrumbs />);
      const lastSegment = screen.getByText('Word Scramble');
      expect(lastSegment.tagName).toBe('SPAN');
      expect(lastSegment.closest('a')).toBeNull();
    });

    it('all segments except last are clickable links', () => {
      render(<Breadcrumbs />);
      const homeLink = screen.getByText('Home');
      expect(homeLink.closest('a')).not.toBeNull();
      expect(homeLink.closest('a')!.getAttribute('href')).toBe('/');

      const spellingLink = screen.getByText('Spelling');
      expect(spellingLink.closest('a')).not.toBeNull();
      expect(spellingLink.closest('a')!.getAttribute('href')).toBe('/spelling');
    });
  });

  describe('maths nested path', () => {
    beforeEach(() => {
      currentPath = '/maths/bubbles';
    });

    it('renders maths breadcrumb trail', () => {
      render(<Breadcrumbs />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Maths')).toBeInTheDocument();
      expect(screen.getByText('Number Bubbles')).toBeInTheDocument();
    });
  });
});

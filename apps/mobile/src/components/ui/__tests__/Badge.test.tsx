/**
 * Badge Component Tests
 * 
 * Tests for Badge component variants and rendering.
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Badge, BadgeVariant } from '../Badge';

describe('Badge', () => {
  describe('rendering', () => {
    it('renders children text correctly', () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText('New')).toBeTruthy();
    });

    it('renders with default variant', () => {
      const { toJSON } = render(<Badge>Default</Badge>);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('variants', () => {
    const variants: BadgeVariant[] = [
      'default',
      'secondary',
      'destructive',
      'outline',
      'success',
      'warning',
      'info',
    ];

    variants.forEach((variant) => {
      it(`renders ${variant} variant correctly`, () => {
        render(<Badge variant={variant}>{variant}</Badge>);
        expect(screen.getByText(variant)).toBeTruthy();
      });

      it(`matches snapshot for ${variant} variant`, () => {
        const { toJSON } = render(<Badge variant={variant}>{variant}</Badge>);
        expect(toJSON()).toMatchSnapshot();
      });
    });
  });

  describe('status badges', () => {
    it('renders success badge for positive status', () => {
      render(<Badge variant="success">Completed</Badge>);
      expect(screen.getByText('Completed')).toBeTruthy();
    });

    it('renders warning badge for pending status', () => {
      render(<Badge variant="warning">Pending</Badge>);
      expect(screen.getByText('Pending')).toBeTruthy();
    });

    it('renders destructive badge for error status', () => {
      render(<Badge variant="destructive">Failed</Badge>);
      expect(screen.getByText('Failed')).toBeTruthy();
    });

    it('renders info badge for informational status', () => {
      render(<Badge variant="info">In Progress</Badge>);
      expect(screen.getByText('In Progress')).toBeTruthy();
    });
  });

  describe('custom styles', () => {
    it('applies custom style prop', () => {
      const { toJSON } = render(
        <Badge style={{ marginRight: 8 }}>Styled</Badge>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('long text', () => {
    it('renders long text correctly', () => {
      render(<Badge>This is a longer badge text</Badge>);
      expect(screen.getByText('This is a longer badge text')).toBeTruthy();
    });
  });

  describe('numeric content', () => {
    it('renders numeric children', () => {
      render(<Badge variant="default">{42}</Badge>);
      expect(screen.getByText('42')).toBeTruthy();
    });
  });
});


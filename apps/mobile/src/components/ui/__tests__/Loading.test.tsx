/**
 * Loading Component Tests
 * 
 * Tests for Loading and Skeleton components.
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Loading, Skeleton } from '../Loading';

describe('Loading', () => {
  describe('basic rendering', () => {
    it('renders loading indicator', () => {
      const { toJSON } = render(<Loading />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders without message by default', () => {
      render(<Loading />);
      // Should not have any text
      expect(screen.queryByText(/./)).toBeNull();
    });
  });

  describe('with message', () => {
    it('renders message when provided', () => {
      render(<Loading message="Loading data..." />);
      expect(screen.getByText('Loading data...')).toBeTruthy();
    });

    it('renders custom loading message', () => {
      render(<Loading message="Please wait while we fetch your data" />);
      expect(screen.getByText('Please wait while we fetch your data')).toBeTruthy();
    });
  });

  describe('sizes', () => {
    it('renders small size', () => {
      const { toJSON } = render(<Loading size="small" />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders large size (default)', () => {
      const { toJSON } = render(<Loading size="large" />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('fullScreen mode', () => {
    it('renders in fullScreen mode', () => {
      const { toJSON } = render(<Loading fullScreen />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders fullScreen with message', () => {
      render(<Loading fullScreen message="Loading..." />);
      expect(screen.getByText('Loading...')).toBeTruthy();
    });
  });

  describe('custom styles', () => {
    it('applies custom style', () => {
      const { toJSON } = render(
        <Loading style={{ marginTop: 20 }} />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});

describe('Skeleton', () => {
  describe('basic rendering', () => {
    it('renders with default props', () => {
      const { toJSON } = render(<Skeleton />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('dimensions', () => {
    it('renders with custom width', () => {
      const { toJSON } = render(<Skeleton width={200} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders with custom height', () => {
      const { toJSON } = render(<Skeleton height={40} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders with percentage width', () => {
      const { toJSON } = render(<Skeleton width="50%" />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('borderRadius', () => {
    it('renders with custom borderRadius', () => {
      const { toJSON } = render(<Skeleton borderRadius={20} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders as circle', () => {
      const { toJSON } = render(
        <Skeleton width={50} height={50} borderRadius={25} />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('custom styles', () => {
    it('applies custom style', () => {
      const { toJSON } = render(
        <Skeleton style={{ marginBottom: 8 }} />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('skeleton list', () => {
    it('renders multiple skeletons for list placeholder', () => {
      const { toJSON } = render(
        <>
          <Skeleton width="100%" height={60} style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height={60} style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height={60} style={{ marginBottom: 8 }} />
        </>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});


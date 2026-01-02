/**
 * Button Component Tests
 * 
 * Tests for the Button component variants, sizes, and states.
 */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Button, ButtonVariant, ButtonSize } from '../Button';

describe('Button', () => {
  describe('rendering', () => {
    it('renders children text correctly', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeTruthy();
    });

    it('renders with default variant and size', () => {
      const { getByRole } = render(<Button>Default</Button>);
      // Button should be accessible
      expect(screen.getByText('Default')).toBeTruthy();
    });
  });

  describe('variants', () => {
    const variants: ButtonVariant[] = ['default', 'secondary', 'outline', 'ghost', 'destructive'];

    variants.forEach((variant) => {
      it(`renders ${variant} variant`, () => {
        render(<Button variant={variant}>{variant} button</Button>);
        expect(screen.getByText(`${variant} button`)).toBeTruthy();
      });
    });
  });

  describe('sizes', () => {
    const sizes: ButtonSize[] = ['sm', 'default', 'lg'];

    sizes.forEach((size) => {
      it(`renders ${size} size`, () => {
        render(<Button size={size}>{size} button</Button>);
        expect(screen.getByText(`${size} button`)).toBeTruthy();
      });
    });
  });

  describe('loading state', () => {
    it('shows loading indicator when loading is true', () => {
      render(<Button loading>Loading</Button>);
      // Text should not be visible when loading
      expect(screen.queryByText('Loading')).toBeNull();
    });

    it('is disabled when loading', () => {
      const onPress = jest.fn();
      const { toJSON } = render(
        <Button loading onPress={onPress}>
          Loading
        </Button>
      );
      // Verify the button renders in disabled state
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('disabled state', () => {
    it('renders correctly when disabled', () => {
      const onPress = jest.fn();
      const { toJSON } = render(
        <Button disabled onPress={onPress}>
          Disabled
        </Button>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('applies disabled opacity', () => {
      const { toJSON } = render(<Button disabled>Disabled</Button>);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('interactions', () => {
    it('calls onPress when pressed', () => {
      const onPress = jest.fn();
      render(<Button onPress={onPress}>Press me</Button>);

      fireEvent.press(screen.getByText('Press me'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('passes additional TouchableOpacity props', () => {
      const onLongPress = jest.fn();
      render(
        <Button onLongPress={onLongPress} testID="long-press-button">Long press</Button>
      );

      fireEvent(screen.getByTestId('long-press-button'), 'longPress');
      expect(onLongPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('is accessible as a button', () => {
      render(<Button accessibilityLabel="Submit form">Submit</Button>);
      expect(screen.getByLabelText('Submit form')).toBeTruthy();
    });
  });

  describe('custom styles', () => {
    it('applies custom style prop', () => {
      const customStyle = { marginTop: 20 };
      const { toJSON } = render(
        <Button style={customStyle}>Styled</Button>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});


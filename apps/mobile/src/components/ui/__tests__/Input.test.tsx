/**
 * Input Component Tests
 * 
 * Tests for the Input component with label, error, and various states.
 */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Input } from '../Input';

describe('Input', () => {
  describe('rendering', () => {
    it('renders without label or error', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeTruthy();
    });

    it('renders with label', () => {
      render(<Input label="Email" placeholder="Enter email" />);
      expect(screen.getByText('Email')).toBeTruthy();
      expect(screen.getByPlaceholderText('Enter email')).toBeTruthy();
    });

    it('renders with error message', () => {
      render(<Input error="This field is required" placeholder="Enter text" />);
      expect(screen.getByText('This field is required')).toBeTruthy();
    });

    it('renders with both label and error', () => {
      render(
        <Input
          label="Password"
          error="Password is too short"
          placeholder="Enter password"
        />
      );
      expect(screen.getByText('Password')).toBeTruthy();
      expect(screen.getByText('Password is too short')).toBeTruthy();
    });
  });

  describe('text input', () => {
    it('handles text change', () => {
      const onChangeText = jest.fn();
      render(
        <Input
          placeholder="Type here"
          onChangeText={onChangeText}
        />
      );

      const input = screen.getByPlaceholderText('Type here');
      fireEvent.changeText(input, 'Hello World');
      expect(onChangeText).toHaveBeenCalledWith('Hello World');
    });

    it('displays value correctly', () => {
      render(<Input value="Test value" placeholder="Enter text" />);
      expect(screen.getByDisplayValue('Test value')).toBeTruthy();
    });
  });

  describe('input types', () => {
    it('renders as secure text entry for passwords', () => {
      render(
        <Input
          label="Password"
          secureTextEntry
          placeholder="Enter password"
        />
      );
      
      const input = screen.getByPlaceholderText('Enter password');
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('renders with numeric keyboard', () => {
      render(
        <Input
          label="Phone"
          keyboardType="numeric"
          placeholder="Enter phone"
        />
      );
      
      const input = screen.getByPlaceholderText('Enter phone');
      expect(input.props.keyboardType).toBe('numeric');
    });

    it('renders with email keyboard', () => {
      render(
        <Input
          label="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Enter email"
        />
      );
      
      const input = screen.getByPlaceholderText('Enter email');
      expect(input.props.keyboardType).toBe('email-address');
      expect(input.props.autoCapitalize).toBe('none');
    });
  });

  describe('disabled state', () => {
    it('is not editable when editable is false', () => {
      render(
        <Input
          editable={false}
          value="Read only"
          placeholder="Enter text"
        />
      );
      
      const input = screen.getByDisplayValue('Read only');
      expect(input.props.editable).toBe(false);
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<any>();
      render(<Input ref={ref} placeholder="With ref" />);
      expect(ref.current).toBeTruthy();
    });
  });

  describe('custom styles', () => {
    it('applies containerStyle', () => {
      const { toJSON } = render(
        <Input
          containerStyle={{ marginBottom: 16 }}
          placeholder="Styled input"
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('applies style to TextInput', () => {
      const { toJSON } = render(
        <Input
          style={{ backgroundColor: 'white' }}
          placeholder="Styled input"
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('accessibility', () => {
    it('associates label with input', () => {
      render(
        <Input
          label="Username"
          accessibilityLabel="Username input"
          placeholder="Enter username"
        />
      );
      expect(screen.getByLabelText('Username input')).toBeTruthy();
    });
  });

  describe('error styling', () => {
    it('applies error border style when error is present', () => {
      const { toJSON } = render(
        <Input error="Error message" placeholder="Error input" />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});


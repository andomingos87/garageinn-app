/**
 * TextArea Component Tests
 * 
 * Tests for the TextArea component with label, error, and various configurations.
 */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { TextArea } from '../TextArea';

describe('TextArea', () => {
  describe('rendering', () => {
    it('renders without label or error', () => {
      render(<TextArea placeholder="Enter description" />);
      expect(screen.getByPlaceholderText('Enter description')).toBeTruthy();
    });

    it('renders with label', () => {
      render(<TextArea label="Description" placeholder="Enter description" />);
      expect(screen.getByText('Description')).toBeTruthy();
      expect(screen.getByPlaceholderText('Enter description')).toBeTruthy();
    });

    it('renders with error message', () => {
      render(<TextArea error="This field is required" placeholder="Enter text" />);
      expect(screen.getByText('This field is required')).toBeTruthy();
    });

    it('renders with both label and error', () => {
      render(
        <TextArea
          label="Notes"
          error="Notes are required"
          placeholder="Enter notes"
        />
      );
      expect(screen.getByText('Notes')).toBeTruthy();
      expect(screen.getByText('Notes are required')).toBeTruthy();
    });
  });

  describe('multiline behavior', () => {
    it('is multiline by default', () => {
      render(<TextArea placeholder="Multiline" />);
      const input = screen.getByPlaceholderText('Multiline');
      expect(input.props.multiline).toBe(true);
    });

    it('has textAlignVertical set to top', () => {
      render(<TextArea placeholder="Top aligned" />);
      const input = screen.getByPlaceholderText('Top aligned');
      expect(input.props.textAlignVertical).toBe('top');
    });
  });

  describe('rows configuration', () => {
    it('renders with default 4 rows', () => {
      const { toJSON } = render(<TextArea placeholder="Default rows" />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders with custom rows', () => {
      const { toJSON } = render(<TextArea rows={6} placeholder="6 rows" />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders with minimum rows', () => {
      const { toJSON } = render(<TextArea rows={2} placeholder="2 rows" />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('text input', () => {
    it('handles text change', () => {
      const onChangeText = jest.fn();
      render(
        <TextArea
          placeholder="Type here"
          onChangeText={onChangeText}
        />
      );

      const input = screen.getByPlaceholderText('Type here');
      fireEvent.changeText(input, 'Hello\nWorld\nMultiple lines');
      expect(onChangeText).toHaveBeenCalledWith('Hello\nWorld\nMultiple lines');
    });

    it('displays value correctly', () => {
      render(<TextArea value="Test value" placeholder="Enter text" />);
      expect(screen.getByDisplayValue('Test value')).toBeTruthy();
    });

    it('handles multiline input', () => {
      const onChangeText = jest.fn();
      render(<TextArea onChangeText={onChangeText} placeholder="Notes" />);
      
      const input = screen.getByPlaceholderText('Notes');
      const multilineText = 'Line 1\nLine 2\nLine 3';
      fireEvent.changeText(input, multilineText);
      
      expect(onChangeText).toHaveBeenCalledWith(multilineText);
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<any>();
      render(<TextArea ref={ref} placeholder="With ref" />);
      expect(ref.current).toBeTruthy();
    });
  });

  describe('custom styles', () => {
    it('applies containerStyle', () => {
      const { toJSON } = render(
        <TextArea
          containerStyle={{ marginBottom: 16 }}
          placeholder="Styled textarea"
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('applies style to TextInput', () => {
      const { toJSON } = render(
        <TextArea
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
        <TextArea
          label="Comments"
          accessibilityLabel="Comments input"
          placeholder="Enter comments"
        />
      );
      expect(screen.getByLabelText('Comments input')).toBeTruthy();
    });
  });

  describe('error styling', () => {
    it('applies error border style when error is present', () => {
      const { toJSON } = render(
        <TextArea error="Error message" placeholder="Error textarea" />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(TextArea.displayName).toBe('TextArea');
    });
  });
});


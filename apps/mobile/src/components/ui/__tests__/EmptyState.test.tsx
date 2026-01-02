/**
 * EmptyState Component Tests
 * 
 * Tests for EmptyState component with various configurations.
 */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  describe('basic rendering', () => {
    it('renders title correctly', () => {
      render(<EmptyState title="No items found" />);
      expect(screen.getByText('No items found')).toBeTruthy();
    });

    it('renders title without description', () => {
      render(<EmptyState title="Empty" />);
      expect(screen.getByText('Empty')).toBeTruthy();
    });
  });

  describe('with description', () => {
    it('renders description when provided', () => {
      render(
        <EmptyState
          title="No results"
          description="Try adjusting your search criteria"
        />
      );
      expect(screen.getByText('No results')).toBeTruthy();
      expect(screen.getByText('Try adjusting your search criteria')).toBeTruthy();
    });
  });

  describe('with icon', () => {
    it('renders custom icon', () => {
      const TestIcon = () => <Text testID="custom-icon">📭</Text>;
      render(
        <EmptyState
          title="No messages"
          icon={<TestIcon />}
        />
      );
      expect(screen.getByTestId('custom-icon')).toBeTruthy();
    });

    it('renders without icon when not provided', () => {
      const { toJSON } = render(<EmptyState title="No icon" />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('with action button', () => {
    it('renders action button when provided', () => {
      const onPress = jest.fn();
      render(
        <EmptyState
          title="No items"
          action={{
            label: 'Add Item',
            onPress,
          }}
        />
      );
      expect(screen.getByText('Add Item')).toBeTruthy();
    });

    it('calls onPress when action button is pressed', () => {
      const onPress = jest.fn();
      render(
        <EmptyState
          title="No items"
          action={{
            label: 'Create New',
            onPress,
          }}
        />
      );

      fireEvent.press(screen.getByText('Create New'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('renders action with custom variant', () => {
      const onPress = jest.fn();
      const { toJSON } = render(
        <EmptyState
          title="Error occurred"
          action={{
            label: 'Retry',
            onPress,
            variant: 'destructive',
          }}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders action with secondary variant', () => {
      const onPress = jest.fn();
      render(
        <EmptyState
          title="No data"
          action={{
            label: 'Refresh',
            onPress,
            variant: 'secondary',
          }}
        />
      );
      expect(screen.getByText('Refresh')).toBeTruthy();
    });
  });

  describe('complete empty state', () => {
    it('renders with all props', () => {
      const onPress = jest.fn();
      const TestIcon = () => <View testID="icon" />;

      render(
        <EmptyState
          icon={<TestIcon />}
          title="No checklists"
          description="You haven't created any checklists yet. Create one to get started."
          action={{
            label: 'Create Checklist',
            onPress,
          }}
        />
      );

      expect(screen.getByTestId('icon')).toBeTruthy();
      expect(screen.getByText('No checklists')).toBeTruthy();
      expect(screen.getByText(/You haven't created any checklists yet/)).toBeTruthy();
      expect(screen.getByText('Create Checklist')).toBeTruthy();
    });

    it('matches snapshot for complete empty state', () => {
      const onPress = jest.fn();
      const { toJSON } = render(
        <EmptyState
          icon={<Text>📋</Text>}
          title="No tickets"
          description="All your tickets will appear here"
          action={{
            label: 'Create Ticket',
            onPress,
          }}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('custom styles', () => {
    it('applies custom style', () => {
      const { toJSON } = render(
        <EmptyState
          title="Styled empty state"
          style={{ backgroundColor: 'white' }}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('use cases', () => {
    it('renders for empty search results', () => {
      render(
        <EmptyState
          title="No results found"
          description="We couldn't find anything matching your search. Try different keywords."
        />
      );
      expect(screen.getByText('No results found')).toBeTruthy();
    });

    it('renders for offline state', () => {
      const onRetry = jest.fn();
      render(
        <EmptyState
          title="You're offline"
          description="Check your internet connection and try again."
          action={{
            label: 'Retry',
            onPress: onRetry,
          }}
        />
      );
      expect(screen.getByText("You're offline")).toBeTruthy();
    });

    it('renders for error state', () => {
      const onRetry = jest.fn();
      render(
        <EmptyState
          title="Something went wrong"
          description="We couldn't load your data. Please try again."
          action={{
            label: 'Try Again',
            onPress: onRetry,
            variant: 'destructive',
          }}
        />
      );
      expect(screen.getByText('Something went wrong')).toBeTruthy();
    });
  });
});


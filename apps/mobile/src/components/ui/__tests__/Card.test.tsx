/**
 * Card Component Tests
 * 
 * Tests for Card and its sub-components (Header, Title, Description, Content, Footer).
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../Card';

describe('Card', () => {
  describe('Card container', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <Text>Card content</Text>
        </Card>
      );
      expect(screen.getByText('Card content')).toBeTruthy();
    });

    it('applies custom style', () => {
      const { toJSON } = render(
        <Card style={{ marginTop: 20 }}>
          <Text>Styled card</Text>
        </Card>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('passes ViewProps correctly', () => {
      render(
        <Card testID="test-card" accessibilityLabel="Test card">
          <Text>Content</Text>
        </Card>
      );
      expect(screen.getByTestId('test-card')).toBeTruthy();
    });
  });

  describe('CardHeader', () => {
    it('renders children correctly', () => {
      render(
        <CardHeader>
          <Text>Header content</Text>
        </CardHeader>
      );
      expect(screen.getByText('Header content')).toBeTruthy();
    });

    it('applies custom style', () => {
      const { toJSON } = render(
        <CardHeader style={{ paddingBottom: 0 }}>
          <Text>Styled header</Text>
        </CardHeader>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('CardTitle', () => {
    it('renders title text', () => {
      render(<CardTitle>My Card Title</CardTitle>);
      expect(screen.getByText('My Card Title')).toBeTruthy();
    });

    it('applies custom style', () => {
      const { toJSON } = render(
        <CardTitle style={{ marginTop: 8 }}>Styled Title</CardTitle>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('CardDescription', () => {
    it('renders description text', () => {
      render(<CardDescription>This is a description</CardDescription>);
      expect(screen.getByText('This is a description')).toBeTruthy();
    });

    it('applies custom style', () => {
      const { toJSON } = render(
        <CardDescription style={{ marginTop: 8 }}>
          Styled description
        </CardDescription>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('CardContent', () => {
    it('renders children correctly', () => {
      render(
        <CardContent>
          <Text>Main content here</Text>
        </CardContent>
      );
      expect(screen.getByText('Main content here')).toBeTruthy();
    });

    it('applies custom style', () => {
      const { toJSON } = render(
        <CardContent style={{ gap: 16 }}>
          <Text>Content with gap</Text>
        </CardContent>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('CardFooter', () => {
    it('renders children correctly', () => {
      render(
        <CardFooter>
          <Text>Footer content</Text>
        </CardFooter>
      );
      expect(screen.getByText('Footer content')).toBeTruthy();
    });

    it('applies custom style', () => {
      const { toJSON } = render(
        <CardFooter style={{ justifyContent: 'flex-end' }}>
          <Text>Aligned footer</Text>
        </CardFooter>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Full Card composition', () => {
    it('renders complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>With all sub-components</CardDescription>
          </CardHeader>
          <CardContent>
            <Text>Main content area</Text>
          </CardContent>
          <CardFooter>
            <Text>Footer area</Text>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Complete Card')).toBeTruthy();
      expect(screen.getByText('With all sub-components')).toBeTruthy();
      expect(screen.getByText('Main content area')).toBeTruthy();
      expect(screen.getByText('Footer area')).toBeTruthy();
    });

    it('renders card without optional components', () => {
      render(
        <Card>
          <CardContent>
            <Text>Simple card with content only</Text>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Simple card with content only')).toBeTruthy();
    });

    it('matches snapshot for full card', () => {
      const { toJSON } = render(
        <Card>
          <CardHeader>
            <CardTitle>Snapshot Test</CardTitle>
            <CardDescription>Testing full card structure</CardDescription>
          </CardHeader>
          <CardContent>
            <Text>Content here</Text>
          </CardContent>
          <CardFooter>
            <Text>Footer here</Text>
          </CardFooter>
        </Card>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});


import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import EmptyState from '../src/components/EmptyState';
import ErrorMessage from '../src/components/ErrorMessage';
import Loading from '../src/components/Loading';

describe('UI Reusable Components', () => {
  it('renders EmptyState correctly with default props', () => {
    let tree;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<EmptyState />).toJSON();
    });
    expect(tree).toBeDefined();
  });

  it('renders EmptyState with custom props and action button', () => {
    const handleAction = jest.fn();
    let tree;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <EmptyState
          title="No Orders Found"
          description="You haven't ordered anything yet."
          actionText="Shop Now"
          onAction={handleAction}
        />
      ).toJSON();
    });
    expect(tree).toBeDefined();
  });

  it('renders ErrorMessage correctly with message and retry button', () => {
    const handleRetry = jest.fn();
    let tree;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <ErrorMessage message="Network connection failed" onRetry={handleRetry} />
      ).toJSON();
    });
    expect(tree).toBeDefined();
  });

  it('renders Loading component with message', () => {
    let tree;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Loading message="Loading Rwamagana products..." />
      ).toJSON();
    });
    expect(tree).toBeDefined();
  });
});

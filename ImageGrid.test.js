import React from 'react';
import ImageGrid from './ImageGrid';

import renderer from 'react-test-renderer';

it('renders ImageGrid without crashing', () => {
  const rendered = renderer.create(<ImageGrid />).toJSON();
  expect(rendered).toBeTruthy();
});

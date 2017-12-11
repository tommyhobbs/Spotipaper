import React from 'react';
import ImageGrid from './ImageGrid';

import renderer from 'react-test-renderer';

const testProps = {
  objects: {items:[]},
  dimensions: {},
  slider: 5,
}

it('renders ImageGrid without crashing', () => {
  const rendered = renderer.create(<ImageGrid {...testProps}/>).toJSON();
  expect(rendered).toBeTruthy();
});

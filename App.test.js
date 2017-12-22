import React from 'react';
import App from './App';
import { shallow } from 'enzyme';

import renderer from 'react-test-renderer';

it('renders without crashing', () => {
  const rendered = renderer.create(<App />).toJSON();
  expect(rendered).toBeTruthy();
});

it('matches snapshot', () => {
  const rendered = renderer.create(<App />).toJSON();
  expect(rendered).toMatchSnapshot();
});

it('shows the login button by default', () => {
  const rendered = shallow(<App />);
  console.log(rendered.find('Button').props());
  expect(rendered.find('Button').props().title).toEqual('Login with Spotify');
});


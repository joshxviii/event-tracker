import { render, screen } from '@testing-library/react';
import { App } from './App';

test('renders home page heading', () => {
  render(<App />);
  const heading = screen.getByText(/home page/i);
  expect(heading).toBeInTheDocument();
});

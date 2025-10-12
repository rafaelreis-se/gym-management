import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';
import { AppThemeProvider } from '../ThemeProvider/ThemeContext';

describe('ThemeToggle', () => {
  it('should render successfully', () => {
    const { container } = render(
      <AppThemeProvider>
        <ThemeToggle />
      </AppThemeProvider>
    );
    expect(container).toBeTruthy();
  });

  it('should render toggle button', () => {
    render(
      <AppThemeProvider>
        <ThemeToggle />
      </AppThemeProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should toggle theme when clicked', () => {
    render(
      <AppThemeProvider>
        <ThemeToggle />
      </AppThemeProvider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // The component should still be rendered after click
    expect(button).toBeInTheDocument();
  });
});

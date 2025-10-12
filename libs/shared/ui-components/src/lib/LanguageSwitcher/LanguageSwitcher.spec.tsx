import React from 'react';
import { render, screen } from '@testing-library/react';
import { LanguageSwitcher } from './LanguageSwitcher';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'pt-BR',
      changeLanguage: jest.fn(),
    },
  }),
}));

describe('LanguageSwitcher', () => {
  it('should render successfully', () => {
    const { container } = render(<LanguageSwitcher />);
    expect(container).toBeTruthy();
  });

  it('should render language button', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByTitle('Change language');
    expect(button).toBeInTheDocument();
  });

  it('should have icon button', () => {
    render(<LanguageSwitcher />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { LoginModule } from './';

describe('LoginModule', () => {
  test('initial state', () => {
    const { getByLabelText, getByRole } = render(<LoginModule />);

    // it renders empty email and passsword fields
    const emailField = getByLabelText('Email');
    expect(emailField.value).toBe('');
    const passwordField = getByLabelText('Password');
    expect(passwordField.value).toBe('');

    // it renders enabled submit button
    const button = getByRole('button');
    expect(button.disabled).toBe(false);
    expect(button.textContent).toBe('Submit');
  });

  test('successful login', async () => {
    jest
      .spyOn(window, 'fetch')
      .mockResolvedValue({ json: () => ({ token: '123' }) });

    const { getByLabelText, getByText, getByRole } = render(<LoginModule />);

    const emailField = getByLabelText('Email');
    const passwordField = getByLabelText('Password');
    const button = getByRole('button');

    // fill out and submit form
    fireEvent.change(emailField, { target: { value: 'test@email.com' } });
    fireEvent.change(passwordField, { target: { value: 'password' } });
    fireEvent.click(button);

    // it sets loading state
    expect(button.disabled).toBe(true);
    expect(button.textContent).toBe('Loading...');

    await waitFor(() => {
      // it hides form elements
      expect(button).not.toBeInTheDocument();
      expect(emailField).not.toBeInTheDocument();
      expect(passwordField).not.toBeInTheDocument();

      // it displays success text and email address
      const loggedInText = getByText('Logged in as');
      expect(loggedInText).toBeInTheDocument();
      const emailAddressText = getByText('test@email.com');
      expect(emailAddressText).toBeInTheDocument();
    });
  });

  test('error login', async () => {
    jest
      .spyOn(window, 'fetch')
      .mockResolvedValue({ json: () => ({ error: 'invalid password' }) });

    const { getByLabelText, getByText, getByRole } = render(<LoginModule />);

    const emailField = getByLabelText('Email');
    const passwordField = getByLabelText('Password');
    const button = getByRole('button');

    // fill out and submit form
    fireEvent.change(emailField, { target: { value: 'test@email.com' } });
    fireEvent.change(passwordField, { target: { value: 'password' } });
    fireEvent.click(button);

    // it sets loading state
    expect(button.disabled).toBe(true);
    expect(button.textContent).toBe('Loading...');

    await waitFor(() => {
      // it resets button
      expect(button.disabled).toBe(false);
      expect(button.textContent).toBe('Submit');

      const errorMessageText = getByText('invalid password');
      expect(errorMessageText).toBeInTheDocument();
    });
  });
});

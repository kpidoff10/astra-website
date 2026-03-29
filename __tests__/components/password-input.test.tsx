import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordInput } from '@/components/password-input';

describe('PasswordInput Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with label', () => {
    render(
      <PasswordInput
        id="password"
        name="password"
        value=""
        onChange={mockOnChange}
        label="Mot de passe"
      />
    );

    const label = screen.getByText('Mot de passe');
    expect(label).toBeInTheDocument();
  });

  it('renders input field with correct attributes', () => {
    render(
      <PasswordInput
        id="test-password"
        name="test-password"
        value=""
        onChange={mockOnChange}
        placeholder="Enter password"
        required
      />
    );

    const input = screen.getByPlaceholderText('Enter password') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('password');
    expect(input.required).toBe(true);
  });

  it('shows password when eye icon is clicked', () => {
    render(
      <PasswordInput
        id="password"
        name="password"
        value="TestPassword123"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByDisplayValue('TestPassword123') as HTMLInputElement;
    expect(input.type).toBe('password');

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    expect(input.type).toBe('text');
  });

  it('hides password when eye icon is clicked again', () => {
    render(
      <PasswordInput
        id="password"
        name="password"
        value="TestPassword123"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByDisplayValue('TestPassword123') as HTMLInputElement;
    const toggleButton = screen.getByRole('button');

    fireEvent.click(toggleButton);
    expect(input.type).toBe('text');

    fireEvent.click(toggleButton);
    expect(input.type).toBe('password');
  });

  it('calls onChange when input value changes', () => {
    render(
      <PasswordInput
        id="password"
        name="password"
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText('Mot de passe');
    fireEvent.change(input, { target: { value: 'NewPassword123' } });

    expect(mockOnChange).toHaveBeenCalledWith('NewPassword123');
  });

  it('renders hint text when provided', () => {
    render(
      <PasswordInput
        id="password"
        name="password"
        value=""
        onChange={mockOnChange}
        hint="Password must be at least 8 characters"
      />
    );

    const hint = screen.getByText('Password must be at least 8 characters');
    expect(hint).toBeInTheDocument();
  });

  it('has proper accessibility labels', () => {
    render(
      <PasswordInput
        id="password"
        name="password"
        value=""
        onChange={mockOnChange}
      />
    );

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveAttribute('aria-label');
  });

  it('supports custom className', () => {
    const { container } = render(
      <PasswordInput
        id="password"
        name="password"
        value=""
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    const input = container.querySelector('input');
    expect(input).toHaveClass('custom-class');
  });
});

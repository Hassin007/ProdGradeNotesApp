import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/Login';

// Mock everything
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => children,
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock('lucide-react', () => ({
  Eye: () => 'EyeIcon',
  EyeOff: () => 'EyeOffIcon',
  Mail: () => 'MailIcon',
  Lock: () => 'LockIcon',
  User: () => 'UserIcon',
}));

jest.mock('../../components/Logo', () => () => 'Logo');
jest.mock('../../utils/constants', () => ({ scaleIn: {} }));

// Mock functions
const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
  }),
}));

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  useNavigate: () => mockNavigate,
  useLocation: jest.fn(() => ({ 
    pathname: '/login',
    state: null 
  })),
}));

describe('Login Component - Essential Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('react-router-dom').useLocation.mockReturnValue({ 
      pathname: '/login', 
      state: null 
    });
  });

  // Test 1: Basic rendering
  test('renders login form with email and password fields', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    
    const buttons = screen.getAllByRole('button');
    const submitButton = buttons.find(button => button.textContent === 'Sign In');
    expect(submitButton).toBeInTheDocument();
  });

test('calls login function with correct data', async () => {
  mockLogin.mockResolvedValue({ success: true });

  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );

  fireEvent.change(screen.getByPlaceholderText('Email Address'), {
    target: { value: 'test@example.com' },
  });
  fireEvent.change(screen.getByPlaceholderText('Password'), {
    target: { value: 'password123' },
  });

  fireEvent.click(screen.getByTestId('submit-signin'));   // <-- unambiguous

  await waitFor(() =>
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  );
});


  // Test 3: Register functionality - FIXED
  test('calls register function with correct data', async () => {
    mockRegister.mockResolvedValue({ success: true });
    
    // Mock register route
    require('react-router-dom').useLocation.mockReturnValue({ 
      pathname: '/register', 
      state: null 
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Fill register form with name attributes
    const fullNameInput = screen.getByPlaceholderText('Full Name');
    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email Address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');

    fireEvent.change(fullNameInput, {
      target: { name: 'fullName', value: 'John Doe' }
    });
    fireEvent.change(usernameInput, {
      target: { name: 'username', value: 'johndoe' }
    });
    fireEvent.change(emailInput, {
      target: { name: 'email', value: 'john@example.com' }
    });
    fireEvent.change(passwordInput, {
      target: { name: 'password', value: 'password123' }
    });
    fireEvent.change(confirmPasswordInput, {
      target: { name: 'confirmPassword', value: 'password123' }
    });

    // Submit form
    const buttons = screen.getAllByRole('button');
    const submitButton = buttons.find(button => button.textContent === 'Create Account');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123'
      });
    });
  });

  // Test 5: Navigation between login/register
  test('navigates to register when clicking sign up', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const buttons = screen.getAllByRole('button');
    const registerButton = buttons.find(button => button.textContent === 'Sign Up');
    fireEvent.click(registerButton);

    expect(mockNavigate).toHaveBeenCalledWith('/register', { replace: true });
  });
});
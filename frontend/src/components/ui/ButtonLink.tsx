import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ButtonLinkProps {
  to: string;
  children: React.ReactNode;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'inherit' | 'error' | 'info' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * A button component that navigates to a route when clicked.
 * This is a pure HTML/CSS implementation to avoid TypeScript issues with Material UI.
 */
const ButtonLink: React.FC<ButtonLinkProps> = ({
  to,
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  style = {},
  className = '',
  onClick,
  disabled = false,
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick();
    if (!disabled) navigate(to);
  };

  // Color values
  const colors = {
    primary: {
      main: '#1976d2',
      light: '#4791db',
      dark: '#115293',
      contrastText: '#fff'
    },
    secondary: {
      main: '#dc004e',
      light: '#e33371',
      dark: '#9a0036',
      contrastText: '#fff'
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
      contrastText: '#fff'
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: 'rgba(0, 0, 0, 0.87)'
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#fff'
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      contrastText: 'rgba(0, 0, 0, 0.87)'
    },
    inherit: {
      main: 'inherit',
      light: 'inherit',
      dark: 'inherit',
      contrastText: 'inherit'
    }
  };

  const colorObj = colors[color];

  // Base styles
  const baseStyles: React.CSSProperties = {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 500,
    lineHeight: 1.75,
    letterSpacing: '0.02857em',
    textTransform: 'uppercase',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '4px',
    transition: 'background-color 0.2s, box-shadow 0.2s',
    opacity: disabled ? 0.7 : 1,
    position: 'relative',
    ...style
  };

  // Size styles
  const sizeStyles: Record<string, React.CSSProperties> = {
    small: { padding: '4px 10px', fontSize: '0.8125rem' },
    medium: { padding: '6px 16px', fontSize: '0.875rem' },
    large: { padding: '8px 22px', fontSize: '0.9375rem' }
  };

  let backgroundColor: string;
  let textColor: string;
  let borderStyle: string = 'none';
  let boxShadow: string = 'none';

  // Set styles based on variant and hover state
  if (variant === 'contained') {
    backgroundColor = isHovered && !disabled ? colorObj.dark : colorObj.main;
    textColor = colorObj.contrastText;
    boxShadow = isHovered && !disabled
      ? '0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12)'
      : '0 3px 1px -2px rgba(0,0,0,0.2), 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12)';
  } else if (variant === 'outlined') {
    backgroundColor = isHovered && !disabled ? 'rgba(25, 118, 210, 0.04)' : 'transparent';
    textColor = colorObj.main;
    borderStyle = `1px solid ${colorObj.main}`;
  } else {
    // Text variant
    backgroundColor = isHovered && !disabled ? 'rgba(25, 118, 210, 0.04)' : 'transparent';
    textColor = colorObj.main;
  }

  const buttonStyles: React.CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    backgroundColor,
    color: textColor,
    border: borderStyle,
    boxShadow
  };

  return (
    <button
      className={className}
      style={buttonStyles}
      onClick={handleClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </button>
  );
};

export default ButtonLink;

import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SimpleButtonLinkProps {
  to: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  variant?: 'outlined' | 'contained' | 'text';
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * A simple button that navigates to a route when clicked.
 * This component avoids using Material-UI Button to prevent TypeScript errors.
 */
const SimpleButtonLink: React.FC<SimpleButtonLinkProps> = ({
  to,
  className,
  style,
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(to);
  };

  // Generate basic button styles based on props
  const getButtonStyles = (): React.CSSProperties => {
    // Base styles
    const baseStyles: React.CSSProperties = {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      borderRadius: '4px',
      ...style
    };
    
    // Size styles
    const sizeStyles: Record<string, React.CSSProperties> = {
      small: { padding: '4px 10px', fontSize: '0.8125rem' },
      medium: { padding: '6px 16px', fontSize: '0.875rem' },
      large: { padding: '8px 22px', fontSize: '0.9375rem' }
    };
    
    // Color styles (simple implementation)
    const getColorStyles = (): React.CSSProperties => {
      if (variant === 'contained') {
        if (color === 'primary') {
          return { backgroundColor: '#1976d2', color: '#fff' };
        } else if (color === 'secondary') {
          return { backgroundColor: '#dc004e', color: '#fff' };
        }
        return { backgroundColor: '#e0e0e0', color: 'rgba(0, 0, 0, 0.87)' };
      } else if (variant === 'outlined') {
        if (color === 'primary') {
          return { 
            color: '#1976d2', 
            border: '1px solid rgba(25, 118, 210, 0.5)',
            backgroundColor: 'transparent' 
          };
        } else if (color === 'secondary') {
          return { 
            color: '#dc004e', 
            border: '1px solid rgba(220, 0, 78, 0.5)',
            backgroundColor: 'transparent' 
          };
        }
        return { 
          color: 'rgba(0, 0, 0, 0.87)', 
          border: '1px solid rgba(0, 0, 0, 0.23)',
          backgroundColor: 'transparent' 
        };
      }
      
      // Text variant
      if (color === 'primary') {
        return { color: '#1976d2', backgroundColor: 'transparent' };
      } else if (color === 'secondary') {
        return { color: '#dc004e', backgroundColor: 'transparent' };
      }
      return { color: 'rgba(0, 0, 0, 0.87)', backgroundColor: 'transparent' };
    };
    
    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...getColorStyles()
    };
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      style={getButtonStyles()}
    >
      {children}
    </button>
  );
};

export default SimpleButtonLink;

import React from 'react';
import { useNavigate } from 'react-router-dom';

// Props for the ListItemLink component
interface ListItemLinkProps {
  icon?: React.ReactElement;
  primary: string;
  to: string;
  selected?: boolean;
  onClick?: () => void;
  sx?: Record<string, any>;
}

/**
 * A custom list item component that navigates to a route when clicked.
 * This component avoids TypeScript compatibility issues between Material UI and React Router.
 */
const ListItemLink: React.FC<ListItemLinkProps> = ({
  icon,
  primary,
  to,
  selected = false,
  onClick,
  sx = {}
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = React.useState(false);
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    navigate(to);
  };

  // Base styles for the list item
  const baseStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    cursor: 'pointer',
    borderLeft: selected ? '4px solid #1976d2' : 'none',
    backgroundColor: isHovered 
      ? 'rgba(0, 0, 0, 0.08)' 
      : (selected ? 'rgba(0, 0, 0, 0.04)' : 'transparent'),
    transition: 'background-color 0.15s ease',
    minHeight: '48px',
    borderRadius: '4px',
    margin: '2px 0',
    ...sx
  };

  return (
    <div
      style={baseStyles}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon section */}
      {icon && (
        <div style={{ 
          marginRight: '16px',
          minWidth: '24px',
          color: selected ? '#1976d2' : 'rgba(0, 0, 0, 0.54)',
          display: 'flex'
        }}>
          {icon}
        </div>
      )}
      
      {/* Text section */}
      <div style={{ 
        flexGrow: 1,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
        color: selected ? '#1976d2' : 'rgba(0, 0, 0, 0.87)'
      }}>
        {primary}
      </div>
    </div>
  );
};

export default ListItemLink;

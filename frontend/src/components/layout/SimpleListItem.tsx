import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SxProps, Theme } from '@mui/material';

// Props for the SimpleListItem component
interface SimpleListItemProps {
  icon?: React.ReactElement;
  primary: string;
  to: string;
  selected?: boolean;
  sx?: SxProps<Theme>;
  onClick?: () => void;
}

/**
 * A simple list item component that navigates to a route when clicked
 * Avoids TypeScript compatibility issues with Material UI
 */
const SimpleListItem: React.FC<SimpleListItemProps> = (props) => {
  const { icon, primary, to, selected, sx, onClick } = props;
  const navigate = useNavigate();
  
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (onClick) {
      onClick();
    }
    navigate(to);
  };

  // Create basic styles similar to Material UI ListItem
  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    cursor: 'pointer',
    borderLeft: selected ? '4px solid #1976d2' : 'none',
    backgroundColor: selected ? 'rgba(0, 0, 0, 0.04)' : 'initial',
    transition: 'background-color 0.15s ease',
    borderRadius: '4px',
    margin: '4px 0',
    minHeight: '48px',
  };

  // Handle hover effect
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      onClick={handleClick}
      style={{
        ...baseStyle,
        backgroundColor: isHovered ? 'rgba(0, 0, 0, 0.08)' : (selected ? 'rgba(0, 0, 0, 0.04)' : 'initial'),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon section */}
      {icon && (
        <div style={{ marginRight: '16px', minWidth: '24px', display: 'flex', alignItems: 'center' }}>
          {icon}
        </div>
      )}
      
      {/* Text section */}
      <div style={{ flexGrow: 1 }}>
        <div style={{ 
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          fontSize: '1rem', 
          fontWeight: 500,
          lineHeight: 1.5,
        }}>
          {primary}
        </div>
      </div>
    </div>
  );
};

export default SimpleListItem;

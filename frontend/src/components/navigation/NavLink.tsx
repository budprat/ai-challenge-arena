import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  activeClassName?: string;
  activeStyle?: React.CSSProperties;
  isActive?: boolean;
  onClick?: () => void;
}

/**
 * A simple navigation link component that avoids TypeScript compatibility issues
 * between Material UI and React Router
 */
const NavLink: React.FC<NavLinkProps> = ({
  to,
  children,
  className = '',
  style = {},
  activeClassName = '',
  activeStyle = {},
  isActive = false,
  onClick,
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick();
    navigate(to);
  };

  const combinedClassName = `${className} ${isActive ? activeClassName : ''}`;
  const combinedStyle = {
    ...style,
    ...(isActive ? activeStyle : {}),
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
  };

  return (
    <div className={combinedClassName} style={combinedStyle} onClick={handleClick}>
      {children}
    </div>
  );
};

export default NavLink;

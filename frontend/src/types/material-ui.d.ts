import * as React from 'react';
import { Theme, SxProps } from '@mui/material/styles';

// Enhanced types for Material UI
declare module '@mui/material/styles' {
  interface Theme {
    // Add any custom theme properties here if needed
    status?: {
      danger?: string;
    };
  }
  
  interface ThemeOptions {
    // Add any custom theme options here if needed
    status?: {
      danger?: string;
    };
  }
  
  interface Palette {
    // Add any custom palette properties if needed
  }
  
  interface PaletteOptions {
    // Add any custom palette options if needed
  }
}

// Utility types used by MUI components
interface MuiComponentProps {
  sx?: SxProps<Theme>;
}

// Enhanced props for common MUI components
declare module '@mui/material' {
  interface BoxProps extends MuiComponentProps {
    component?: React.ElementType;
  }
  
  interface ButtonProps extends MuiComponentProps {
    component?: React.ElementType;
  }
  
  interface LinkProps extends MuiComponentProps {
    component?: React.ElementType;
  }
  
  interface TypographyProps extends MuiComponentProps {
    component?: React.ElementType;
  }
}

// Add declarations for MUI icons
declare module '@mui/icons-material';

// Type declarations for various modules

// For components with implicit 'any' type binding elements
interface HeaderProps {
  drawerWidth: number;
}

interface SidebarProps {
  drawerWidth: number;
}

// Challenge interface for the application
interface Challenge {
  id: string;
  title: string;
  description: string;
  rules: string;
  evaluation_criteria: any;
  data_pack_url: string | null;
  submission_deadline: string;
  is_sponsored: boolean;
  prize_amount: number;
  is_active: boolean;
  sponsor_id: string | null;
  season_id: string | null;
  created_at: string;
  updated_at: string;
}

// Create custom module declarations for axios
declare module 'axios' {
  interface AxiosRequestConfig {
    headers?: any;
  }
}

// Custom types for components with 'any' type parameters
declare namespace React {
  interface FunctionComponent<P = {}> {
    (props: P & { children?: React.ReactNode }): React.ReactElement | null;
  }
}

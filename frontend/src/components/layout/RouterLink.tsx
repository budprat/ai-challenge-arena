import { useNavigate } from 'react-router-dom';

/**
 * A hook-based navigation helper function
 * Returns a function that will navigate to the given path when called
 * Useful when you need to navigate programmatically outside of a Link
 */
export const useRouterLink = (to: string) => {
  const navigate = useNavigate();
  return () => navigate(to);
};

export default useRouterLink;

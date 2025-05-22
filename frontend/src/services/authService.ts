import axios from 'axios';

// Define API base URL
const API_URL = '/api/auth';

// Define user interface
export interface User {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  profile_image?: string;
}

// Define interfaces for request payloads
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// Auth service methods
const authService = {
  // Login user
  login: async (credentials: LoginCredentials) => {
    // For development purposes, return mock data
    console.log('Attempting login with:', credentials);
    return {
      access_token: 'mock-token',
      token_type: 'bearer',
      user: {
        id: '1',
        email: credentials.email,
        name: 'Mock User',
        is_admin: false
      } as User
    };
    
    // Actual implementation would be:
    // const response = await axios.post(`${API_URL}/login`, credentials);
    // return response.data;
  },

  // Register new user
  register: async (data: RegisterData) => {
    // For development purposes, return mock data
    console.log('Attempting registration with:', data);
    return {
      access_token: 'mock-token',
      token_type: 'bearer',
      user: {
        id: '1',
        email: data.email,
        name: data.name,
        is_admin: false
      } as User
    };
    
    // Actual implementation would be:
    // const response = await axios.post(`${API_URL}/register`, data);
    // return response.data;
  },

  // Get current user profile
  getUserProfile: async () => {
    // For development purposes, return mock data
    console.log('Fetching user profile');
    return {
      id: '1',
      email: 'user@example.com',
      name: 'Mock User',
      is_admin: false,
      profile_image: 'https://via.placeholder.com/150'
    } as User;
    
    // Actual implementation would be:
    // const response = await axios.get(`${API_URL}/me`);
    // return response.data;
  },

  // Logout user
  logout: async () => {
    // For development purposes, just log
    console.log('Logging out user');
    localStorage.removeItem('token');
    
    // Actual implementation would be:
    // await axios.post(`${API_URL}/logout`);
    // localStorage.removeItem('token');
  }
};

export default authService;

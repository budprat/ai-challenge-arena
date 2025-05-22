import axios from 'axios';
import { Notification } from '@/types/models';

// Define API base URL
const API_URL = '/api/notifications';

// Define notification types for type safety
type NotificationType = 'SYSTEM_ANNOUNCEMENT' | 'BADGE_AWARDED' | 'SUBMISSION_EVALUATED' | 'SUBMISSION_REVIEWED' | 'OTHER';

// Notification service methods
const notificationService = {
  // Get all notifications for the current user
  getNotifications: async (unreadOnly: boolean = false): Promise<Notification[]> => {
    // For development purposes, return mock data
    console.log('Fetching notifications', unreadOnly ? '(unread only)' : '');
    
    const mockNotifications: Notification[] = [
      {
        id: '1',
        user_id: '1',
        title: 'Welcome to EliteBuilders!',
        message: 'Thank you for joining the EliteBuilders platform. Start exploring challenges now!',
        type: 'SYSTEM_ANNOUNCEMENT' as NotificationType,
        reference_id: null,
        read: false,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        user_id: '1',
        title: 'New Challenge Available',
        message: 'A new AI challenge "Conversational Shopping Bot" has been added to the platform.',
        type: 'SYSTEM_ANNOUNCEMENT' as NotificationType,
        reference_id: '3', // Challenge ID
        read: false,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        id: '3',
        user_id: '1',
        title: 'Badge Awarded',
        message: 'Congratulations! You have earned the "First Login" badge.',
        type: 'BADGE_AWARDED' as NotificationType,
        reference_id: '1', // Badge ID
        read: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      }
    ];
    
    // Filter for unread notifications if requested
    return unreadOnly ? mockNotifications.filter(notification => !notification.read) : mockNotifications;
    
    // Actual implementation would be:
    // const params = unreadOnly ? '?unread_only=true' : '';
    // const response = await axios.get(`${API_URL}${params}`);
    // return response.data;
  },

  // Get count of unread notifications
  getUnreadCount: async (): Promise<number> => {
    // For development purposes, return mock data
    console.log('Fetching unread notification count');
    
    return 2; // Mocked unread count
    
    // Actual implementation would be:
    // const response = await axios.get(`${API_URL}/unread/count`);
    // return response.data.count;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<void> => {
    // For development purposes, just log
    console.log('Marking notification as read:', id);
    
    // Actual implementation would be:
    // await axios.patch(`${API_URL}/${id}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    // For development purposes, just log
    console.log('Marking all notifications as read');
    
    // Actual implementation would be:
    // await axios.patch(`${API_URL}/read-all`);
  }
};

export default notificationService;

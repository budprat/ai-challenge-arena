import axios from 'axios';
import { Challenge } from '@/types/models';

// Define API base URL
const API_URL = '/api/challenges';

// Challenge service methods
const challengeService = {
  // Get all challenges with optional filters
  getChallenges: async (
    activeOnly: boolean = true,
    sponsorId: string | null = null,
    seasonId: string | null = null,
    searchQuery: string = ''
  ): Promise<Challenge[]> => {
    // For development purposes, return mock data
    console.log('Fetching challenges with filters:', { activeOnly, sponsorId, seasonId, searchQuery });
    
    return [
      {
        id: '1',
        title: 'AI Customer Service Assistant',
        description: 'Build an AI assistant that can handle customer service inquiries across multiple channels with natural language understanding and contextual responses.',
        rules: 'Build a solution that can understand and respond to customer inquiries. The assistant should maintain context across multiple messages.',
        evaluation_criteria: 'Natural language understanding, contextual awareness, response quality, ease of integration',
        submission_guidelines: 'Submit a GitHub repository, a 5-minute demo video, and a brief technical document.',
        prizes: '$2,000 for first place, $1,000 for second place',
        submission_deadline: '2025-06-30T23:59:59Z',
        start_date: '2025-05-15T00:00:00Z',
        is_active: true,
        is_sponsored: true,
        sponsor_id: '1',
        sponsor_name: 'TechCorp',
        season_id: '1',
        difficulty_level: 'Intermediate'
      },
      {
        id: '2',
        title: 'Smart Document Processing',
        description: 'Create a system that can automatically extract and process information from various document types, including invoices, receipts, and contracts.',
        rules: 'Your solution should be able to extract key information from different document types with high accuracy.',
        evaluation_criteria: 'Accuracy of extraction, support for multiple document types, error handling, output format',
        submission_guidelines: 'Submit a GitHub repository, a demo video showcasing the extraction process, and a document explaining your approach.',
        prizes: '$1,500 for first place, $750 for second place',
        submission_deadline: '2025-07-15T23:59:59Z',
        start_date: '2025-05-20T00:00:00Z',
        is_active: true,
        is_sponsored: false,
        sponsor_id: null,
        sponsor_name: null,
        season_id: '1',
        difficulty_level: 'Advanced'
      },
      {
        id: '3',
        title: 'Conversational Shopping Bot',
        description: 'Develop a conversational AI that can help customers find products, compare options, and complete purchases through natural dialogue.',
        rules: 'The bot should be able to understand product queries, make recommendations, and guide users through the purchase process.',
        evaluation_criteria: 'Conversation flow, product understanding, recommendation quality, purchase completion rate',
        submission_guidelines: 'Submit a GitHub repository, a live demo, and a presentation explaining your approach.',
        prizes: '$2,500 for first place, $1,200 for second place, $500 for third place',
        submission_deadline: '2025-08-01T23:59:59Z',
        start_date: '2025-06-01T00:00:00Z',
        is_active: true,
        is_sponsored: true,
        sponsor_id: '2',
        sponsor_name: 'ShopSmart',
        season_id: '1',
        difficulty_level: 'Intermediate'
      }
    ];
    
    // Actual implementation would be:
    // const params = new URLSearchParams();
    // if (activeOnly) params.append('active_only', 'true');
    // if (sponsorId) params.append('sponsor_id', sponsorId);
    // if (seasonId) params.append('season_id', seasonId);
    // if (searchQuery) params.append('search', searchQuery);
    // 
    // const response = await axios.get(`${API_URL}?${params.toString()}`);
    // return response.data;
  },

  // Get challenge by ID
  getChallengeById: async (id: string): Promise<Challenge> => {
    // For development purposes, return mock data
    console.log('Fetching challenge with ID:', id);
    
    return {
      id,
      title: 'AI Customer Service Assistant',
      description: 'Build an AI assistant that can handle customer service inquiries across multiple channels with natural language understanding and contextual responses.',
      rules: 'Build a solution that can understand and respond to customer inquiries. The assistant should maintain context across multiple messages.',
      evaluation_criteria: 'Natural language understanding, contextual awareness, response quality, ease of integration',
      submission_guidelines: 'Submit a GitHub repository, a 5-minute demo video, and a brief technical document.',
      prizes: '$2,000 for first place, $1,000 for second place',
      submission_deadline: '2025-06-30T23:59:59Z',
      start_date: '2025-05-15T00:00:00Z',
      is_active: true,
      is_sponsored: true,
      sponsor_id: '1',
      sponsor_name: 'TechCorp',
      season_id: '1',
      difficulty_level: 'Intermediate'
    };
    
    // Actual implementation would be:
    // const response = await axios.get(`${API_URL}/${id}`);
    // return response.data;
  },

  // Get recommended challenges for the user
  getRecommendedChallenges: async (): Promise<Challenge[]> => {
    // For development purposes, return mock data
    console.log('Fetching recommended challenges');
    
    return [
      {
        id: '1',
        title: 'AI Customer Service Assistant',
        description: 'Build an AI assistant that can handle customer service inquiries across multiple channels with natural language understanding and contextual responses.',
        rules: 'Build a solution that can understand and respond to customer inquiries. The assistant should maintain context across multiple messages.',
        evaluation_criteria: 'Natural language understanding, contextual awareness, response quality, ease of integration',
        submission_guidelines: 'Submit a GitHub repository, a 5-minute demo video, and a brief technical document.',
        prizes: '$2,000 for first place, $1,000 for second place',
        submission_deadline: '2025-06-30T23:59:59Z',
        start_date: '2025-05-15T00:00:00Z',
        is_active: true,
        is_sponsored: true,
        sponsor_id: '1',
        sponsor_name: 'TechCorp',
        season_id: '1',
        difficulty_level: 'Intermediate'
      },
      {
        id: '3',
        title: 'Conversational Shopping Bot',
        description: 'Develop a conversational AI that can help customers find products, compare options, and complete purchases through natural dialogue.',
        rules: 'The bot should be able to understand product queries, make recommendations, and guide users through the purchase process.',
        evaluation_criteria: 'Conversation flow, product understanding, recommendation quality, purchase completion rate',
        submission_guidelines: 'Submit a GitHub repository, a live demo, and a presentation explaining your approach.',
        prizes: '$2,500 for first place, $1,200 for second place, $500 for third place',
        submission_deadline: '2025-08-01T23:59:59Z',
        start_date: '2025-06-01T00:00:00Z',
        is_active: true,
        is_sponsored: true,
        sponsor_id: '2',
        sponsor_name: 'ShopSmart',
        season_id: '1',
        difficulty_level: 'Intermediate'
      }
    ];
    
    // Actual implementation would be:
    // const response = await axios.get(`${API_URL}/recommended`);
    // return response.data;
  }
};

export default challengeService;

import axios from 'axios';
import { Submission, SubmissionWithEvaluation } from '@/types/models';

// Define API base URL
const API_URL = '/api/submissions';

// Submission service methods
const submissionService = {
  // Get current user's submissions, optionally filtered by challenge
  getUserSubmissions: async (challengeId: string | null = null): Promise<Submission[]> => {
    // For development purposes, return mock data
    console.log('Fetching user submissions', challengeId ? `for challenge ${challengeId}` : '');
    
    const mockSubmissions: Submission[] = [
      {
        id: '1',
        user_id: '1',
        challenge_id: '1',
        repo_url: 'https://github.com/user/ai-customer-service',
        deck_url: 'https://slides.com/user/ai-customer-service',
        video_url: 'https://youtube.com/watch?v=abcdef123456',
        description: 'An AI assistant that handles customer service inquiries with natural language understanding.',
        status: 'EVALUATED',
        llm_score: 85,
        human_score: null,
        final_score: 85,
        feedback: 'Great implementation of context tracking between messages.',
        evaluation_data: {
          llm_evaluation: {
            criteria_scores: {
              'Natural language understanding': 88,
              'Contextual awareness': 85,
              'Response quality': 83,
              'Ease of integration': 84
            }
          },
          repo_test_results: {
            passed: true,
            tests_passed: 15,
            tests_failed: 2
          }
        },
        created_at: '2025-05-18T14:30:00Z',
        updated_at: '2025-05-19T10:15:00Z'
      },
      {
        id: '2',
        user_id: '1',
        challenge_id: '2',
        repo_url: 'https://github.com/user/document-processor',
        deck_url: 'https://slides.com/user/document-processor',
        video_url: 'https://youtube.com/watch?v=ghijk789012',
        description: 'A system that automatically extracts information from various document types.',
        status: 'PROCESSING',
        llm_score: null,
        human_score: null,
        final_score: null,
        feedback: null,
        evaluation_data: {},
        created_at: '2025-05-20T09:45:00Z',
        updated_at: '2025-05-20T09:45:00Z'
      }
    ];
    
    return mockSubmissions.filter(submission => !challengeId || submission.challenge_id === challengeId);
    
    // Actual implementation would be:
    // const params = challengeId ? `?challenge_id=${challengeId}` : '';
    // const response = await axios.get(`${API_URL}/user${params}`);
    // return response.data;
  },

  // Get submission by ID
  getSubmissionById: async (id: string): Promise<SubmissionWithEvaluation> => {
    // For development purposes, return mock data
    console.log('Fetching submission with ID:', id);
    
    const submissionWithEval: SubmissionWithEvaluation = {
      id,
      user_id: '1',
      challenge_id: '1',
      repo_url: 'https://github.com/user/ai-customer-service',
      deck_url: 'https://slides.com/user/ai-customer-service',
      video_url: 'https://youtube.com/watch?v=abcdef123456',
      description: 'An AI assistant that handles customer service inquiries with natural language understanding.',
      status: 'EVALUATED',
      llm_score: 85,
      human_score: null,
      final_score: 85,
      feedback: 'Great implementation of context tracking between messages.',
      evaluation_data: {
        llm_evaluation: {
          criteria_scores: {
            'Natural language understanding': 88,
            'Contextual awareness': 85,
            'Response quality': 83,
            'Ease of integration': 84
          },
          overall_score: 85,
          strengths: [
            'Strong natural language processing capabilities',
            'Excellent context maintenance across conversation turns',
            'Good error handling for edge cases'
          ],
          areas_for_improvement: [
            'Response generation could be more concise',
            'Integration process requires some technical knowledge'
          ]
        },
        repo_test_results: {
          passed: true,
          tests_passed: 15,
          tests_failed: 2,
          test_details: [
            { name: 'Basic response test', passed: true },
            { name: 'Context memory test', passed: true },
            { name: 'Edge case handling', passed: false }
          ]
        },
        scores: {
          overall: 85,
          implementation: 87,
          innovation: 82,
          presentation: 86
        },
        feedback: 'Great implementation of context tracking between messages. The solution demonstrates good understanding of natural language processing techniques.'
      },
      created_at: '2025-05-18T14:30:00Z',
      updated_at: '2025-05-19T10:15:00Z'
    };
    
    return submissionWithEval;
    
    // Actual implementation would be:
    // const response = await axios.get(`${API_URL}/${id}`);
    // return response.data;
  },

  // Create a new submission
  createSubmission: async (data: any): Promise<Submission> => {
    // For development purposes, return mock data
    console.log('Creating submission with data:', data);
    
    const mockSubmission: Submission = {
      id: Math.floor(Math.random() * 1000).toString(),
      user_id: '1',
      challenge_id: data.challenge_id,
      repo_url: data.repo_url,
      deck_url: data.deck_url,
      video_url: data.video_url,
      description: data.description,
      status: 'PENDING',
      llm_score: null,
      human_score: null,
      final_score: null,
      feedback: null,
      evaluation_data: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return mockSubmission;
    
    // Actual implementation would be:
    // const response = await axios.post(API_URL, data);
    // return response.data;
  },

  // Update a submission
  updateSubmission: async (id: string, data: any): Promise<Submission> => {
    // For development purposes, return mock data
    console.log('Updating submission', id, 'with data:', data);
    
    const mockSubmission: Submission = {
      id,
      user_id: '1',
      challenge_id: data.challenge_id || '1',
      repo_url: data.repo_url || 'https://github.com/user/ai-customer-service',
      deck_url: data.deck_url || 'https://slides.com/user/ai-customer-service',
      video_url: data.video_url || 'https://youtube.com/watch?v=abcdef123456',
      description: data.description || 'An AI assistant that handles customer service inquiries.',
      status: 'PENDING', // Reset to pending after update
      llm_score: null,
      human_score: null,
      final_score: null,
      feedback: null,
      evaluation_data: {},
      created_at: '2025-05-18T14:30:00Z',
      updated_at: new Date().toISOString()
    };
    
    return mockSubmission;
    
    // Actual implementation would be:
    // const response = await axios.put(`${API_URL}/${id}`, data);
    // return response.data;
  },

  // Request evaluation for a submission
  evaluateSubmission: async (id: string): Promise<SubmissionWithEvaluation> => {
    // For development purposes, return mock data
    console.log('Requesting evaluation for submission:', id);
    
    const evaluatedSubmission: SubmissionWithEvaluation = {
      id,
      user_id: '1',
      challenge_id: '1',
      repo_url: 'https://github.com/user/ai-customer-service',
      deck_url: 'https://slides.com/user/ai-customer-service',
      video_url: 'https://youtube.com/watch?v=abcdef123456',
      description: 'An AI assistant that handles customer service inquiries with natural language understanding.',
      status: 'EVALUATED',
      llm_score: 85,
      human_score: null,
      final_score: 85,
      feedback: 'Great implementation of context tracking between messages.',
      evaluation_data: {
        llm_evaluation: {
          criteria_scores: {
            'Natural language understanding': 88,
            'Contextual awareness': 85,
            'Response quality': 83,
            'Ease of integration': 84
          },
          overall_score: 85
        },
        repo_test_results: {
          passed: true,
          tests_passed: 15,
          tests_failed: 2
        },
        scores: {
          overall: 85,
          implementation: 87,
          innovation: 82,
          presentation: 86
        },
        feedback: 'Great implementation of context tracking between messages.'
      },
      created_at: '2025-05-18T14:30:00Z',
      updated_at: new Date().toISOString()
    };
    
    return evaluatedSubmission;
    
    // Actual implementation would be:
    // const response = await axios.post(`${API_URL}/${id}/evaluate`);
    // return response.data;
  }
};

export default submissionService;

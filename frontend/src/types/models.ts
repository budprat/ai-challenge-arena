// Common interfaces for the application

export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  github_url?: string;
  portfolio_url?: string;
  resume_url?: string;
  is_admin: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  rules: string;
  evaluation_criteria: any;
  data_pack_url?: string | null;
  submission_guidelines?: string;
  prizes?: string;
  prize_amount?: number;
  submission_deadline: string;
  start_date?: string;
  is_sponsored: boolean;
  is_active: boolean;
  sponsor_id: string | null;
  sponsor_name?: string | null;
  season_id: string | null;
  difficulty_level?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Submission {
  id: string;
  user_id: string;
  challenge_id: string;
  repo_url: string;
  deck_url: string | null;
  video_url: string | null;
  description: string;
  status: 'PENDING' | 'PROCESSING' | 'EVALUATED' | 'REVIEWED';
  llm_score: number | null;
  human_score: number | null;
  final_score: number | null;
  feedback: string | null;
  evaluation_data: any;
  created_at: string;
  updated_at: string;
}

export interface SubmissionWithEvaluation extends Submission {
  evaluation_data: {
    llm_evaluation: any;
    repo_test_results: any;
    scores: any;
    feedback: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'SYSTEM_ANNOUNCEMENT' | 'BADGE_AWARDED' | 'SUBMISSION_EVALUATED' | 'SUBMISSION_REVIEWED' | 'OTHER';
  reference_id: string | null;
  read: boolean;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  image_url: string;
  criteria: string;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  challenge_id: string | null;
  submission_id: string | null;
  awarded_at: string;
  badge: Badge;
}

export interface Season {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  score: number;
  rank: number;
  challenge_count: number;
  badge_count: number;
  avatar_url?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  website_url: string;
  created_at: string;
  updated_at: string;
}

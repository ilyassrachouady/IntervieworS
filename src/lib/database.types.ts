export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      interview_sessions: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          score: number;
          duration: number;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          score: number;
          duration: number;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          score?: number;
          duration?: number;
          completed_at?: string;
          created_at?: string;
        };
      };
      interview_questions: {
        Row: {
          id: string;
          session_id: string;
          question: string;
          answer: string;
          score: number;
          feedback: string;
          response_time: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          question: string;
          answer: string;
          score: number;
          feedback: string;
          response_time: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          question?: string;
          answer?: string;
          score?: number;
          feedback?: string;
          response_time?: number;
          created_at?: string;
        };
      };
    };
  };
}
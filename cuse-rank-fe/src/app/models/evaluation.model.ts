export interface Poster {
    id: string;
    event_id: string;
    title: string;
    abstract: string;
    advisor_id: string;
    program: string;
    created_at: string;
    relevance_score: number;
  }
  
  export interface EvaluationResponse {
    message: string;
    posters: Poster[];
    name: string;
    img?: string;
  }
  
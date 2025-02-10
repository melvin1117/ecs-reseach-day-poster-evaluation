export interface Poster {
  id: string;
  event_id: string;
  title: string;
  abstract: string;
  program: string;
  relevance_score: number;
  advisor: string | null;
}

export interface EvaluationResponse {
  judge_id: string;
  name: string;
  email: string;
  img: string;
  dept: any;
  event: any;
  posters: { [group: string]: Poster[] }
}
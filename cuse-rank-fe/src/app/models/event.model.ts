export interface Event {
    id: string;
    name: string;
    description?: string;
    start_date: string;          // ISO date string from backend
    end_date: string;
    judging_start_time: string;
    judging_end_time: string;
    created_by: string;
    min_posters_per_judge: number;
    max_posters_per_judge: number;
    criteria: { [key: string]: number }; // key-value pairs of criteria and their weights
  }
  
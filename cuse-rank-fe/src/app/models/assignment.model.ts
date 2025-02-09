export interface Poster {
    id: string;
    title: string;
    abstract: string;
  }
  
  export interface Assignment {
    judgeName: string;
    uniqueCode: string;
    posters: Poster[];
  }
  
  export interface AssignmentResponse {
    event_id: string;
    assignments: Assignment[];
  }
  
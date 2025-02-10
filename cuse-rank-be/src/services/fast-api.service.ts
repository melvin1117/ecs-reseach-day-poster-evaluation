import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class FastApiService {
  private fastApiBaseUrl = 'http://cuse-rank-algo:8000';

  async startTask(eventId: string): Promise<any> {
    try {
        const response = await axios.post(`${this.fastApiBaseUrl}/start-task?event_id=${eventId}`);
        return response.data;
    } catch (error) {
        console.log(error);
        throw new HttpException(error.response?.data || 'FastAPI request failed', HttpStatus.BAD_GATEWAY);
    }
  }

  async getTaskStatus(taskId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.fastApiBaseUrl}/task-status/${taskId}`);
      return response.data;
    } catch (error) {
      throw new HttpException(error.response?.data || 'FastAPI request failed', HttpStatus.BAD_GATEWAY);
    }
  }
}

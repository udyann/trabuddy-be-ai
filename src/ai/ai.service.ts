import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { AIResponse } from './ai.types';


@Injectable()
export class AiService {
  async getResponse(prompt: string): Promise<AIResponse> {
    const res = await axios.post('http://ai:8001/ask', {
      question: prompt,
    });
    
    return res.data.response;
  }
}

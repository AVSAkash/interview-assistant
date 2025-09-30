import axios from 'axios';
import { type Question } from '../features/interviewSlice';

const API_ENDPOINT = '/api/interview';

export const generateQuestion = async (difficulty: 'easy' | 'medium' | 'hard') => {
  const response = await axios.post(API_ENDPOINT, {
    type: 'generate-question',
    payload: { difficulty },
  });
  return response.data.response as string;
};

export const evaluateAnswer = async (question: string, answer: string) => {
  const response = await axios.post(API_ENDPOINT, {
    type: 'evaluate-answer',
    payload: { question, answer },
  });
  return response.data as { score: number; feedback: string };
};

export const generateSummary = async (fullInterview: Question[]) => {
  const response = await axios.post(API_ENDPOINT, {
    type: 'generate-summary',
    payload: { fullInterview },
  });
  return response.data.response as string;
};
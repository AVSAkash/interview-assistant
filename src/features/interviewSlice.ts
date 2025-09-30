import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Question {
  questionText: string;
  answer: string;
  score: number;
  feedback: string;
}

interface InterviewState {
  status: 'idle' | 'in-progress' | 'finished';
  questions: Question[];
  currentQuestionIndex: number;
  candidateDetails: { name: string; email: string; phone: string; } | null;
}

const initialState: InterviewState = {
  status: 'idle',
  questions: [],
  currentQuestionIndex: 0,
  candidateDetails: null,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    startInterview: (state, action: PayloadAction<{ name: string; email: string; phone: string; }>) => {
      state.status = 'in-progress';
      state.candidateDetails = action.payload;
      state.questions = [];
      state.currentQuestionIndex = 0;
    },
    addQuestion: (state, action: PayloadAction<string>) => {
      state.questions.push({
        questionText: action.payload,
        answer: '',
        score: 0,
        feedback: '',
      });
    },
    submitAnswer: (state, action: PayloadAction<{ answer: string; score: number; feedback: string; }>) => {
      const { answer, score, feedback } = action.payload;
      state.questions[state.currentQuestionIndex].answer = answer;
      state.questions[state.currentQuestionIndex].score = score;
      state.questions[state.currentQuestionIndex].feedback = feedback;
    },
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < 5) { // 6 questions total (0-5)
        state.currentQuestionIndex += 1;
      } else {
        state.status = 'finished';
      }
    },
    resetInterview: () => initialState,
  },
});

export const { startInterview, addQuestion, submitAnswer, nextQuestion, resetInterview } = interviewSlice.actions;
export default interviewSlice.reducer;
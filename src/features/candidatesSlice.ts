import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Question } from './interviewSlice';

interface Candidate {
  id: string;
  details: { name: string; email: string; phone: string; };
  interview: Question[];
  finalScore: number;
  summary: string;
  date: string;
}

interface CandidatesState {
  candidates: Candidate[];
}

const initialState: CandidatesState = {
  candidates: [],
};

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action: PayloadAction<Candidate>) => {
      state.candidates.unshift(action.payload); // Add to the beginning of the list
    },
  },
});

export const { addCandidate } = candidatesSlice.actions;
export default candidatesSlice.reducer;
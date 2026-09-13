import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type VoiceDemoPhase = "idle" | "listening" | "thinking" | "responded";

interface VoiceDemoState {
  phase: VoiceDemoPhase;
  lastResponse: string | null;
}

const initialState: VoiceDemoState = {
  phase: "idle",
  lastResponse: null,
};

const voiceDemoSlice = createSlice({
  name: "voiceDemo",
  initialState,
  reducers: {
    setPhase: (state, action: PayloadAction<VoiceDemoPhase>) => {
      state.phase = action.payload;
    },
    setResponse: (state, action: PayloadAction<string>) => {
      state.lastResponse = action.payload;
      state.phase = "responded";
    },
    reset: (state) => {
      state.phase = "idle";
      state.lastResponse = null;
    },
  },
});

export const { setPhase, setResponse, reset } = voiceDemoSlice.actions;
export default voiceDemoSlice.reducer;

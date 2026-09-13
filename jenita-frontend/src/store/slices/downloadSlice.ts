import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { OS } from "@/types";

interface DownloadState {
  selectedOS: OS;
}

const initialState: DownloadState = {
  selectedOS: "macOS",
};

const downloadSlice = createSlice({
  name: "download",
  initialState,
  reducers: {
    setSelectedOS: (state, action: PayloadAction<OS>) => {
      state.selectedOS = action.payload;
    },
  },
});

export const { setSelectedOS } = downloadSlice.actions;
export default downloadSlice.reducer;

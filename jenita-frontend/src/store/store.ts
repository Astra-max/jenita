import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./features/auth/authSlice";
import navReducer from "./slices/navSlice";
import downloadReducer from "./slices/downloadSlice";
import voiceDemoReducer from "./slices/voiceDemoSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    nav: navReducer,
    download: downloadReducer,
    voiceDemo: voiceDemoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
import { configureStore } from "@reduxjs/toolkit";
import navReducer from "./slices/navSlice";
import downloadReducer from "./slices/downloadSlice";
import voiceDemoReducer from "./slices/voiceDemoSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      nav: navReducer,
      download: downloadReducer,
      voiceDemo: voiceDemoReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

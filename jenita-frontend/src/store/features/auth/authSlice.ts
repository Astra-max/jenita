import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  resetEmailSent: boolean;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
  resetEmailSent: false,
};

// Mock network delay so the UI can show real loading states.
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_ACCOUNT = {
  email: "demo@jenita.app",
  password: "jenita123",
  name: "Demo User",
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    payload: { email: string; password: string },
    { rejectWithValue }
  ) => {
    await wait(900);
    const email = payload.email.trim().toLowerCase();
    if (email === MOCK_ACCOUNT.email && payload.password === MOCK_ACCOUNT.password) {
      return { id: "usr_1", name: MOCK_ACCOUNT.name, email } satisfies User;
    }
    // Any other well-formed credentials also succeed, so the flow is explorable.
    if (payload.password.length >= 6) {
      return {
        id: crypto.randomUUID(),
        name: email.split("@")[0],
        email,
      } satisfies User;
    }
    return rejectWithValue("That email and password don't match an account.");
  }
);

export const signupUser = createAsyncThunk(
  "auth/signup",
  async (
    payload: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    await wait(900);
    if (payload.email.trim().toLowerCase() === MOCK_ACCOUNT.email) {
      return rejectWithValue("An account with that email already exists.");
    }
    return {
      id: crypto.randomUUID(),
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
    } satisfies User;
  }
);

export const requestPasswordReset = createAsyncThunk(
  "auth/forgotPassword",
  async (payload: { email: string }, { rejectWithValue }) => {
    await wait(900);
    if (!payload.email.includes("@")) {
      return rejectWithValue("Enter a valid email address.");
    }
    return payload.email;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
    resetResetEmailSent(state) {
      state.resetEmailSent = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Something went wrong. Try again.";
      })
      .addCase(signupUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Something went wrong. Try again.";
      })
      .addCase(requestPasswordReset.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.resetEmailSent = false;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.status = "succeeded";
        state.resetEmailSent = true;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Something went wrong. Try again.";
      });
  },
});

export const { logout, clearAuthError, resetResetEmailSent } = authSlice.actions;
export default authSlice.reducer;

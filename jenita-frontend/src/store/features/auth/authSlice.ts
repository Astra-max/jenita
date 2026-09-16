import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authApi, setToken } from "../../../lib/api";

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
    try {
      const res = await authApi.login({ email: payload.email, password: payload.password });
      // Persist token for subsequent requests
      setToken(res.token);
      // Map server user shape to local User interface
      const usr = {
        id: res.user.id,
        name: (res.user.full_name as string) || (res.user.email as string).split("@")[0],
        email: res.user.email as string,
      } as User;
      return usr;
    } catch (err: any) {
      return rejectWithValue(err.message || "Authentication failed");
    }
  }
);

export const signupUser = createAsyncThunk(
  "auth/signup",
  async (
    payload: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await authApi.register({ email: payload.email, password: payload.password, full_name: payload.name });
      setToken(res.token);
      const usr = {
        id: res.user.id,
        name: res.user.full_name as string,
        email: res.user.email as string,
      } as User;
      return usr;
    } catch (err: any) {
      return rejectWithValue(err.message || "Registration failed");
    }
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

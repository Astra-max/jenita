import { createSlice } from "@reduxjs/toolkit";

interface NavState {
  mobileMenuOpen: boolean;
}

const initialState: NavState = {
  mobileMenuOpen: false,
};

const navSlice = createSlice({
  name: "nav",
  initialState,
  reducers: {
    openMobileMenu: (state) => {
      state.mobileMenuOpen = true;
    },
    closeMobileMenu: (state) => {
      state.mobileMenuOpen = false;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
  },
});

export const { openMobileMenu, closeMobileMenu, toggleMobileMenu } = navSlice.actions;
export default navSlice.reducer;

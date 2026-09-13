"use client";

import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "@/store/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#000000",
            color: "#ffffff",
            fontSize: "14px",
            borderRadius: "10px",
            padding: "12px 16px",
          },
          success: {
            iconTheme: { primary: "#f472b6", secondary: "#ffffff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
          },
        }}
      />
    </Provider>
  );
}

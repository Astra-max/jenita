"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import { store } from "@/store/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
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
              iconTheme: {
                primary: "#f472b6",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </QueryClientProvider>
    </Provider>
  );
}
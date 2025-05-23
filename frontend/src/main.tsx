import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "./index.css";
import App from "./App.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./config/queryClient.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <ReactQueryDevtools position="right" initialIsOpen={false} />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);

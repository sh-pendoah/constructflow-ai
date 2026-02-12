"use client";

import React from "react";
import { Provider } from "react-redux";
import dynamic from "next/dynamic";
import { store, persistor } from "./store";

// Dynamically import PersistGate to avoid SSR issues
const PersistGate = dynamic(
  () => import("redux-persist/integration/react").then((mod) => mod.PersistGate),
  {
    ssr: false,
  }
);

interface StoreProviderProps {
  children: React.ReactNode;
}

/**
 * Redux Store Provider Component
 * Wraps the app with Redux Provider and PersistGate for Next.js
 * Handles SSR compatibility by dynamically importing PersistGate
 */
export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default StoreProvider;


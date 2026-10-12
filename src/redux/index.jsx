"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { makeStore } from "./store";

export function StoreProvider({ children }) {
  const storeRef = useRef(null);
  const persistorRef = useRef(null);

  if (!storeRef.current) {
    const { store, persistor } = makeStore();

    storeRef.current = store;

    persistorRef.current = persistor;
  }

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistorRef.current}>
        {children}
      </PersistGate>
    </Provider>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { catalog, DEMO_DEFAULT_READER_ID } from "@/data/catalog";
import type { ReaderProfile } from "@/types/domain";

const STORAGE_KEY = "vti-demo-reader";

type DemoReaderContextValue = {
  reader: ReaderProfile;
  setReaderId: (id: string) => void;
  readers: ReaderProfile[];
  ready: boolean;
};

const DemoReaderContext = createContext<DemoReaderContextValue | null>(null);

export function DemoReaderProvider({ children }: { children: ReactNode }) {
  const [readerId, setReaderIdState] = useState(DEMO_DEFAULT_READER_ID);
  const [ready, setReady] = useState(false);
  const readers = catalog.readers;

  useLayoutEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && readers.some((item) => item.id === stored)) {
      setReaderIdState(stored);
    }
    setReady(true);
  }, [readers]);

  const setReaderId = useCallback((id: string) => {
    sessionStorage.setItem(STORAGE_KEY, id);
    setReaderIdState(id);
  }, []);

  const reader = useMemo(
    () => readers.find((item) => item.id === readerId) ?? readers[0],
    [readerId, readers],
  );

  return (
    <DemoReaderContext.Provider value={{ reader, setReaderId, readers, ready }}>
      {children}
    </DemoReaderContext.Provider>
  );
}

export function useDemoReader() {
  const value = useContext(DemoReaderContext);
  if (!value) {
    throw new Error("useDemoReader must be used inside DemoReaderProvider");
  }
  return value;
}

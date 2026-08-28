"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { catalog, DEMO_DEFAULT_READER_ID } from "@/data/catalog";
import type { ReaderProfile } from "@/types/domain";

type DemoReaderContextValue = {
  reader: ReaderProfile;
  setReaderId: (id: string) => void;
  readers: ReaderProfile[];
};

const DemoReaderContext = createContext<DemoReaderContextValue | null>(null);

export function DemoReaderProvider({ children }: { children: ReactNode }) {
  const [readerId, setReaderId] = useState(DEMO_DEFAULT_READER_ID);
  const readers = catalog.readers;
  const reader = useMemo(
    () => readers.find((item) => item.id === readerId) ?? readers[0],
    [readerId, readers],
  );

  return (
    <DemoReaderContext.Provider value={{ reader, setReaderId, readers }}>
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

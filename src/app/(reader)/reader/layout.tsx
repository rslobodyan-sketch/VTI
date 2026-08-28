import type { Metadata } from "next";
import { DemoReaderProvider } from "@/components/demo/demo-reader";
import { ReaderShell } from "@/components/layout/reader-shell";

export const metadata: Metadata = {
  title: "Reader",
};

export default function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoReaderProvider>
      <ReaderShell>{children}</ReaderShell>
    </DemoReaderProvider>
  );
}

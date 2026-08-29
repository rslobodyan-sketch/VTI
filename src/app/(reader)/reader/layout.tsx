import type { Metadata } from "next";
import { DemoReaderProvider } from "@/components/demo/demo-reader";
import { ReaderShell } from "@/components/layout/reader-shell";

export const metadata: Metadata = {
  title: "Reader",
  appleWebApp: {
    capable: true,
    title: "VTI Reader",
    statusBarStyle: "default",
  },
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

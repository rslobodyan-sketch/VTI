"use client";

import { useEffect, useState } from "react";

export function InstallHint() {
  const [standalone, setStandalone] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const iosStandalone = "standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    const update = () => setStandalone(media.matches || iosStandalone);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  if (standalone) return null;

  return (
    <p className="text-sm text-ink-muted">
      Add VTI Reader to your Home Screen for a full-screen assignment packet. Safari: Share → Add to
      Home Screen. Chrome: menu → Install app.
    </p>
  );
}

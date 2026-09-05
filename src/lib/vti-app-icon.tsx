import { ImageResponse } from "next/og";

export function vtiAppIcon(size: number) {
  const fontSize = Math.round(size * 0.32);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c1f3a",
          color: "#f6f1e8",
          fontSize,
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        VTI
      </div>
    ),
    { width: size, height: size },
  );
}

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
          background: "#1e3b34",
          color: "#f3efe6",
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

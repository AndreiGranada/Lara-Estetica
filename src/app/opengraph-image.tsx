import { ImageResponse } from "next/og";
import { clinicInfo } from "@/lib/clinic";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background:
            "radial-gradient(circle at 15% 15%, #EED5D8 0%, transparent 35%), radial-gradient(circle at 88% 12%, #E7CFA8 0%, transparent 33%), linear-gradient(150deg, #F7EBDD 0%, #F3E8D4 55%, #F6EADD 100%)",
          color: "#3E2428",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-40px",
            bottom: "-60px",
            width: "360px",
            height: "360px",
            borderRadius: "999px",
            background: "#A44651",
            opacity: 0.12,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "#A44651",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#F3E8D4",
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            LS
          </div>
          <p
            style={{
              margin: 0,
              fontSize: "24px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#8B3743",
            }}
          >
            Estética Regenerativa
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "880px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "66px",
              lineHeight: 1.08,
              fontWeight: 700,
              color: "#3E2428",
            }}
          >
            Lara Schneider
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "34px",
              lineHeight: 1.25,
              color: "#6B4D47",
            }}
          >
            Procedimentos personalizados para contorno, pele e performance corporal.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "2px solid #DAB98F",
            paddingTop: "18px",
            fontSize: "26px",
            color: "#5A2E34",
          }}
        >
          <span>{clinicInfo.whatsappDisplay}</span>
          <span style={{ color: "#A44651", fontWeight: 700 }}>Cupom de avaliação gratuita</span>
        </div>
      </div>
    ),
    size
  );
}

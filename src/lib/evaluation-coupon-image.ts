import QRCode from "qrcode";
import { clinicInfo } from "@/lib/clinic";

export const EVALUATION_COUPON_VALID_DAYS = 30;

export function formatDatePtBr(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

export function addDays(baseDate: Date, days: number): Date {
  const value = new Date(baseDate);
  value.setDate(value.getDate() + days);
  return value;
}

function ellipsis(input: string, maxLength: number): string {
  if (input.length <= maxLength) {
    return input;
  }

  return `${input.slice(0, Math.max(0, maxLength - 1)).trimEnd()}...`;
}

type BuildEvaluationCouponImageInput = {
  evaluationCode: string;
  customerName: string;
  whatsappUrl: string;
  issuedAt: Date;
  validUntil: Date;
};

export async function buildEvaluationCouponImageDataUrl({
  evaluationCode,
  customerName,
  whatsappUrl,
  issuedAt,
  validUntil,
}: BuildEvaluationCouponImageInput): Promise<string> {
  if (typeof document === "undefined") {
    throw new Error("Geração de imagem disponível apenas no navegador.");
  }

  const width = 1280;
  const height = 720;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Não foi possível gerar a imagem do cupom.");
  }

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#f7ebdd");
  gradient.addColorStop(1, "#f3e8d4");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(164, 70, 81, 0.10)";
  context.beginPath();
  context.arc(1080, 90, 220, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(160, 640, 180, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "#A44651";
  context.lineWidth = 4;
  context.strokeRect(36, 36, width - 72, height - 72);

  context.fillStyle = "#8B3743";
  context.font = "700 34px 'Segoe UI', sans-serif";
  context.fillText(clinicInfo.name.toUpperCase(), 80, 98);

  context.fillStyle = "#5A2E34";
  context.font = "700 42px 'Segoe UI', sans-serif";
  context.fillText("CUPOM DE AVALIAÇÃO GRATUITA", 80, 176);

  context.fillStyle = "#6B4D47";
  context.font = "500 28px 'Segoe UI', sans-serif";
  context.fillText(`Cliente: ${ellipsis(customerName, 44)}`, 80, 236);

  context.fillStyle = "#fff8ef";
  context.fillRect(80, 286, width - 160, 232);
  context.strokeStyle = "#C4914C";
  context.lineWidth = 3;
  context.strokeRect(80, 286, width - 160, 232);

  context.fillStyle = "#A44651";
  context.font = "700 40px 'Segoe UI', sans-serif";
  context.fillText("CÓDIGO", 120, 360);

  context.font = "700 120px 'Segoe UI', sans-serif";
  context.fillText(evaluationCode, 120, 488);

  context.fillStyle = "#A44651";
  context.beginPath();
  context.arc(1120, 190, 86, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#F3E8D4";
  context.font = "700 22px 'Segoe UI', sans-serif";
  context.textAlign = "center";
  context.fillText("SELO", 1120, 172);
  context.font = "700 20px 'Segoe UI', sans-serif";
  context.fillText("1 AVALIAÇÃO", 1120, 204);
  context.font = "700 20px 'Segoe UI', sans-serif";
  context.fillText("GRATUITA", 1120, 234);
  context.textAlign = "start";

  const issuedAtLabel = formatDatePtBr(issuedAt);
  const validUntilLabel = formatDatePtBr(validUntil);

  context.fillStyle = "#fff8ef";
  context.fillRect(80, 520, 360, 56);
  context.strokeStyle = "#DAB98F";
  context.lineWidth = 2;
  context.strokeRect(80, 520, 360, 56);
  context.fillStyle = "#5A2E34";
  context.font = "600 20px 'Segoe UI', sans-serif";
  context.fillText(`Emitido: ${issuedAtLabel}`, 98, 555);

  context.fillStyle = "#fff8ef";
  context.fillRect(458, 520, 360, 56);
  context.strokeStyle = "#DAB98F";
  context.lineWidth = 2;
  context.strokeRect(458, 520, 360, 56);
  context.fillStyle = "#5A2E34";
  context.font = "700 20px 'Segoe UI', sans-serif";
  context.fillText(`Válido até: ${validUntilLabel}`, 476, 555);

  context.fillStyle = "#fff8ef";
  context.fillRect(920, 286, 280, 280);
  context.strokeStyle = "#C4914C";
  context.lineWidth = 3;
  context.strokeRect(920, 286, 280, 280);

  try {
    const qrCanvas = document.createElement("canvas");
    await QRCode.toCanvas(qrCanvas, whatsappUrl, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: "M",
      color: {
        dark: "#5A2E34",
        light: "#fff8ef",
      },
    });
    context.drawImage(qrCanvas, 940, 306, 240, 240);
  } catch {
    context.fillStyle = "#8E2F3A";
    context.font = "600 20px 'Segoe UI', sans-serif";
    context.fillText("QR indisponível", 986, 430);
  }

  context.fillStyle = "#6B4D47";
  context.font = "600 18px 'Segoe UI', sans-serif";
  context.fillText("Escaneie para abrir no WhatsApp", 930, 592);

  context.fillStyle = "#6B4D47";
  context.font = "500 21px 'Segoe UI', sans-serif";
  context.fillText(
    `Apresente este cupom no atendimento via WhatsApp ${clinicInfo.whatsappDisplay}`,
    80,
    624
  );

  context.fillStyle = "#8B3743";
  context.font = "500 18px 'Segoe UI', sans-serif";
  context.fillText("Termos: uso individual, não cumulativo e sujeito à disponibilidade.", 80, 662);

  return canvas.toDataURL("image/png");
}

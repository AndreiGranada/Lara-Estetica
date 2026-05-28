"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";
import {
  buildEvaluationWhatsappMessage,
  buildWhatsappUrl,
} from "@/lib/clinic";
import {
  addDays,
  buildEvaluationCouponImageDataUrl,
  EVALUATION_COUPON_VALID_DAYS,
  formatDatePtBr,
} from "@/lib/evaluation-coupon-image";

function parseDate(value: string | null): Date {
  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
}

function EvaluationCouponPageContent() {
  const searchParams = useSearchParams();
  const evaluationCode = searchParams.get("code")?.trim() ?? "";
  const customerName = searchParams.get("name")?.trim() ?? "";
  const issuedAt = useMemo(() => parseDate(searchParams.get("issuedAt")), [searchParams]);
  const validUntil = useMemo(
    () => addDays(issuedAt, EVALUATION_COUPON_VALID_DAYS),
    [issuedAt]
  );

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  const evaluationWhatsappUrl = useMemo(() => {
    if (!evaluationCode || !customerName) {
      return "";
    }

    const message = buildEvaluationWhatsappMessage(customerName, evaluationCode);
    return buildWhatsappUrl(message);
  }, [customerName, evaluationCode]);

  useEffect(() => {
    let active = true;

    if (!evaluationCode || !customerName || !evaluationWhatsappUrl) {
      return () => {
        active = false;
      };
    }

    buildEvaluationCouponImageDataUrl({
      evaluationCode,
      customerName,
      whatsappUrl: evaluationWhatsappUrl,
      issuedAt,
      validUntil,
    })
      .then((value) => {
        if (active) {
          setImageDataUrl(value);
        }
      })
      .catch(() => {
        if (active) {
          setImageDataUrl(null);
          toast.error("Não foi possível gerar a imagem deste cupom.");
        }
      });

    return () => {
      active = false;
    };
  }, [customerName, evaluationCode, evaluationWhatsappUrl, issuedAt, validUntil]);

  const downloadCouponImage = () => {
    if (!imageDataUrl || !evaluationCode) {
      return;
    }

    const link = document.createElement("a");
    link.href = imageDataUrl;
    link.download = `cupom-avaliacao-${evaluationCode}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const shareCouponImage = async () => {
    if (!imageDataUrl || !evaluationCode || !customerName) {
      return;
    }

    const message = buildEvaluationWhatsappMessage(customerName, evaluationCode);

    try {
      if (typeof navigator.share === "function") {
        const imageResponse = await fetch(imageDataUrl);
        const imageBlob = await imageResponse.blob();
        const imageFile = new File([imageBlob], `cupom-avaliacao-${evaluationCode}.png`, {
          type: "image/png",
        });

        const canShareFiles =
          typeof navigator.canShare === "function" &&
          navigator.canShare({ files: [imageFile] });

        if (canShareFiles) {
          await navigator.share({
            title: "Cupom de avaliação gratuita",
            text: message,
            files: [imageFile],
          });
          return;
        }
      }

      downloadCouponImage();
      window.open(evaluationWhatsappUrl, "_blank", "noopener,noreferrer");
      toast.message("Imagem baixada. Anexe no WhatsApp para concluir o envio.");
    } catch {
      toast.error("Não foi possível compartilhar agora. Tente baixar a imagem.");
    }
  };

  if (!evaluationCode || !customerName) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10 md:px-8">
        <article className="surface-card rounded-3xl p-6 md:p-8">
          <h1 className="text-2xl font-semibold text-[#3e2428] md:text-3xl">
            Cupom não encontrado
          </h1>
          <p className="mt-3 text-sm leading-7 text-[#6b4d47]">
            Gere um novo cupom na página principal para liberar a imagem de
            compartilhamento.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-xl bg-[#a44651] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8b3743]"
          >
            Voltar para a página principal
          </Link>
        </article>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-8 md:px-8 md:pt-10">
      <Toaster richColors position="top-right" />
      <article className="surface-card rounded-3xl p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b3743]">
          Compartilhamento do cupom
        </p>
        <h1 className="mt-2 text-3xl text-[#3e2428] md:text-4xl">
          Cupom de avaliação gratuita {evaluationCode}
        </h1>
        <p className="mt-2 text-sm text-[#6b4d47]">
          Cliente: {customerName}
        </p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#8b3743]">
          Validade: {formatDatePtBr(validUntil)}
        </p>

        <div className="mt-5 rounded-xl border border-[#dab98f] bg-white p-2">
          {imageDataUrl ? (
            <Image
              src={imageDataUrl}
              alt={`Imagem do cupom de avaliação gratuita ${evaluationCode}`}
              width={1280}
              height={720}
              unoptimized
              className="h-auto w-full rounded-lg"
            />
          ) : (
            <div className="flex h-65 items-center justify-center rounded-lg bg-[#f7ebdd] px-4 text-center text-sm text-[#6b4d47]">
              Gerando imagem do cupom...
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={shareCouponImage}
            disabled={!imageDataUrl}
            className="inline-flex items-center justify-center rounded-xl bg-[#a44651] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8b3743] disabled:cursor-not-allowed disabled:opacity-70"
          >
            Compartilhar imagem no WhatsApp
          </button>

          <button
            type="button"
            onClick={downloadCouponImage}
            disabled={!imageDataUrl}
            className="inline-flex items-center justify-center rounded-xl border border-[#a44651] px-4 py-2 text-sm font-semibold text-[#a44651] transition hover:bg-[#eed5d8] disabled:cursor-not-allowed disabled:opacity-70"
          >
            Baixar imagem do cupom
          </button>
        </div>

        <p className="mt-3 text-xs text-[#6b4d47]">
          Se o compartilhamento direto não estiver disponível no navegador,
          baixe a imagem e anexe manualmente no WhatsApp.
        </p>
      </article>
    </main>
  );
}

export default function EvaluationCouponPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-8 md:px-8 md:pt-10">
          <article className="surface-card rounded-3xl p-6 md:p-8">
            <p className="text-sm text-[#6b4d47]">Carregando cupom...</p>
          </article>
        </main>
      }
    >
      <EvaluationCouponPageContent />
    </Suspense>
  );
}

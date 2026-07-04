"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FaWhatsapp } from "react-icons/fa";
import { Toaster, toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import {
  buildEvaluationWhatsappMessage,
  buildWhatsappUrl,
  clinicInfo,
} from "@/lib/clinic";
import {
  addDays,
  buildEvaluationCouponImageDataUrl,
  EVALUATION_COUPON_VALID_DAYS,
  formatDatePtBr,
} from "@/lib/evaluation-coupon-image";
import { leadSchema, type LeadFormInput } from "@/lib/lead-schema";

function extractDigits(input: string): string {
  return input.replace(/\D/g, "");
}

function maskBrazilPhone(input: string): string {
  let digits = extractDigits(input);

  if (digits.startsWith("55") && digits.length > 11) {
    digits = digits.slice(2);
  }

  digits = digits.slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function normalizeToE164Brazil(input: string): string {
  const rawDigits = extractDigits(input);
  const localDigits = rawDigits.startsWith("55") && rawDigits.length > 11
    ? rawDigits.slice(2)
    : rawDigits;
  return `+55${localDigits}`;
}

type LeadApiSuccess = {
  couponCode: string;
  leadId: number;
};

type LeadApiError = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const EVALUATION_COUPON_STORAGE_KEY = "lara:evaluation-coupon:last";

type PersistedCoupon = {
  code: string;
  customerName: string;
  issuedAtIso: string;
};

async function copyTextToClipboard(text: string): Promise<boolean> {
  const fallbackCopy = () => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  };

  try {
    if (typeof navigator.clipboard?.writeText === "function") {
      await navigator.clipboard.writeText(text);
    } else {
      fallbackCopy();
    }

    return true;
  } catch {
    return false;
  }
}

export function LeadEvaluationForm() {
  const [evaluationCode, setEvaluationCode] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>("");
  const [evaluationIssuedAtIso, setEvaluationIssuedAtIso] = useState<string | null>(null);
  const [evaluationValidUntilLabel, setEvaluationValidUntilLabel] = useState<string | null>(
    null
  );
  const [couponImageDataUrl, setCouponImageDataUrl] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(EVALUATION_COUPON_STORAGE_KEY);

      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as PersistedCoupon;

      if (!parsed.code || !parsed.customerName || !parsed.issuedAtIso) {
        window.localStorage.removeItem(EVALUATION_COUPON_STORAGE_KEY);
        return;
      }

      const issuedAt = new Date(parsed.issuedAtIso);

      if (Number.isNaN(issuedAt.getTime())) {
        window.localStorage.removeItem(EVALUATION_COUPON_STORAGE_KEY);
        return;
      }

      setEvaluationCode(parsed.code);
      setCustomerName(parsed.customerName);
      setEvaluationIssuedAtIso(parsed.issuedAtIso);
      setEvaluationValidUntilLabel(formatDatePtBr(addDays(issuedAt, EVALUATION_COUPON_VALID_DAYS)));
    } catch {
      window.localStorage.removeItem(EVALUATION_COUPON_STORAGE_KEY);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LeadFormInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      phone: "",
      consent: false,
    },
  });

  const phoneRegister = register("phone", {
    onChange: (event) => {
      event.target.value = maskBrazilPhone(event.target.value);
    },
  });

  const evaluationWhatsappUrl = useMemo(() => {
    if (!evaluationCode || !customerName) {
      return "";
    }

    const message = buildEvaluationWhatsappMessage(customerName, evaluationCode);
    return buildWhatsappUrl(message);
  }, [customerName, evaluationCode]);

  useEffect(() => {
    let active = true;

    if (!evaluationCode || !customerName || !evaluationIssuedAtIso || !evaluationWhatsappUrl) {
      return () => {
        active = false;
      };
    }

    const issuedAt = new Date(evaluationIssuedAtIso);
    const validUntil = addDays(issuedAt, EVALUATION_COUPON_VALID_DAYS);

    buildEvaluationCouponImageDataUrl({
      evaluationCode,
      customerName,
      whatsappUrl: evaluationWhatsappUrl,
      issuedAt,
      validUntil,
    })
      .then((value) => {
        if (active) {
          setCouponImageDataUrl(value);
        }
      })
      .catch(() => {
        if (active) {
          setCouponImageDataUrl(null);
          toast.error("Não foi possível gerar a imagem do cupom.");
        }
      });

    return () => {
      active = false;
    };
  }, [customerName, evaluationCode, evaluationIssuedAtIso, evaluationWhatsappUrl]);

  const saveCouponImage = () => {
    if (!couponImageDataUrl || !evaluationCode) {
      return;
    }

    const link = document.createElement("a");
    link.href = couponImageDataUrl;
    link.download = `cupom-avaliacao-${evaluationCode}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    trackEvent("evaluation_coupon_image_download", { evaluationCode });
  };

  const shareCouponOnWhatsapp = async () => {
    if (!evaluationCode || !customerName || !evaluationWhatsappUrl) {
      return;
    }

    const message = buildEvaluationWhatsappMessage(customerName, evaluationCode);

    try {
      if (couponImageDataUrl && typeof navigator.share === "function") {
        const imageResponse = await fetch(couponImageDataUrl);
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
          trackEvent("evaluation_whatsapp_share_native", { evaluationCode });
          return;
        }
      }
    } catch {
      // Ignore and fallback below.
    }

    trackEvent("evaluation_whatsapp_open_same_tab", { evaluationCode });
    window.location.assign(evaluationWhatsappUrl);
  };

  const copyCouponCode = async () => {
    if (!evaluationCode) {
      return;
    }

    const copied = await copyTextToClipboard(evaluationCode);

    if (copied) {
      trackEvent("evaluation_coupon_code_copy", { evaluationCode });
      toast.success(`Código ${evaluationCode} copiado.`);
    } else {
      toast.error("Não foi possível copiar o código automaticamente.");
    }
  };

  const copyWhatsappMessage = async () => {
    if (!evaluationCode || !customerName) {
      return;
    }

    const message = buildEvaluationWhatsappMessage(customerName, evaluationCode);
    const copied = await copyTextToClipboard(message);

    if (copied) {
      trackEvent("evaluation_coupon_message_copy", { evaluationCode });
      toast.success("Mensagem para WhatsApp copiada.");
    } else {
      toast.error("Não foi possível copiar a mensagem automaticamente.");
    }
  };

  const onSubmit = async (values: LeadFormInput) => {
    setRequestError(null);
    setCouponImageDataUrl(null);
    trackEvent("lead_form_submit_attempt");

    const normalizedPhone = normalizeToE164Brazil(values.phone);

    let response: Response;
    try {
      response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          phone: normalizedPhone,
        }),
      });
    } catch {
      const message = "Não foi possível conectar ao servidor. Tente novamente.";
      setRequestError(message);
      trackEvent("lead_form_submit_error", { message });
      toast.error(message);
      return;
    }

    let payload: LeadApiSuccess | LeadApiError | null = null;

    try {
      payload = (await response.json()) as LeadApiSuccess | LeadApiError;
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const errorPayload = (payload ?? {}) as LeadApiError;
      const message = errorPayload.error ?? "Erro ao gerar cupom de avaliação gratuita. Tente novamente.";
      setRequestError(message);
      trackEvent("lead_form_submit_error", { message });
      toast.error(message);
      return;
    }

    if (!payload || !("couponCode" in payload) || !("leadId" in payload)) {
      const message = "Resposta inesperada do servidor ao gerar o cupom. Tente novamente.";
      setRequestError(message);
      trackEvent("lead_form_submit_error", { message });
      toast.error(message);
      return;
    }

    const successPayload = payload as LeadApiSuccess;
    const generatedCode = successPayload.couponCode;
    const generatedName = values.name.trim();
    const issuedAt = new Date();
    const validUntil = addDays(issuedAt, EVALUATION_COUPON_VALID_DAYS);
    const issuedAtIso = issuedAt.toISOString();

    setEvaluationCode(generatedCode);
    setCustomerName(generatedName);
    setEvaluationIssuedAtIso(issuedAtIso);
    setEvaluationValidUntilLabel(formatDatePtBr(validUntil));

    if (typeof window !== "undefined") {
      const persistedCoupon: PersistedCoupon = {
        code: generatedCode,
        customerName: generatedName,
        issuedAtIso,
      };

      window.localStorage.setItem(
        EVALUATION_COUPON_STORAGE_KEY,
        JSON.stringify(persistedCoupon)
      );
    }

    trackEvent("evaluation_generated", {
      evaluationCode: generatedCode,
      leadId: successPayload.leadId,
      flow: "generated_on_page_manual_actions",
    });

    const successMessage =
      `Cupom ${generatedCode} liberado. Compartilhe no WhatsApp ou salve a imagem abaixo.`;

    toast.success(successMessage);
    reset({ name: values.name, phone: maskBrazilPhone(values.phone), consent: true });
  };

  return (
    <div className="surface-card rounded-3xl p-6 md:p-8">
      <Toaster richColors position="top-right" />

      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b3743]">
        Fluxo opcional de avaliação gratuita
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-[#3e2428] md:text-3xl">
        Garanta seu cupom de avaliação gratuita
      </h3>
      <p className="mt-2 text-sm leading-6 text-[#6b4d47]">
        O cadastro é opcional, mas necessário para liberar seu cupom de
        avaliação gratuita. Depois de gerar o código, você envia no WhatsApp da
        clínica.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-[#5a2e34]"
          >
            Nome completo
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            {...register("name")}
            className="w-full rounded-xl border border-[#dab98f] bg-white/90 px-4 py-3 text-[#3e2428] shadow-sm outline-none transition focus:border-[#a44651] focus:ring-2 focus:ring-[#eed5d8]"
            placeholder="Digite seu nome"
          />
          {errors.name ? (
            <p className="mt-1 text-xs text-[#8e2f3a]">{errors.name.message}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-1 block text-sm font-medium text-[#5a2e34]"
          >
            Telefone com DDD
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            {...phoneRegister}
            className="w-full rounded-xl border border-[#dab98f] bg-white/90 px-4 py-3 text-[#3e2428] shadow-sm outline-none transition focus:border-[#a44651] focus:ring-2 focus:ring-[#eed5d8]"
            placeholder="(53) 99999-9999"
          />
          {errors.phone ? (
            <p className="mt-1 text-xs text-[#8e2f3a]">{errors.phone.message}</p>
          ) : null}
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-[#dab98f] bg-[#fff8ef]/80 p-3 text-sm text-[#6b4d47]">
          <input
            type="checkbox"
            {...register("consent")}
            className="mt-1 h-4 w-4 rounded border-[#dab98f] text-[#a44651]"
          />
          <span className="leading-6">
            Autorizo o uso dos meus dados para receber meu cupom de avaliação
            gratuita e contato de atendimento da {clinicInfo.name}. Li e
            concordo com a{" "}
            <Link
              href="/politica-de-privacidade"
              target="_blank"
              className="font-semibold text-[#a44651] underline underline-offset-2 hover:text-[#8b3743]"
            >
              Política de Privacidade
            </Link>
            .
          </span>
        </label>
        {errors.consent ? (
          <p className="text-xs text-[#8e2f3a]">{errors.consent.message}</p>
        ) : null}

        {requestError ? (
          <div className="rounded-xl border border-[#d7a7ae] bg-[#fae9ec] p-3 text-sm text-[#8e2f3a]">
            {requestError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#a44651] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8b3743] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <FaWhatsapp aria-hidden="true" className="text-base" />
          <span>
            {isSubmitting
              ? "Gerando cupom de avaliação gratuita..."
              : "Quero meu cupom de avaliação gratuita"}
          </span>
        </button>
      </form>

      {evaluationCode ? (
        <div className="mt-5 rounded-2xl border border-[#dab98f] bg-[#f7ebdd] p-4">
          <p className="text-sm text-[#6b4d47]">Seu cupom de avaliação gratuita:</p>
          <p className="mt-1 text-4xl font-semibold tracking-[0.25em] text-[#a44651]">
            {evaluationCode}
          </p>

          {customerName ? (
            <p className="mt-1 text-sm text-[#6b4d47]">
              Cliente: {customerName}
            </p>
          ) : null}

          {evaluationValidUntilLabel ? (
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#8b3743]">
              Validade: {evaluationValidUntilLabel}
            </p>
          ) : null}

          <p className="mt-2 text-xs text-[#6b4d47]">
            O cupom foi gerado nesta página. Escolha abaixo se deseja
            compartilhar no WhatsApp ou salvar a imagem no seu celular.
          </p>

          <div className="mt-4 rounded-xl border border-[#dab98f] bg-white p-2">
            {couponImageDataUrl ? (
              <Image
                src={couponImageDataUrl}
                alt={`Imagem do cupom de avaliação gratuita ${evaluationCode}`}
                width={1280}
                height={720}
                unoptimized
                className="h-auto w-full rounded-lg"
              />
            ) : (
              <div className="flex h-42 items-center justify-center rounded-lg bg-[#f7ebdd] px-4 text-center text-sm text-[#6b4d47]">
                Gerando imagem do cupom...
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={shareCouponOnWhatsapp}
              disabled={!evaluationWhatsappUrl}
              className="inline-flex items-center justify-center rounded-xl bg-[#a44651] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#8b3743] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Compartilhar no WhatsApp
            </button>

            <button
              type="button"
              onClick={saveCouponImage}
              disabled={!couponImageDataUrl}
              className="inline-flex items-center justify-center rounded-xl border border-[#a44651] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#a44651] transition hover:bg-[#eed5d8] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Salvar imagem do cupom
            </button>

            <button
              type="button"
              onClick={copyCouponCode}
              disabled={!evaluationCode}
              className="inline-flex items-center justify-center rounded-xl border border-[#a44651] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#a44651] transition hover:bg-[#eed5d8] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Copiar código do cupom
            </button>

            <button
              type="button"
              onClick={copyWhatsappMessage}
              disabled={!evaluationCode || !customerName}
              className="inline-flex items-center justify-center rounded-xl border border-[#a44651] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#a44651] transition hover:bg-[#eed5d8] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Copiar mensagem para WhatsApp
            </button>
          </div>

        </div>
      ) : null}
    </div>
  );
}

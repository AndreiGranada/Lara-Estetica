"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FaWhatsapp } from "react-icons/fa";
import { Toaster, toast } from "sonner";
import { TrackedLink } from "@/components/tracked-link";
import { trackEvent } from "@/lib/analytics";
import {
  buildEvaluationWhatsappMessage,
  buildWhatsappUrl,
  clinicInfo,
} from "@/lib/clinic";
import {
  addDays,
  EVALUATION_COUPON_VALID_DAYS,
  formatDatePtBr,
} from "@/lib/evaluation-coupon-image";
import {
  AUTO_OPEN_EVALUATION_SHARE_TAB,
  AUTO_OPEN_EVALUATION_WHATSAPP,
} from "@/lib/evaluation-coupon-config";
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

function openInNewTab(url: string): boolean {
  try {
    const popup = window.open(url, "_blank", "noopener,noreferrer");
    return popup !== null;
  } catch {
    return false;
  }
}

function navigatePopup(popup: Window | null, url: string): boolean {
  if (!popup || popup.closed) {
    return false;
  }

  try {
    popup.location.href = url;
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
  const [autoOpenFailed, setAutoOpenFailed] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

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

  const evaluationShareTabUrl = useMemo(() => {
    if (!evaluationCode || !customerName || !evaluationIssuedAtIso) {
      return "";
    }

    if (typeof window === "undefined") {
      return "";
    }

    const params = new URLSearchParams({
      code: evaluationCode,
      name: customerName,
      issuedAt: evaluationIssuedAtIso,
    });

    return `${window.location.origin}/cupom-avaliacao?${params.toString()}`;
  }, [customerName, evaluationCode, evaluationIssuedAtIso]);

  const onSubmit = async (values: LeadFormInput) => {
    setRequestError(null);
    setAutoOpenFailed(false);
    trackEvent("lead_form_submit_attempt");

    let whatsappPopup: Window | null = null;

    if (typeof window !== "undefined" && AUTO_OPEN_EVALUATION_WHATSAPP) {
      // Open synchronously on user gesture to reduce mobile popup blocking.
      whatsappPopup = window.open(`https://wa.me/${clinicInfo.whatsappNumber}`, "_blank");
    }

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
    const generatedMessage = buildEvaluationWhatsappMessage(generatedName, generatedCode);
    const generatedWhatsappUrl = buildWhatsappUrl(generatedMessage);
    const issuedAt = new Date();
    const validUntil = addDays(issuedAt, EVALUATION_COUPON_VALID_DAYS);
    const issuedAtIso = issuedAt.toISOString();

    setEvaluationCode(generatedCode);
    setCustomerName(generatedName);
    setEvaluationIssuedAtIso(issuedAtIso);
    setEvaluationValidUntilLabel(formatDatePtBr(validUntil));

    if (typeof window !== "undefined") {
      let blockedAnyAutoOpen = false;

      if (AUTO_OPEN_EVALUATION_WHATSAPP) {
        const openedWhatsapp =
          navigatePopup(whatsappPopup, generatedWhatsappUrl) ||
          openInNewTab(generatedWhatsappUrl);

        if (!openedWhatsapp) {
          blockedAnyAutoOpen = true;
        }
      }

      setAutoOpenFailed(blockedAnyAutoOpen);

      if (blockedAnyAutoOpen) {
        toast.message("O navegador bloqueou a abertura automática. Use os botões manuais abaixo.");
      }
    }

    trackEvent("evaluation_generated", {
      evaluationCode: generatedCode,
      leadId: successPayload.leadId,
      flow:
        AUTO_OPEN_EVALUATION_WHATSAPP
          ? "open_whatsapp_only"
          : AUTO_OPEN_EVALUATION_SHARE_TAB
          ? "open_share_tab_only"
          : "manual_open",
    });

    const successMessage =
      AUTO_OPEN_EVALUATION_WHATSAPP
        ? `Cupom ${generatedCode} liberado. WhatsApp aberto com mensagem padrão.`
        : AUTO_OPEN_EVALUATION_SHARE_TAB
        ? `Cupom ${generatedCode} liberado. Aba de compartilhamento aberta.`
        : `Cupom ${generatedCode} liberado.`;

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

          {AUTO_OPEN_EVALUATION_WHATSAPP ? (
            <p className="mt-2 text-xs text-[#6b4d47]">
              WhatsApp aberto automaticamente com a mensagem padrão.
            </p>
          ) : AUTO_OPEN_EVALUATION_SHARE_TAB ? (
            <p className="mt-2 text-xs text-[#6b4d47]">
              Uma nova aba foi aberta para compartilhar ou baixar a imagem deste
              cupom.
            </p>
          ) : (
            <p className="mt-2 text-xs text-[#6b4d47]">
              Nenhuma aba foi aberta automaticamente. Use os atalhos da página
              de compartilhamento quando necessário.
            </p>
          )}

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            {evaluationWhatsappUrl ? (
              <TrackedLink
                href={evaluationWhatsappUrl}
                target="_blank"
                rel="noreferrer"
                eventName="manual_evaluation_whatsapp_open_click"
                eventPayload={{ evaluationCode }}
                className="inline-flex rounded-xl border border-[#a44651] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#a44651] transition hover:bg-[#eed5d8]"
              >
                Abrir WhatsApp manualmente
              </TrackedLink>
            ) : null}

            {evaluationShareTabUrl ? (
              <TrackedLink
                href={evaluationShareTabUrl}
                target="_blank"
                rel="noreferrer"
                eventName="manual_evaluation_share_tab_open_click"
                eventPayload={{ evaluationCode }}
                className="inline-flex rounded-xl border border-[#a44651] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#a44651] transition hover:bg-[#eed5d8]"
              >
                Abrir página de compartilhamento
              </TrackedLink>
            ) : null}
          </div>

          {autoOpenFailed ? (
            <p className="mt-2 text-xs text-[#6b4d47]">
              O navegador bloqueou a abertura automática de nova aba. Use os
              atalhos manuais acima.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

import type { Metadata } from "next";
import { clinicInfo } from "@/lib/clinic";

export const metadata: Metadata = {
  title: "Política de Privacidade | Lara Schneider Estética Regenerativa",
  description:
    "Informações sobre coleta, uso e armazenamento de dados pessoais para contato e geração de cupom de avaliação gratuita.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-20 pt-8 md:px-8 md:pt-10">
      <article className="surface-card rounded-3xl p-6 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b3743]">
          LGPD
        </p>
        <h1 className="mt-2 text-4xl text-[#3e2428] md:text-5xl">
          Política de Privacidade
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#6b4d47] md:text-base">
          Esta política explica como {clinicInfo.name} coleta e utiliza os dados
          fornecidos no formulário de cadastro para liberação de cupom de
          avaliação gratuita e contato de atendimento.
        </p>

        <section className="mt-8 space-y-6 text-sm leading-7 text-[#6b4d47] md:text-base">
          <div>
            <h2 className="text-2xl text-[#3e2428]">1. Dados coletados</h2>
            <p className="mt-2">
              Coletamos nome, telefone e registro de consentimento no momento do
              cadastro para cupom de avaliação gratuita.
            </p>
          </div>

          <div>
            <h2 className="text-2xl text-[#3e2428]">2. Finalidade do uso</h2>
            <p className="mt-2">
              Os dados são usados para gerar cupom de avaliação gratuita,
              organizar o contato inicial via WhatsApp e prestar informações
              sobre procedimentos e agendamento.
            </p>
          </div>

          <div>
            <h2 className="text-2xl text-[#3e2428]">3. Compartilhamento</h2>
            <p className="mt-2">
              Não comercializamos dados pessoais. O uso é restrito ao atendimento
              da clínica e à operação técnica da plataforma.
            </p>
          </div>

          <div>
            <h2 className="text-2xl text-[#3e2428]">4. Armazenamento e segurança</h2>
            <p className="mt-2">
              Os dados são armazenados em banco de dados com controle de acesso e
              uso mínimo necessário para a finalidade informada.
            </p>
          </div>

          <div>
            <h2 className="text-2xl text-[#3e2428]">5. Direitos do titular</h2>
            <p className="mt-2">
              Você pode solicitar confirmação de tratamento, atualização ou
              exclusão dos seus dados de cadastro.
            </p>
          </div>

          <div>
            <h2 className="text-2xl text-[#3e2428]">6. Contato</h2>
            <p className="mt-2">
              Para assuntos de privacidade e dados pessoais, entre em contato pelo
              WhatsApp {clinicInfo.whatsappDisplay}.
            </p>
          </div>
        </section>
      </article>
    </main>
  );
}

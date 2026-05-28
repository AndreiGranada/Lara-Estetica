export const clinicInfo = {
  name: "Lara Schneider Estética Regenerativa",
  whatsappNumber: "5553999761477",
  whatsappDisplay: "+55 53 99976-1477",
  address: "General Argolo, 477 A, Pelotas/RS",
  serviceHours: "Somente com agendamento",
};

export const valueHighlights = [
  "Cupom de avaliação gratuita para novos clientes",
  "Plano personalizado para objetivos corporais e faciais",
  "Atendimento humanizado com foco em resultados naturais",
];

export const procedureGroups = [
  {
    title: "Tratamento para flacidez e contorno",
    items: ["Bioestimulador de colágeno", "Hidrolipoclásia", "Lipo enzimática"],
  },
  {
    title: "Regeneração e qualidade da pele",
    items: ["Microagulhamento", "PEIM", "Protocolos regenerativos"],
  },
  {
    title: "Harmonização e definição",
    items: [
      "Preenchimento facial e corporal",
      "Harmonização glútea avançada",
      "Botox",
    ],
  },
  {
    title: "Performance corporal",
    items: ["Acelerador metabólico", "Hipertrofia muscular"],
  },
];

export const faqItems = [
  {
    question: "Preciso me cadastrar para falar no WhatsApp?",
    answer:
      "Não. O contato no WhatsApp é livre. O cadastro é necessário apenas para liberar o cupom de avaliação gratuita.",
  },
  {
    question: "Como o cupom de avaliação gratuita é gerado?",
    answer:
      "O cupom de avaliação gratuita usa série de 4 dígitos e é gerado em sequência global no backend, iniciando em 0100.",
  },
  {
    question: "Os dados do cadastro ficam salvos?",
    answer:
      "Sim. Apenas quem opta pelo cadastro para cupom de avaliação gratuita é salvo no banco com consentimento LGPD.",
  },
];

export const directWhatsappMessage =
  "Olá! Gostaria de mais informações sobre os procedimentos e disponibilidade de atendimento.";

export function buildWhatsappUrl(message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${clinicInfo.whatsappNumber}?text=${encodedMessage}`;
}

export function buildEvaluationWhatsappMessage(name: string, evaluationCode: string): string {
  return `Olá! Me chamo ${name}. Acabei de me cadastrar no site da ${clinicInfo.name} e recebi o cupom de avaliação gratuita ${evaluationCode}. Gostaria de saber os próximos horários e procedimentos disponíveis.`;
}

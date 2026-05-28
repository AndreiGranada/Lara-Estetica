import Image from "next/image";
import { FaArrowDown } from "react-icons/fa";
import { FaBomb } from "react-icons/fa";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaRegFileAlt } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { LeadEvaluationForm } from "@/components/lead-coupon-form";
import { ProcedureNavbar } from "@/components/procedure-navbar";
import { TrackedLink } from "@/components/tracked-link";
import {
  buildWhatsappUrl,
  clinicInfo,
  directWhatsappMessage,
  procedureGroups,
  valueHighlights,
} from "@/lib/clinic";

const directWhatsappUrl = buildWhatsappUrl(directWhatsappMessage);
const clinicFrontImageUrl = "/image.png";
const clinicMapSearchQuery = encodeURIComponent(clinicInfo.address);
const clinicMapEmbedUrl = `https://www.google.com/maps?q=${clinicMapSearchQuery}&output=embed`;
const clinicMapOpenUrl = `https://www.google.com/maps/search/?api=1&query=${clinicMapSearchQuery}`;
const clinicPhoneDialUrl = `tel:+${clinicInfo.whatsappNumber}`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: clinicInfo.name,
  address: {
    "@type": "PostalAddress",
    streetAddress: clinicInfo.address,
    addressCountry: "BR",
  },
  telephone: clinicInfo.whatsappDisplay,
};

const procedureExampleTexts: Record<string, { description: string; focus?: string }> = {
  "Bioestimulador de colágeno": {
    description:
      "O bioestimulador de colágeno é um recurso avançado da estética que promove a produção natural de colágeno na pele, melhorando firmeza, elasticidade e suavizando sinais de envelhecimento. Ao estimular a regeneração celular, proporciona resultados progressivos e duradouros, conferindo aspecto mais jovem e saudável sem alterar a naturalidade das expressões. Essa técnica é especialmente indicada para quem busca rejuvenescimento facial, melhora da textura cutânea e prevenção da flacidez, integrando ciência e beleza em um único procedimento.",
  },
  "Hidrolipoclásia": {
    description:
      "A hidrolipoclásia é um procedimento estético minimamente invasivo voltado para a redução de gordura localizada, que consiste na aplicação de solução aquosa diretamente na região a ser tratada, seguida da utilização de ultrassom para potencializar a quebra das células adiposas. Essa técnica promove melhora no contorno corporal, auxiliando na remodelação da silhueta de forma segura e eficaz, sendo indicada para pessoas que desejam resultados visíveis sem recorrer a métodos cirúrgicos mais complexos.",
  },
  "Lipo enzimática": {
    description:
      "A lipo enzimática é um procedimento estético que utiliza a aplicação de enzimas específicas diretamente na região com acúmulo de gordura, promovendo a quebra das células adiposas de forma localizada e gradual. Essa técnica é indicada para quem busca remodelar o corpo sem cirurgia, oferecendo melhora no contorno corporal e redução de medidas, com resultados progressivos e naturais, especialmente em áreas resistentes a dieta e exercícios.",
    focus:
      "Exemplo de foco: harmonização de proporções em áreas com acúmulo localizado.",
  },
  Microagulhamento: {
    description:
      "O microagulhamento é um procedimento estético que utiliza pequenas agulhas para criar microperfurações controladas na pele, estimulando a produção natural de colágeno e elastina. Essa técnica favorece a regeneração celular, melhora a textura cutânea, reduz cicatrizes de acne e linhas finas, além de potencializar a absorção de ativos aplicados durante o tratamento. O resultado é uma pele mais firme, uniforme e rejuvenescida, com aspecto saudável e natural.",
    focus:
      "Exemplo de foco: irregularidade de textura, poros aparentes e sinais finos de envelhecimento.",
  },
  PEIM: {
    description:
      "O PEIM (Procedimento Estético Injetável para Microvasos) é uma técnica utilizada para tratar pequenas varizes e vasinhos visíveis na pele, especialmente nas pernas. Consiste na aplicação de glicose hipertônica diretamente nos microvasos, promovendo sua regressão de forma segura e eficaz. Além de melhorar a estética, reduz desconfortos associados à presença dos vasinhos, proporcionando uma pele mais uniforme e saudável, sem necessidade de cirurgia.",
    focus:
      "Exemplo de foco: vasinhos aparentes em membros inferiores com objetivo de uniformização visual.",
  },
  "Protocolos regenerativos": {
    description:
      "Os protocolos regenerativos na estética são conjuntos de procedimentos que visam restaurar e potencializar a vitalidade da pele e dos tecidos, estimulando processos naturais de reparação celular. Eles podem incluir técnicas como bioestimuladores de colágeno, microagulhamento, terapias com fatores de crescimento e ativos antioxidantes, que juntos promovem firmeza, elasticidade e luminosidade. O objetivo é não apenas tratar sinais de envelhecimento, mas também prevenir a degradação precoce, oferecendo resultados progressivos e duradouros, sempre com foco em saúde, estética e bem-estar integrado.",
    focus:
      "Exemplo de foco: pele sensibilizada, desvitalizada ou com sinais de perda de qualidade global.",
  },
  "Preenchimento facial e corporal": {
    description:
      "O preenchimento facial e corporal é um procedimento estético que utiliza substâncias como o ácido hialurônico para restaurar volume, suavizar sulcos e melhorar o contorno em diferentes regiões do rosto e do corpo. Além de promover rejuvenescimento, ele corrige assimetrias e proporciona uma aparência mais harmônica e natural, com resultados imediatos e minimamente invasivos. Essa técnica é indicada tanto para quem busca rejuvenescimento facial quanto para quem deseja realçar curvas e proporções corporais, integrando estética e bem-estar em um único tratamento.",
    focus:
      "Exemplo de foco: reposição de estrutura em pontos de perda de suporte, sem exagero de volume.",
  },
  "Harmonização glútea avançada": {
    description:
      "A harmonização glútea avançada é um protocolo estético que combina técnicas de preenchimento, bioestimuladores de colágeno e, em alguns casos, tecnologias de estímulo muscular para remodelar e valorizar a região dos glúteos. O objetivo é proporcionar maior projeção, firmeza e definição, corrigindo assimetrias e realçando o contorno corporal de forma natural e personalizada. Esse procedimento é indicado para quem busca resultados progressivos e sofisticados, unindo estética e regeneração tecidual para uma silhueta mais harmônica e equilibrada.",
    focus:
      "Exemplo de foco: melhorar projeção e transição de contorno de maneira equilibrada.",
  },
  Botox: {
    description:
      "O botox, ou toxina botulínica, é um dos procedimentos estéticos mais utilizados para suavizar linhas de expressão e rugas dinâmicas, causadas pela contração repetitiva dos músculos faciais. Ao ser aplicado em pontos estratégicos, promove o relaxamento muscular temporário, resultando em uma aparência mais jovem, descansada e natural.",
  },
  "Acelerador metabólico": {
    description:
      "O acelerador metabólico é um protocolo estético e funcional que combina ativos específicos e tecnologias para estimular o metabolismo celular e potencializar a queima de gordura. Ele atua promovendo maior gasto energético, melhora da circulação e oxigenação dos tecidos, além de favorecer a eliminação de toxinas. Indicado para quem busca otimizar resultados em procedimentos de definição corporal e acelerar processos de regeneração, o acelerador metabólico integra estética e performance, proporcionando benefícios visíveis e duradouros.",
    focus:
      "Exemplo de foco: melhorar a resposta em fases de redefinição corporal com acompanhamento profissional.",
  },
  "Hipertrofia muscular": {
    description:
      "A mescla de hipertrofia muscular é desenvolvida com princípios ativos que estimulam a síntese proteica, favorecem o equilíbrio hormonal e aceleram a recuperação das fibras musculares, criando um ambiente metabólico ideal para o crescimento. Essa combinação de nutrientes e compostos bioativos potencializa a produção de energia, reduz a fadiga e otimiza a regeneração celular, permitindo treinos mais intensos e resultados consistentes em força e massa magra, tornando-se uma estratégia eficaz para quem busca hipertrofia muscular de forma segura e científica.",
    focus:
      "Exemplo de foco: suporte em regiões de menor recrutamento para ganho de tonicidade e forma.",
  },
};

function slugifyAnchor(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-300 px-4 pb-14 pt-6 md:px-8 md:pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="surface-card hero-ring rounded-3xl px-6 py-8 md:px-10 md:py-12">
        <div className="mb-5 flex justify-center">
          <div className="w-full max-w-130">
            <Image
              src="/logo-header.png"
              alt="Lara Schneider Estética Avançada"
              width={2376}
              height={668}
              priority
              sizes="(max-width: 768px) 92vw, 520px"
              className="h-auto w-full"
            />
          </div>
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b3743]">
          Estética Regenerativa
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl leading-tight text-[#3e2428] md:text-6xl">
          Procedimentos estratégicos para contorno corporal, pele e performance.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[#6b4d47] md:text-lg">
          Fale direto no WhatsApp ou, se quiser avaliação gratuita, cadastre-se
          para gerar seu cupom de avaliação.
          <FaArrowDown aria-hidden="true" className="ml-1 inline-block align-middle text-[#a44651]" />
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <TrackedLink
            href={directWhatsappUrl}
            target="_blank"
            rel="noreferrer"
            eventName="hero_whatsapp_click"
            eventPayload={{ placement: "hero" }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#a44651] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8b3743]"
          >
            <FaWhatsapp aria-hidden="true" className="text-base" />
            Falar no WhatsApp agora
          </TrackedLink>
          <TrackedLink
            href="#cadastro-avaliacao"
            eventName="scroll_to_evaluation_click"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#a44651] px-6 py-3 text-sm font-semibold text-[#a44651] transition hover:bg-[#eed5d8]"
          >
            <FaRegFileAlt aria-hidden="true" className="text-base" />
            Quero meu cupom de avaliação
          </TrackedLink>
        </div>

        <div className="mt-7 grid gap-2 sm:grid-cols-3">
          {valueHighlights.map((item) => (
            <div
              key={item}
              className="rounded-xl border border-[#dab98f] bg-[#fff8ef]/90 px-4 py-3 text-base font-bold text-[#6b4d47] md:text-lg"
            >
              {item}
            </div>
          ))}
        </div>
      </header>

      <ProcedureNavbar procedureGroups={procedureGroups} />

      <main className="mt-8 space-y-8 md:mt-10 md:space-y-10">
        <section
          id="a-profissional"
          className="surface-card scroll-mt-30 rounded-3xl p-6 md:p-8"
        >
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b3743]">
                A profissional
              </p>
              <h2 className="mt-3 text-3xl text-[#3e2428] md:text-4xl">Lara Rodrigues Schneider</h2>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-[#6b4d47] md:text-base">
                Lara Rodrigues Schneider é <span className="font-medium text-[#5a2e34]">
                farmacêutica esteticista</span> com mais de quatro anos de
                experiência dedicada à área da estética.
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6b4d47] md:text-base">
                <span className="font-medium text-[#5a2e34]">Especialista em
                farmacologia, farmácia estética, cosmetologia e aplicação de
                injetáveis</span>, construiu sua trajetória unindo conhecimento
                científico e prática clínica.
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6b4d47] md:text-base">
                Formada em Farmácia pela UCPel (Pelotas/RS) desde 2013, hoje é
                <span className="font-medium text-[#5a2e34]"> mestre e
                doutoranda em Bioquímica pela UFPel</span>, onde atua em
                projetos de pesquisa voltados para inovação e desenvolvimento
                científico.
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6b4d47] md:text-base">
                Na prática clínica, possui <span className="font-medium text-[#5a2e34]">
                certificações e experiência em harmonização facial,
                harmonização corporal e harmonização de glúteos</span>, sempre
                buscando atualização em métodos avançados de estética. Seu
                diferencial está na constante busca por conhecimento,
                participando de cursos e formações que a mantêm na vanguarda da
                área.
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6b4d47] md:text-base">
                Atualmente, além de sua atuação acadêmica, dedica-se ao
                crescimento como empresária, ajudando mulheres a recuperar
                firmeza da pele e tratar a flacidez por meio do <span className="font-medium text-[#5a2e34]">
                Método RENASCER de remodelação corporal</span>, que alia
                ciência, estética e bem-estar.
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6b4d47] md:text-base">
                Profissional com foco em <span className="font-medium text-[#5a2e34]">
                estética regenerativa, contorno corporal e qualidade da pele</span>,
                com protocolos personalizados para cada objetivo.
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6b4d47] md:text-base">
                O atendimento combina estratégia técnica, avaliação individual e
                acompanhamento para <span className="font-medium text-[#5a2e34]">
                resultados naturais, seguros e sustentados</span>.
              </p>
            </div>

            <figure className="overflow-hidden rounded-2xl border border-[#dab98f] bg-[#fdf6ec] shadow-[0_22px_50px_-35px_rgba(69,35,40,0.55)]">
              <Image
                src="/Profissional.png"
                alt="Lara Schneider, profissional de estética regenerativa"
                width={1200}
                height={1600}
                sizes="(max-width: 768px) 92vw, 420px"
                className="h-full w-full object-cover"
              />
            </figure>
          </div>
        </section>

        <section
          id="procedimentos"
          className="surface-card scroll-mt-30 rounded-3xl p-6 md:p-8"
        >
          <h2 className="flex items-center gap-2 text-3xl text-[#3e2428] md:text-4xl">
            <FaRegFileAlt aria-hidden="true" className="text-[#8b3743]" />
            <span>Procedimentos</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b4d47] md:text-base">
            Seleção inicial para resultados naturais, personalizados e orientados
            por objetivo.
          </p>

          <article
            id="metodo-renascer"
            className="mt-5 scroll-mt-30 rounded-2xl border-2 border-[#a44651]/40 bg-linear-to-r from-[#f7ebdd] to-[#fff8ef] p-5 md:p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b3743]">
              Destaque do método
            </p>
            <h3 className="mt-2 text-2xl text-[#5a2e34] md:text-3xl">
              Método R.E.N.A.S.C.E.R
            </h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#6b4d47] md:text-base">
              Remodelação Estratégica Natural para Ativação e Sustentação do
              Contorno Corporal
            </p>
            <p className="mt-4 text-sm leading-7 text-[#6b4d47] md:text-base">
              Um método criado para tratar <em className="font-semibold">flacidez e
              perda de contorno corporal</em> respeitando o funcionamento natural
              da pele.
            </p>
            <p className="mt-3 text-sm leading-7 text-[#6b4d47] md:text-base">
              Não é sobre mudar o corpo. É sobre <em className="font-semibold">
              estimular o corpo a recuperar firmeza e estrutura</em>.
            </p>
            <a
              href="#informacoes-procedimentos"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#a44651] px-4 py-2 text-sm font-semibold text-[#a44651] transition hover:bg-[#eed5d8]"
            >
              <FaRegFileAlt aria-hidden="true" className="text-sm" />
              Ir para os textos informativos dos procedimentos
            </a>

            <div className="mt-6 rounded-2xl border border-[#dab98f] bg-white/70 p-4 md:p-5">
              <h4 className="text-lg font-semibold text-[#5a2e34] md:text-xl">As etapas do método</h4>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <article className="rounded-xl border border-[#e6ccaa] bg-[#fff8ef] p-4">
                  <h5 className="text-base font-semibold text-[#5a2e34]">R — Reconhecimento da pele</h5>
                  <p className="mt-2 text-sm leading-6 text-[#6b4d47]">Avaliação profunda da região tratada.</p>
                  <p className="mt-2 text-sm leading-6 text-[#6b4d47]">Aqui analisamos:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#6b4d47]">
                    <li>grau de flacidez</li>
                    <li>qualidade da pele</li>
                    <li>histórico corporal</li>
                    <li>distribuição de colágeno</li>
                  </ul>
                  <p className="mt-2 text-sm leading-6 text-[#6b4d47]">Essa etapa define o caminho correto do tratamento.</p>
                </article>

                <article className="rounded-xl border border-[#e6ccaa] bg-[#fff8ef] p-4">
                  <h5 className="text-base font-semibold text-[#5a2e34]">E — Estratégia personalizada</h5>
                  <p className="mt-2 text-sm leading-6 text-[#6b4d47]">Cada corpo responde de forma diferente.</p>
                  <p className="mt-2 text-sm leading-6 text-[#6b4d47]">Nesta etapa é definido:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#6b4d47]">
                    <li>protocolo ideal</li>
                    <li>quantidade de sessões</li>
                    <li>combinação de estímulos</li>
                  </ul>
                  <p className="mt-2 text-sm leading-6 text-[#6b4d47]">O objetivo é criar um plano individualizado.</p>
                </article>

                <article className="rounded-xl border border-[#e6ccaa] bg-[#fff8ef] p-4">
                  <h5 className="text-base font-semibold text-[#5a2e34]">N — Nutrição e estímulo da pele</h5>
                  <p className="mt-2 text-sm leading-6 text-[#6b4d47]">Aqui iniciamos os procedimentos que estimulam a regeneração da pele.</p>
                  <p className="mt-2 text-sm leading-6 text-[#6b4d47]">Os protocolos são voltados para:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#6b4d47]">
                    <li>estimular colágeno</li>
                    <li>melhorar firmeza</li>
                    <li>reorganizar a estrutura da pele</li>
                  </ul>
                </article>

                <article className="rounded-xl border border-[#e6ccaa] bg-[#fff8ef] p-4">
                  <h5 className="text-base font-semibold text-[#5a2e34]">A — Ativação do contorno corporal</h5>
                  <p className="mt-2 text-sm leading-6 text-[#6b4d47]">Nesta fase, o tratamento foca na remodelação da região.</p>
                  <p className="mt-2 text-sm leading-6 text-[#6b4d47]">A pele passa a responder melhor aos estímulos, trazendo:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#6b4d47]">
                    <li>melhora da firmeza</li>
                    <li>redefinição do contorno</li>
                    <li>aparência mais uniforme</li>
                  </ul>
                </article>

                <article className="rounded-xl border border-[#e6ccaa] bg-[#fff8ef] p-4">
                  <h5 className="text-base font-semibold text-[#5a2e34]">S — Sustentação dos resultados</h5>
                  <p className="mt-2 text-sm leading-6 text-[#6b4d47]">Manutenção e acompanhamento.</p>
                  <p className="mt-2 text-sm leading-6 text-[#6b4d47]">Aqui orientamos:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#6b4d47]">
                    <li>intervalo ideal entre sessões</li>
                    <li>estímulos complementares</li>
                    <li>cuidados de manutenção</li>
                  </ul>
                </article>

                <article className="rounded-xl border border-[#e6ccaa] bg-[#fff8ef] p-4">
                  <h5 className="text-base font-semibold text-[#5a2e34]">C — Consolidação</h5>
                  <p className="mt-2 text-sm leading-6 text-[#6b4d47]">Fase em que os resultados se tornam mais visíveis e consistentes.</p>
                  <p className="mt-2 text-sm leading-6 text-[#6b4d47]">O objetivo é garantir:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#6b4d47]">
                    <li>estabilidade da pele</li>
                    <li>manutenção do contorno corporal</li>
                  </ul>
                </article>

                <article className="rounded-xl border border-[#e6ccaa] bg-[#fff8ef] p-4 md:col-span-2">
                  <h5 className="text-base font-semibold text-[#5a2e34]">E — Evolução da pele</h5>
                  <p className="mt-2 text-sm leading-6 text-[#6b4d47]">A pele continua respondendo ao estímulo mesmo após o protocolo.</p>
                  <p className="mt-2 text-sm leading-6 text-[#6b4d47]">Por isso, acompanhamos a evolução para manter resultados naturais e duradouros.</p>
                </article>
              </div>
            </div>
          </article>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {procedureGroups.map((group) => (
              <article
                key={group.title}
                id={`grupo-${slugifyAnchor(group.title)}`}
                className="rounded-2xl border border-[#dab98f] bg-[#fff8ef] p-5"
              >
                <h3 className="text-xl font-semibold text-[#5a2e34]">{group.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-[#6b4d47]">
                  {group.items.map((item) => {
                    const isFeaturedProcedure = item === "Harmonização glútea avançada";

                    return (
                      <li key={item} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#c4914c]" />
                        <span className="inline-flex items-center gap-2">
                          <a
                            href={`#procedimento-${slugifyAnchor(item)}`}
                            className={`underline decoration-[#dab98f] underline-offset-4 transition hover:text-[#8b3743] ${
                              isFeaturedProcedure ? "font-semibold text-[#8b3743]" : ""
                            }`}
                          >
                            {item}
                          </a>
                          {isFeaturedProcedure ? (
                            <span className="inline-flex rounded-full border border-[#a44651] bg-[#fff1f3] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8b3743]">
                              Em destaque
                            </span>
                          ) : null}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))}
          </div>

          <section
            id="informacoes-procedimentos"
            className="mt-7 scroll-mt-30 rounded-2xl border border-[#dab98f] bg-[#fdf6ec] p-4 md:p-5"
          >
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8b3743]">
              <FaRegFileAlt aria-hidden="true" className="text-sm" />
              Informações de cada procedimento
            </p>
            <p className="mt-2 text-sm text-[#6b4d47]">
              Clique no procedimento desejado acima, para abrir os detalhes abaixo.
              <FaArrowDown
                aria-hidden="true"
                className="ml-1 inline-block -rotate-180 align-middle text-[11px]"
              />
              <FaArrowDown
                aria-hidden="true"
                className="ml-0.5 inline-block align-middle text-[11px]"
              />
            </p>
            <div className="mt-4 space-y-3">
              {procedureGroups.flatMap((group) => group.items).map((item) => {
                const detail = procedureExampleTexts[item];
                const isFeaturedProcedure = item === "Harmonização glútea avançada";

                return (
                  <article
                    key={item}
                    id={`procedimento-${slugifyAnchor(item)}`}
                    className={`procedure-detail scroll-mt-30 rounded-xl border p-4 ${
                      isFeaturedProcedure
                        ? "border-[#a44651]/50 bg-[#fff6f7]"
                        : "border-[#dab98f] bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="inline-flex items-center gap-2 text-base font-semibold text-[#5a2e34] md:text-lg">
                        <FaRegFileAlt aria-hidden="true" className="text-sm text-[#8b3743]" />
                        {item}
                      </h4>
                      {isFeaturedProcedure ? (
                        <span className="inline-flex rounded-full border border-[#a44651] bg-[#fff1f3] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8b3743]">
                          Em destaque
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#6b4d47]">{detail.description}</p>
                    {detail.focus ? (
                      <p className="mt-2 text-sm leading-6 text-[#6b4d47]">{detail.focus}</p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        </section>

        <section
          id="cadastro-avaliacao"
          className="grid gap-6 md:grid-cols-[1.05fr_1fr] md:gap-8"
        >
          <article className="surface-card rounded-3xl p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b3743]">
              Localização
            </p>
            <h2 className="mt-3 text-3xl text-[#3e2428] md:text-4xl">
              Consultório, clínica e atendimento
            </h2>

            <div className="mt-6 grid gap-4 rounded-2xl border border-[#dab98f] bg-[#f7ebdd] p-4">
              <div>
                <h3 className="text-lg font-semibold text-[#5a2e34]">Informações da clínica</h3>
                <p className="mt-2 text-sm text-[#6b4d47]">
                  <strong>Nome:</strong> Clínica Bellitia
                </p>
                <p className="mt-1 text-sm text-[#6b4d47]">
                  <span className="inline-flex items-start gap-1.5">
                    <span>
                      <strong>Endereço:</strong> {clinicInfo.address}
                    </span>
                    <FaMapMarkerAlt
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-[#a44651]"
                    />
                  </span>
                </p>
                <p className="mt-1 text-sm text-[#6b4d47]">
                  <span className="font-semibold uppercase tracking-[0.08em] text-[#8b3743]">
                    Contato/Atendimento
                  </span>
                </p>
                <p className="mt-1 text-sm text-[#6b4d47]">
                  <strong>Telefone/WhatsApp:</strong>{" "}
                  <TrackedLink
                    href={clinicPhoneDialUrl}
                    eventName="phone_dial_click"
                    eventPayload={{ placement: "clinic-info" }}
                    aria-label={`Ligar para ${clinicInfo.whatsappDisplay}`}
                    className="font-semibold text-[#a44651] underline decoration-2 underline-offset-2 transition hover:text-[#8b3743] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a44651] focus-visible:ring-offset-2"
                  >
                    {clinicInfo.whatsappDisplay}
                  </TrackedLink>
                </p>
                <p className="mt-1 text-sm text-[#6b4d47]">
                  <strong>Horário:</strong> {clinicInfo.serviceHours}
                </p>

                <div className="mt-4 overflow-hidden rounded-xl border border-[#dab98f] bg-white">
                  <iframe
                    title={`Mini mapa da ${clinicInfo.name}`}
                    src={clinicMapEmbedUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-44 w-full border-0"
                    allowFullScreen
                  />
                </div>
                <TrackedLink
                  href={clinicMapOpenUrl}
                  target="_blank"
                  rel="noreferrer"
                  eventName="open_google_maps_click"
                  eventPayload={{ placement: "clinic-info" }}
                  className="mt-2 inline-flex text-xs font-semibold text-[#a44651] underline underline-offset-2 hover:text-[#8b3743]"
                >
                  Abrir no Google Maps
                </TrackedLink>
              </div>
            </div>

            <TrackedLink
              href={directWhatsappUrl}
              target="_blank"
              rel="noreferrer"
              eventName="direct_whatsapp_click"
              eventPayload={{ placement: "evaluation-section" }}
              className="mt-5 inline-flex rounded-xl border border-[#a44651] px-4 py-2 text-sm font-semibold text-[#a44651] transition hover:bg-[#eed5d8]"
            >
              Entrar em contato sem cadastro
            </TrackedLink>
          </article>

          <LeadEvaluationForm />
        </section>

      </main>

      <footer className="mt-8 rounded-2xl border border-[#dab98f] bg-[#f7ebdd] px-6 py-5 text-sm text-[#6b4d47]">
        <p>{clinicInfo.name}</p>
        <p className="mt-1 flex flex-wrap items-center gap-2">
          <span>{clinicInfo.address}</span>
          <span aria-hidden="true">|</span>
          <span>{clinicInfo.serviceHours}</span>
        </p>
        <p className="mt-1">
          Telefone/WhatsApp:{" "}
          <TrackedLink
            href={clinicPhoneDialUrl}
            eventName="footer_phone_dial_click"
            eventPayload={{ placement: "footer" }}
            aria-label={`Ligar para ${clinicInfo.whatsappDisplay}`}
            className="font-semibold text-[#a44651] underline decoration-2 underline-offset-2 transition hover:text-[#8b3743] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a44651] focus-visible:ring-offset-2"
          >
            {clinicInfo.whatsappDisplay}
          </TrackedLink>
        </p>

        <div className="mt-3 overflow-hidden rounded-xl border border-[#dab98f] bg-white">
          <Image
            src={clinicFrontImageUrl}
            alt="Foto da fachada da clínica"
            width={1200}
            height={500}
            loading="lazy"
            className="h-52 w-full object-cover object-[50%_68%]"
          />
        </div>

      </footer>

      <p className=" text-center text-xs font-semibold leading-5 text-[#8b3743]">
        <span className="mt25 inline-flex items-center gap-1">
        Desenvolvido por&nbsp; 
          <FaBomb aria-hidden="true" className="text-[#a44651]" />GranadAndrei
        </span>
      </p>
    </div>
  );
}

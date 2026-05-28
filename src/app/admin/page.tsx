import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE_NAME,
  getAdminAuthConfigError,
  readAdminSession,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

function formatPhone(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, "");
  const localDigits = digitsOnly.startsWith("55") && digitsOnly.length >= 12
    ? digitsOnly.slice(2)
    : digitsOnly;

  if (localDigits.length === 11) {
    return `+55 (${localDigits.slice(0, 2)}) ${localDigits.slice(2, 7)}-${localDigits.slice(7)}`;
  }

  if (localDigits.length === 10) {
    return `+55 (${localDigits.slice(0, 2)}) ${localDigits.slice(2, 6)}-${localDigits.slice(6)}`;
  }

  return phone;
}

function getLoginErrorMessage(errorCode: string | undefined, configError: string | null): string | null {
  if (errorCode === "invalid") {
    return "Login ou senha inválidos.";
  }

  if (errorCode === "config") {
    return configError ?? "Painel admin sem configuração.";
  }

  return null;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const configError = getAdminAuthConfigError();
  const loginErrorMessage = getLoginErrorMessage(resolvedSearchParams.error, configError);
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const session = readAdminSession(sessionToken);

  if (!session.isAuthenticated) {
    return (
      <main className="mx-auto w-full max-w-md px-4 pb-16 pt-10 md:px-6">
        <article className="surface-card rounded-3xl p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b3743]">
            Acesso restrito
          </p>
          <h1 className="mt-3 text-3xl text-[#3e2428]">Painel administrativo</h1>
          <p className="mt-3 text-sm leading-6 text-[#6b4d47]">
            Entre com login e senha para visualizar os clientes cadastrados no cupom de avaliação gratuita.
          </p>

          {loginErrorMessage ? (
            <p className="mt-4 rounded-xl border border-[#a44651]/40 bg-[#fff1f3] px-3 py-2 text-sm text-[#8b3743]" role="alert">
              {loginErrorMessage}
            </p>
          ) : null}

          <form method="post" action="/admin/login" className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-[#5a2e34]">Login</span>
              <input
                type="text"
                name="username"
                autoComplete="username"
                required
                className="mt-1 w-full rounded-xl border border-[#dab98f] bg-white px-3 py-2 text-sm text-[#3e2428] outline-none transition focus:border-[#a44651] focus:ring-2 focus:ring-[#eed5d8]"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#5a2e34]">Senha</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className="mt-1 w-full rounded-xl border border-[#dab98f] bg-white px-3 py-2 text-sm text-[#3e2428] outline-none transition focus:border-[#a44651] focus:ring-2 focus:ring-[#eed5d8]"
              />
            </label>

            <button
              type="submit"
              disabled={Boolean(configError)}
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#a44651] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8b3743] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Entrar no dashboard
            </button>
          </form>

          {process.env.NODE_ENV !== "production" ? (
            <p className="mt-4 text-xs text-[#6b4d47]">
              Ambiente local sem variáveis definidas usa login padrão: admin e senha: admin123.
            </p>
          ) : null}
        </article>
      </main>
    );
  }

  const leads = await prisma.lead.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
      couponCode: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const latestLead = leads[0] ?? null;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 md:px-8">
      <section className="surface-card rounded-3xl p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b3743]">
              Dashboard admin
            </p>
            <h1 className="mt-2 text-3xl text-[#3e2428] md:text-4xl">
              Cadastros do cupom de avaliação gratuita
            </h1>
            <p className="mt-2 text-sm text-[#6b4d47]">
              Sessão ativa para: <strong>{session.username}</strong>
            </p>
          </div>

          <form method="post" action="/admin/logout">
            <button
              type="submit"
              className="inline-flex rounded-xl border border-[#a44651] px-4 py-2 text-sm font-semibold text-[#a44651] transition hover:bg-[#eed5d8]"
            >
              Sair
            </button>
          </form>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <article className="rounded-2xl border border-[#dab98f] bg-[#fff8ef] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8b3743]">
              Total de cadastros
            </p>
            <p className="mt-2 text-3xl font-semibold text-[#5a2e34]">{leads.length}</p>
          </article>

          <article className="rounded-2xl border border-[#dab98f] bg-[#fff8ef] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8b3743]">
              Último cadastro
            </p>
            <p className="mt-2 text-sm text-[#5a2e34]">
              {latestLead ? `${latestLead.name} em ${formatDateTime(latestLead.createdAt)}` : "Nenhum cadastro ainda."}
            </p>
          </article>
        </div>

        {leads.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-[#dab98f] bg-[#fffaf4] px-4 py-3 text-sm text-[#6b4d47]">
            Ainda não existem clientes cadastrados.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-[#dab98f] bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f7ebdd] text-[#5a2e34]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">Telefone</th>
                  <th className="px-4 py-3 font-semibold">Cupom</th>
                  <th className="px-4 py-3 font-semibold">Data</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-[#f1dfc5] text-[#6b4d47]">
                    <td className="px-4 py-3">{lead.name}</td>
                    <td className="px-4 py-3">{formatPhone(lead.phone)}</td>
                    <td className="px-4 py-3 font-semibold text-[#5a2e34]">{lead.couponCode}</td>
                    <td className="px-4 py-3">{formatDateTime(lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

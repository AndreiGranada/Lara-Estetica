# Lara Schneider Estetica Regenerativa

Landing page em Next.js com dois fluxos de conversao:

- Contato direto via WhatsApp sem cadastro
- Cadastro opcional para liberar cupom serial de avaliacao gratuita

Quando o usuario se cadastra, os dados sao salvos em Neon PostgreSQL e o cupom de avaliacao gratuita e gerado no backend com sequencia global unica (4 digitos, iniciando em 0100).

## Stack

- Next.js (App Router)
- React + TypeScript
- React Hook Form + Zod
- Prisma ORM + Neon PostgreSQL

## Configuracao

1. Instale as dependencias:

```bash
npm install
```

1. Configure a conexao de banco em `.env`:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@ep-seu-host.us-east-2.aws.neon.tech/neondb?sslmode=verify-full"
```

1. Defina a URL publica do site para metadados e sitemap:

```env
NEXT_PUBLIC_SITE_URL="https://seu-dominio.com"
```

1. Opcional: controle se a aba de compartilhamento abre automaticamente apos gerar o cupom:

```env
NEXT_PUBLIC_AUTO_OPEN_EVALUATION_SHARE_TAB="true"
```

Valores aceitos para desativar: `false`, `0`, `no` ou `off`.

1. Opcional: controle se o WhatsApp abre automaticamente apos gerar o cupom:

```env
NEXT_PUBLIC_AUTO_OPEN_EVALUATION_WHATSAPP="true"
```

Valores aceitos para desativar: `false`, `0`, `no` ou `off`.

1. Configure credenciais do dashboard admin (`/admin`):

```env
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="defina-uma-senha-forte"
ADMIN_SESSION_SECRET="defina-uma-chave-longa-e-segura"
```

1. Opcional (recomendado): ajuste rate limit basico para o endpoint de cadastro:

```env
LEADS_RATE_LIMIT_MAX_REQUESTS="10"
LEADS_RATE_LIMIT_WINDOW_MS="60000"
```

No ambiente local, se essas variaveis nao forem definidas, o acesso padrao sera:

- Login: `admin`
- Senha: `admin123`

1. Gere client e rode migracoes locais:

```bash
npm run db:generate
npm run db:migrate
```

1. Inicialize o contador do cupom de avaliacao gratuita:

```bash
npm run db:seed
```

1. Rode localmente:

```bash
npm run dev
```

## Deploy em Producao (Vercel + Neon)

1. Configure no provedor (ex.: Vercel) as variaveis:

- DATABASE_URL
- NEXT_PUBLIC_SITE_URL
- ADMIN_USERNAME
- ADMIN_PASSWORD
- ADMIN_SESSION_SECRET
- NEXT_PUBLIC_AUTO_OPEN_EVALUATION_SHARE_TAB
- NEXT_PUBLIC_AUTO_OPEN_EVALUATION_WHATSAPP
- LEADS_RATE_LIMIT_MAX_REQUESTS (opcional)
- LEADS_RATE_LIMIT_WINDOW_MS (opcional)

1. Aplique as migracoes no banco de producao:

```bash
npm run db:migrate:deploy
```

1. Rode a seed apenas na primeira inicializacao (ou quando precisar reinicializar contador):

```bash
npm run db:seed:prod
```

1. Rode o build para validar antes de publicar:

```bash
npm run build
```

## Perfis Recomendados de Ambiente

- Local: use [lara-web/.env.example](.env.example)
- Producao: use [lara-web/.env.production.example](.env.production.example)
- Homologacao: use [lara-web/.env.homolog.example](.env.homolog.example)

Exemplo para aplicar um perfil no Windows PowerShell:

```powershell
Copy-Item .env.production.example .env
```

Recomendacao de uso das flags:

- Producao: `NEXT_PUBLIC_AUTO_OPEN_EVALUATION_WHATSAPP="true"` e `NEXT_PUBLIC_AUTO_OPEN_EVALUATION_SHARE_TAB="true"`
- Homologacao: `NEXT_PUBLIC_AUTO_OPEN_EVALUATION_WHATSAPP="false"` e `NEXT_PUBLIC_AUTO_OPEN_EVALUATION_SHARE_TAB="false"`

## Scripts

- `npm run dev`: ambiente de desenvolvimento
- `npm run build`: build de producao
- `npm run lint`: lint
- `npm run postinstall`: gera Prisma Client automaticamente em install/deploy
- `npm run db:generate`: gera Prisma Client
- `npm run db:migrate`: cria/aplica migracoes locais
- `npm run db:migrate:deploy`: aplica migracoes em producao
- `npm run db:seed`: executa seed do contador do cupom de avaliacao gratuita
- `npm run db:seed:prod`: executa seed em producao (uso controlado)
- `npm run db:check`: consulta leads recentes e contador no banco
- `npm run db:reset`: limpa leads de teste e reseta contador para 0100

## Regras de Negocio

- Cadastro nao e obrigatorio para falar no WhatsApp.
- Cupom de avaliacao gratuita so e liberado para quem concluir cadastro com consentimento.
- Cupons sao sequenciais e unicos (0100, 0101, 0102...).

## Dashboard Admin

- URL: `/admin`
- Requer login e senha
- Exibe listagem de clientes cadastrados para cupom de avaliacao gratuita (nome e telefone), com cupom e data do cadastro

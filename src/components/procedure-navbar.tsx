"use client";

import Link from "next/link";
import { useState } from "react";

type ProcedureGroup = {
  title: string;
  items: string[];
};

type ProcedureNavbarProps = {
  procedureGroups: ProcedureGroup[];
};

function slugifyAnchor(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProcedureNavbar({ procedureGroups }: ProcedureNavbarProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const activeGroup = procedureGroups.find((group) => group.title === openGroup) ?? null;

  return (
    <nav
      aria-label="Navegação da página"
      className="surface-card mt-5 rounded-2xl px-4 py-3 md:px-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="#a-profissional"
          className="shrink-0 rounded-full border border-[#a44651] bg-[#a44651] px-3 py-1.5 text-sm font-semibold text-white transition hover:border-[#8b3743] hover:bg-[#8b3743]"
        >
          A profissional
        </Link>

        <Link
          href="#metodo-renascer"
          className="shrink-0 rounded-full border border-[#dab98f] bg-[#fff8ef] px-3 py-1.5 text-sm font-semibold text-[#5a2e34] transition hover:border-[#a44651] hover:text-[#8b3743]"
        >
          Método R.E.N.A.S.C.E.R
        </Link>

        {procedureGroups.map((group) => {
          const isOpen = openGroup === group.title;

          return (
            <button
              key={group.title}
              type="button"
              aria-expanded={isOpen}
              onClick={() =>
                setOpenGroup((current) =>
                  current === group.title ? null : group.title
                )
              }
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition ${
                isOpen
                  ? "border-[#a44651] bg-[#f7ebdd] font-semibold text-[#8b3743]"
                  : "border-[#dab98f] bg-white text-[#6b4d47] hover:border-[#a44651] hover:text-[#8b3743]"
              }`}
            >
              {group.title}
            </button>
          );
        })}
      </div>

      {activeGroup ? (
        <div className="mt-3 rounded-2xl border border-[#dab98f] bg-[#fffaf4] p-3 md:p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8b3743]">
            {activeGroup.title}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {activeGroup.items.map((item) => {
              const isFeaturedProcedure = item === "Harmonização glútea avançada";

              return (
                <li key={item}>
                  <a
                    href={`#procedimento-${slugifyAnchor(item)}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#dab98f] bg-white px-3 py-1.5 text-sm text-[#6b4d47] transition hover:border-[#a44651] hover:text-[#8b3743]"
                  >
                    <span>{item}</span>
                    {isFeaturedProcedure ? (
                      <span className="inline-flex rounded-full border border-[#a44651] bg-[#fff1f3] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8b3743]">
                        Em destaque
                      </span>
                    ) : null}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
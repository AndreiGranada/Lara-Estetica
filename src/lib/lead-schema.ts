import { z } from "zod";

const phonePattern = /^\+?[0-9()\-\s]{10,25}$/;

function hasValidBrazilianLength(value: string): boolean {
  const digitsOnly = value.replace(/\D/g, "");
  const localDigits = digitsOnly.startsWith("55")
    ? digitsOnly.slice(2)
    : digitsOnly;

  return localDigits.length === 10 || localDigits.length === 11;
}

export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Informe seu nome completo.")
    .max(120, "Nome muito longo."),
  phone: z
    .string()
    .trim()
    .regex(phonePattern, "Informe um telefone válido com DDD.")
    .refine(
      (value) => hasValidBrazilianLength(value),
      "Use um telefone com DDD válido (10 ou 11 dígitos).",
    ),
});

export type LeadFormInput = z.infer<typeof leadSchema>;

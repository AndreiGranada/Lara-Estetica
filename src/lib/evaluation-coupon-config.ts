const DISABLED_VALUES = new Set(["0", "false", "no", "off"]);

function parseFeatureFlag(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  return !DISABLED_VALUES.has(value.trim().toLowerCase());
}

export const AUTO_OPEN_EVALUATION_SHARE_TAB = parseFeatureFlag(
  process.env.NEXT_PUBLIC_AUTO_OPEN_EVALUATION_SHARE_TAB
);

export const AUTO_OPEN_EVALUATION_WHATSAPP = parseFeatureFlag(
  process.env.NEXT_PUBLIC_AUTO_OPEN_EVALUATION_WHATSAPP
);

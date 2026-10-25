const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;

function paint(code: string, value: string): string {
  return useColor ? `\u001b[${code}m${value}\u001b[0m` : value;
}

const FONT: Record<string, string[]> = {
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  ' ': ['0', '0', '0', '0', '0', '0', '0'],
};

function pixelWord(text: string): string[] {
  return Array.from({ length: 7 }, (_, row) =>
    [...text].map(char => FONT[char] ?? FONT[' ']).map(bits =>
      bits.map(bit => bit === '1' ? '██' : '  ').join(''),
    ).join(' '),
  );
}

/** Compact pixel-art terminal identity for Office Office. */
export function renderBanner(): string {
  const coral = (value: string) => paint('38;5;203', value);
  const gold = (value: string) => paint('38;5;220', value);
  const muted = (value: string) => paint('38;5;245', value);
  const title = pixelWord('OFFICE OFFICE').map(coral).join('\n');
  return [
    title,
    gold('  LOCAL CODING TEAM  ·  OLLAMA / MULTI-AGENT'),
    muted('  michael  planner   ·   dwight  backend   ·   pam  frontend   ·   jim  review'),
  ].join('\n');
}

// Show the identity automatically for interactive work, like a coding-agent terminal splash.
// Keep help/config/status commands quiet so machine-readable and diagnostic output stays clean.
const command = process.argv[2] ?? '';
const quiet = new Set(['help', '--help', '-h', 'config', 'status', 'diff', 'doctor', 'setup', 'agents', 'agent', 'skills', 'skill']);
if (process.stdout.isTTY && !quiet.has(command) && !process.env.OFFICE_NO_SPLASH) {
  console.log(renderBanner());
}

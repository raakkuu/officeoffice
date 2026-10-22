const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;

function paint(code: string, value: string): string {
  return useColor ? `\u001b[${code}m${value}\u001b[0m` : value;
}

/** Pixel-inspired block-letter terminal identity for Office Office. */
export function renderBanner(): string {
  const coral = (value: string) => paint('38;5;203', value);
  const gold = (value: string) => paint('38;5;220', value);
  const muted = (value: string) => paint('38;5;245', value);
  return [
    coral(' ██████╗ ███████╗███████╗██╗ ██████╗███████╗'),
    coral('██╔═══██╗██╔════╝██╔════╝██║██╔════╝██╔════╝'),
    coral('██║   ██║█████╗  █████╗  ██║██║     █████╗  '),
    coral('██║   ██║██╔══╝  ██╔══╝  ██║██║     ██╔══╝  '),
    coral('╚██████╔╝██║     ██║     ██║╚██████╗███████╗'),
    coral(' ╚═════╝ ╚═╝     ╚═╝     ╚═╝ ╚═════╝╚══════╝'),
    gold('             O F F I C E   O F F I C E'),
    muted('        LOCAL-FIRST MULTI-AGENT ORCHESTRATION'),
  ].join('\n');
}
const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;

function paint(code: string, value: string): string {
  return useColor ? `\u001b[${code}m${value}\u001b[0m` : value;
}

/** A compact, terminal-safe diagram of the Office Office agent workflow. */
export function renderBanner(): string {
  const gold = (value: string) => paint('38;5;220', value);
  const red = (value: string) => paint('38;5;160', value);
  const muted = (value: string) => paint('2', value);
  return [
    gold('   ╭──────────────────────────────────────────────────────╮'),
    gold('   │') + '  ◈  ' + red('OFFICE OFFICE') + '  ' + muted('LOCAL-FIRST AGENT ORCHESTRATION') + '  ' + gold('│'),
    gold('   ╰──────────────────────────────────────────────────────╯'),
    '',
    '                      .────────────.',
    '                  .───(   MICHAEL    )───.',
    '                  │     plan + review    │',
    '                  ╰─────────┬───────────╯',
    '             ┌───────────────┼───────────────┐',
    '             ▼               ▼               ▼',
    '       ┌──────────┐    ┌──────────┐    ┌──────────┐',
    '       │  DWIGHT  │    │   PAM    │    │   JIM    │',
    '       │ backend  │    │ frontend │    │   tests  │',
    '       └────┬─────┘    └────┬─────┘    └────┬─────┘',
    '            ╰───────────────┼───────────────╯',
    '                            ▼',
    '                  [ results • review • done ]',
    '',
    muted('  CLI first  •  Local workspace  •  Your configured provider CLIs'),
  ].join('\n');
}
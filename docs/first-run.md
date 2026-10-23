# First run

This guide takes you from a fresh checkout to a small, reviewable mission.

## 1. Install and build

Install Node.js 20 or newer and Git, then run:

```bash
git clone https://github.com/raakkuu/officeoffice.git
cd officeoffice
npm install
npm run check
npm test
npm run build
npm link
```

## 2. Install one provider

Office Office does not install or authenticate coding-agent providers for you. Install one supported provider CLI and complete that provider's own sign-in or API-key setup.

Then run:

```bash
office setup
office doctor
office config
```

The setup command reports detected provider executables and suggests next steps. Detection does not prove successful authentication.

## 3. Run a small mission

From a test repository with important work backed up:

```bash
office "Inspect this project and suggest one small bug fix. Add a focused test if appropriate, then report the changed files."
```

For a visual view, start the dashboard in another terminal:

```bash
office web
```

Open http://127.0.0.1:4311. The dashboard is local by default. Avoid LAN mode unless you understand the network exposure.

## 4. Review the result

Before accepting the work:

```bash
git status --short
git diff
npm test
npm run check
npm run build
```

Use the target project's own verification commands where appropriate. Review the diff before committing, pushing, merging, or deploying.

## Troubleshooting

- **No provider detected:** install a provider CLI and confirm it is on your PATH.
- **Authentication issue:** follow the provider's official login or credential setup.
- **Integration unavailable:** run `office integrations status`; optional tools are disabled by default.
- **Knowledge retrieval unavailable:** missions can continue without XERJ when the optional provider is not installed.
- **Need help:** run `office --help`, then consult the [integration guide](integrations.md) and [safety guide](safety.md).

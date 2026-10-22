# Security Policy

Do not commit provider API keys, OAuth tokens, SSH keys, or other credentials. Prefer environment variables. Office Office does not print API-key values in `doctor` output.

Because coding agents can execute commands and modify files, treat an Office Office run as equivalent to granting an AI coding agent access to the selected workspace. Use Git, least-privilege credentials, and isolated repositories for untrusted work.

Report vulnerabilities privately to the repository owner rather than publishing secrets or exploit details in an issue.

# Security Policy
Please report vulnerabilities privately to the maintainers (use the private reporting channel of wherever this repository is hosted; none is configured in this archive). Do not open public issues for security problems.

Design notes: no remote code, strict extension-page CSP (`script-src 'self'`, `connect-src https://api.crossref.org`), sender-checked messaging, validated imports (size limits, schema sanitization, http/https-only URLs), no `innerHTML` use with user data (React escaping), minimal permissions.

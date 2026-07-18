# Retail UI Auth Session Template
ID: retail-ui-auth-session-template
Tags: auth, session, account, admin
Version: 2026.07
Owner: ArchitectIQ UI baseline
Effective-Date: 2026-07-18
Review-By: 2027-01-18

## Controls
- Define customer, admin, associate, support, marketplace partner, and AI-assisted frontend auth/session boundaries.
- Use secure cookies or approved token storage, OIDC/OAuth, CSRF/XSS controls, step-up auth, device/session revocation, and role-aware navigation.

## Risks
- Weak frontend session handling can expose account, loyalty, order, support, and privileged admin functions.

## Validation Needed
- Confirm auth flows, token storage, session settings, step-up actions, CSRF/XSS controls, support/admin roles, logout, revocation, and audit needs.

## Citations
- ArchitectIQ UI baseline: UI auth/session design must align to API and Security controls.

# Cloud Landing Zone Security Standard
ID: cloud-landing-zone-security
Version: 2026.07
Effective-Date: 2026-07-13
Review-By: 2027-07-15
Owner: Cloud Security
Tags: cloud, landing-zone, network, egress, waf, kms, workload-identity, policy-as-code

## Controls
- Separate production, non-production, security, logging, and shared-network accounts or subscriptions with policy-as-code guardrails.
- Use private networking, egress controls, WAF/CDN/bot protection, API gateway controls, workload identity, service-to-service TLS or mTLS, and managed KMS/HSM where required.
- Centralise audit logs, cloud control-plane logs, VPC/network logs, WAF logs, key usage events, admin actions, and security findings with tamper-resistant retention.
- Block public storage by default, require encryption at rest, require approved regions for regulated data, and require exception approval for public ingress or cross-region replication.

## Risks
- Cloud spend and delivery speed can hide security drift when accounts, regions, egress, public exposure, and logging are not governed from the landing zone.
- Uncontrolled egress can leak customer, payment, prompt, or support data to unapproved SaaS/model providers.

## Validation Needed
- Confirm cloud account/subscription structure, approved regions, guardrail policies, logging sinks, key ownership, network segmentation, egress policy, and exception workflow.
- Confirm production/non-production separation and whether regulated data can appear in lower environments, logs, traces, support bundles, prompts, or analytics.

## Compliance Mappings
- PCI-DSS: segmentation, logging, key management, vulnerability management, and access control evidence.
- GDPR/DPDP/CCPA: approved regions, data minimisation, processor controls, and cross-border transfer evidence.

## Citations
- Cloud landing-zone security must prove guardrails, approved regions, egress controls, encryption, logging, and exception ownership before production approval.

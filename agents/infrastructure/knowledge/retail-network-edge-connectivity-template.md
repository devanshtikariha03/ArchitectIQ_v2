# Retail Network Edge Connectivity Template
ID: retail-network-edge-connectivity-template
Version: 2026.07
Owner: ArchitectIQ Infrastructure Baseline
Effective-Date: 2026-07-17
Review-By: 2027-07-17
Tags: network, edge, cdn, waf, ingress, connectivity

## Controls
- Separate public edge, API ingress, private application runtime, data plane, operations/admin access, third-party connectivity, and store connectivity.
- Use CDN, WAF, bot management, API gateway, rate limits, TLS policy, and separate origin pools where browse/search and checkout/order paths have different criticality.
- Use private endpoints/private connectivity for databases, queues, secrets, object storage, observability, and sensitive processor integrations where supported.
- Define egress control, NAT, firewall policy, DNS, certificate lifecycle, admin access, and support access ownership.

## Risks
- Flat network or shared origin design can let campaign traffic, bot abuse, admin access, or third-party instability affect checkout/payment/order paths.
- Undefined egress and admin paths can invalidate security and compliance assumptions.

## Validation Needed
- Confirm VPC/VNet/subnet model, ingress/origin split, firewall rules, private endpoints, egress policy, third-party connectivity, DNS, certificate ownership, and admin access path.

## Citations
- ArchitectIQ Infrastructure requires explicit edge, private connectivity, and traffic-isolation evidence for retail workloads.

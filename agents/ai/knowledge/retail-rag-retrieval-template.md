# Retail RAG Retrieval Template
ID: retail-rag-retrieval-template
Tags: rag, retrieval, knowledge, corpus
Version: 2026.07
Owner: ArchitectIQ AI Architecture
Effective-Date: 2026-07-18
Review-By: 2027-01-18

## Controls
- Define approved AI knowledge corpus, chunking, metadata filters, retrieval scope, freshness, citations, and rebuild path before using RAG in customer or employee workflows.
- Keep retrieval grounded in approved sources and prevent cross-tenant, cross-region, stale, or unauthorized content retrieval.

## Risks
- Weak RAG boundaries can retrieve stale, unauthorized, cross-region, or customer-sensitive content.

## Validation Needed
- Confirm corpus owner, data classes, chunking, metadata, retrieval filters, freshness, citation policy, deletion propagation, and rebuild evidence.

## Citations
- ArchitectIQ AI baseline: RAG must be grounded in approved, classified, and rebuildable corpora.

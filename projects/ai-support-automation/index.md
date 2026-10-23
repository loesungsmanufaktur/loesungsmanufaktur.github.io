---
# Project settings - see projects/idp-platform/index.md for an explanation of each field.
# This project is a PLACEHOLDER - replace it with your own.
title: AI-Assisted Support Automation
summary: Workflows that classify incoming requests with an LLM and route them to the right team, with a human in the loop for edge cases.
tags: n8n, Claude, PostgreSQL
cover:
---

## Context

Support requests arrived in a shared inbox and were sorted manually.

## What I did

- Built n8n workflows that classify requests with an LLM
- Stored decisions in PostgreSQL for review and reporting
- Added a human review step for low-confidence cases

## Results

- Faster routing and a clear audit trail for every decision

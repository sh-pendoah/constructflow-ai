# Security Policy

## Trust Primitives Commitment

This repository adheres to the Pendoah Trust Primitives:
- Evidence trail with traceable decisions
- Policy controls and explicit refusal reasons
- Sovereign/data-residency execution profiles
- Budget guardrails and kill-switch controls
- Exception handling with human-in-the-loop
- Observability and audit exports
- Evaluation gates for release safety

## Reporting a Vulnerability

Please report vulnerabilities privately to the maintainers via GitHub Security Advisories or a direct maintainer contact.

## Response Targets

- Initial triage: within 24 hours
- Severity classification and mitigation plan: within 48 hours
- Critical fix target: as fast as operationally safe

## Data Residency Configuration

Data residency behavior is controlled by environment profile settings.
Suggested values for `REGION_LOCK`:
- `AWS_USEAST`
- `ORACLE_KSA`
- `AZURE_UAE`

Actual allowed values and enforcement logic are defined in each service runtime policy configuration.

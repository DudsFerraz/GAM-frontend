# Member status filter label design

## Problem

The Member management filter stores each situation option as the array required by the `IN` comparison. The shared filter summary currently interprets that array as multiple independent option values. Because the configured options also use arrays, no scalar item matches and the summary renders `Valor não disponível` once for each status.

## Accepted behavior

After a person selects a Member situation filter, the active-filter summary displays the exact Portuguese label configured for that option:

- `Ativo` for `['ACTIVE']`;
- `Inativo` for `['INACTIVE']`;
- `Ativos e inativos` for `['ACTIVE', 'INACTIVE']`.

The filter sent to the search callback keeps its current field, comparison method, and array value. Unknown or stale option values continue to use a neutral Portuguese fallback and never expose raw transport values.

## Design

Update the domain-neutral display helper in `src/components/SearchAndFilter/searchHelpers.ts`. For a select field, it first compares the complete filter value with each configured option value using the existing stable option key. When an exact option exists, it returns that option's label. If there is no complete match, the current item-by-item lookup remains available for configurations that genuinely represent multiple independently configured values.

No Member API, query, generated contract, route, or feature presentation mapping changes are required. The existing `MEMBERS_FILTER_CONFIG` remains the owner of the labels and transport values.

## Verification

Extend the shared `SearchAndFilter` component test to select the combined Member-style situation option and assert that the active-filter summary renders `Ativos e inativos` without `Valor não disponível`. Preserve the existing assertion that the search callback receives `['ACTIVE', 'INACTIVE']` with comparison method `IN`.

Run the focused component test, then the repository test suite, lint, and production build. Any failure caused by the pre-existing generated-contract modification must be reported separately from this correction.

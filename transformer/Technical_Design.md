# Technical Design: Candidate Transformer Pipeline

**Author:** Priyanshu Agrawal
**Email:** PriyanshuAgrawal_bt23cs006@nitmz.ac.in
**Project:** Eightfold

## 1. High-Level Pipeline Architecture
The pipeline follows a modular, multi-stage architecture to process candidate data from heterogeneous sources (CSV, PDF Resume) into a canonical profile.

**Detect → Parse → Normalize → Merge → Conflict Resolution → Confidence Assignment → Provenance Tracking → Projection Layer → Validation → Final Output**

- **Detect & Parse:** Identifies available sources and extracts raw fields (CSV rows and Regex extraction for Resumes).
- **Normalize:** Formats phones (E.164) and normalizes skill names (aliases & title casing).
- **Merge & Conflict Resolution:** Combines records using length-based and concatenation rules.
- **Confidence & Provenance:** Assigns source and method-based confidence scores and tracks field origins.
- **Projection & Validation:** Reshapes data dynamically via `config.json` rules before validation and output.

## 2. Canonical Output Schema
- **`candidate_id`** (String): Unique UUID for the candidate.
- **`full_name`** (String): Candidate name.
- **`emails`** (Array): Array of string email addresses.
- **`phones`** (Array): Array of string phone numbers (E.164).
- **`location`**, **`links`**, **`headline`**, **`years_experience`**: Present in schema but currently output as `null`.
- **`education`**: Present in schema but always empty `[]` in the current merger.
- **`experience`** (Array): Objects with `company`, `title`, `start`, `end`, and `summary`.
- **`skills`** (Array): Deduplicated objects containing `name`, `confidence`, and `sources`.
- **`provenance`** (Array): Tracks `field`, `source`, and `method` for data origins.
- **`overall_confidence`** (Number): Averaged confidence score across named and skill data points.

## 3. Merge / Conflict Resolution Policy
- **Name Resolution:** The longest non-empty string across sources wins. Defaults to `'Unknown'`.
- **Emails & Phones:** Concatenated from all sources and deduplicated.
- **Skills:** Deduplicated case-insensitively using alias mappings and merged from all sources.
- **Experience:** Prepends current role from CSV, then appends any roles extracted from the Resume.

## 4. Confidence Scoring & Provenance
- **Source Weights:** CSV = `0.9`, Resume = `0.8`, Unknown = `0.5`.
- **Method Modifiers:** Direct Extraction = `+0.05`, Regex Extraction = `-0.1`.
- **Skill Boosting:** If a skill appears in multiple sources, confidence increases by `+0.1` per additional source (max `0.99`).
- **Provenance Tracking:** Records the specific origin (`csv`, `resume`, or `merged`) and method (`direct`, `regex`, or `normalization`) for each canonical field.

## 5. Runtime Configurable Output
The pipeline implements a **Projection Layer** guided by `config.json` that reshapes output dynamically:
- **Field Selection & Mapping:** Selects fields based on configured `path` (using dot/bracket notation) and can remap them using the `from` property.
- **Missing Value Handling:** Configurable `on_missing` strategy supports `'null'` (default), `'omit'` (drop field), or `'error'` (throw exception).
- **Confidence Toggle:** Configurable `include_confidence` appends `overall_confidence` to the projected root when true.

## 6. Edge Cases Addressed
- **Missing CSV:** Caught gracefully; logs a warning and returns an empty array, continuing pipeline.
- **Corrupted PDF:** Parse errors are isolated in a try-catch block, returning `null` instead of crashing.
- **Invalid Phone Number:** `phoneNormalizer` falls back to digit extraction; if unparseable, returns `null` which is safely ignored.
- **Duplicate Skills:** Addressed via `Set`-based tracking and aliasing (e.g., "js" and "java script" map to "JavaScript").
- **Empty Name:** Falls back safely to `'Unknown'`.

## 7. Assumptions
- **Candidate Correlation:** Assumes all inputs provided in a single run relate to exactly one candidate.
- **Schema Validation:** The `config.json` strictly adheres to the projection layer expectations to avoid mapping failures.

## 8. Future Improvements
- Implement parsing and merging logic for `location`, `education`, and `links` fields.
- Expand PDF parsing logic to extract dates and use the existing `dateNormalizer.ts`.
- Integrate an LLM for complex PDF resume extraction to reduce reliance on simple regex patterns.
- Improve cross-file identity resolution (e.g. by email) to support batch processing of multiple candidates.

# Candidate Data Transformer

A pipeline tool to process and merge candidate data from heterogeneous sources like CSV and PDF resumes into a canonical profile.

## Features
- Parses CSV files for recruiter data.
- Parses PDF files to extract basic resume details using regular expressions.
- Normalizes phone numbers (E.164) and skill names.
- Merges data across sources, deduplicating emails, phones, and skills.
- Implements confidence scoring and tracks provenance of extracted fields.
- Provides a projection layer to reshape output dynamically using `config.json`.

## Project Structure
- `src/parsers/`: Logic for extracting data from CSV and PDF files.
- `src/normalizers/`: Formatting functions for phone numbers, skills, dates, and locations.
- `src/merger/`: Contains conflict resolution logic and confidence scoring.
- `src/projection/`: Dynamically maps canonical data to the final output schema based on configuration.
- `samples/`: Sample input files (`recruiter.csv`, `resume.pdf`, `config.json`).
- `tests/`: Unit tests for the pipeline components.

## Installation
```
npm install
```

## Build
```
npm run build
```

## Run
```
npm start -- --csv samples/recruiter.csv --resume samples/resume.pdf --config config/default.json --output samples/output.json
```

## Sample Input
The `samples/` directory contains:
- `recruiter.csv`: Simulated ATS export.
- `resume.pdf`: Simulated candidate resume.
- `config/default.json`: Configuration to reshape the output.

## Sample Output
Running the command above will generate a canonical JSON profile at `samples/output.json`.

## Design Decisions
- **Parser**: Uses `csv-parser` for CSV inputs and `pdf-parse` for text extraction from PDF. Regular expressions are relied upon for PDF data extraction.
- **Normalization**: Utilizes `libphonenumber-js` for robust phone parsing and a custom alias map for standardizing skill names. Date and Location normalizers exist but are not actively used in the current pipeline.
- **Merging**: Assumes inputs in a single run correspond to one candidate. Chooses the longest non-empty name. Merges and deduplicates emails, phones, and skills. Prepends CSV current role to resume experience.
- **Confidence**: Assigns baseline weights by source (`csv`: 0.9, `resume`: 0.8). Modifies these scores based on the extraction method (direct vs. regex). Skills get a confidence boost if found in multiple sources.
- **Projection**: Reads `config.json` to filter fields and handle missing values before writing the final JSON.

## Assumptions
- **Identity Resolution**: We assume that all inputs provided to the script in a single run belong to exactly one candidate.
- **Configuration Validation**: The `config.json` strictly adheres to expected schema properties to prevent mapping errors.

## Future Improvements
- Expand PDF parsing logic to extract dates and map them using the existing `dateNormalizer.ts`.
- Incorporate parsing and merging logic for `location`, `education`, and `links` fields.
- Integrate an LLM for more reliable extraction from unstructured PDF resumes.
- Implement robust candidate identification (e.g., via email matching) to support bulk processing.

## Notes
The current implementation relies on regex for parsing PDF files, which can be fragile and may not reliably extract complex skills or multi-line experience sections from arbitrary resume layouts.

import { Command } from 'commander';
import * as fs from 'fs/promises';
import { parseCsv, parseResume } from './parsers';
import { mergeCandidates } from './merger';
import { projectOutput } from './projection/projectOutput';
import { validateOutput } from './validators/outputValidator';
import { RawCandidateData, ConfigSchema } from './types';

const program = new Command();

program
  .name('candidate-transformer')
  .description('Transforms candidate data from multiple sources into a canonical profile')
  .requiredOption('-c, --csv <path>', 'Path to recruiter CSV')
  .requiredOption('-r, --resume <path>', 'Path to candidate resume PDF')
  .requiredOption('--config <path>', 'Path to projection config JSON')
  .requiredOption('-o, --output <path>', 'Path to save canonical output JSON');

export async function run() {
  program.parse();
  const options = program.opts();

  try {
    // 1. Read config
    const configRaw = await fs.readFile(options.config, 'utf-8');
    const configData = JSON.parse(configRaw);
    const configResult = ConfigSchema.safeParse(configData);
    
    if (!configResult.success) {
      console.error('Invalid configuration format:', configResult.error.errors);
      process.exit(1);
    }
    const config = configResult.data;

    // 2. Parse sources
    const rawCandidates: RawCandidateData[] = [];

    const csvData = await parseCsv(options.csv);
    if (csvData.length > 0) {
      // Assuming 1 row per candidate in this run for simplicity, or we process the first one
      // If batch, we'd need a way to correlate candidates.
      // Assignment implies "produce a single canonical profile" so we assume the inputs relate to ONE candidate.
      rawCandidates.push(csvData[0]); 
    }

    const resumeData = await parseResume(options.resume);
    if (resumeData) {
      rawCandidates.push(resumeData);
    }

    if (rawCandidates.length === 0) {
      console.error('No valid candidate data found from sources.');
      process.exit(1);
    }

    // 3. Merge and resolve conflicts
    const canonical = mergeCandidates(rawCandidates);

    // 4. Validate base canonical structure (optional, but good practice before projection)
    const canonicalValidation = validateOutput(canonical);
    if (!canonicalValidation.valid) {
      console.warn('Warning: Canonical output did not fully match strict schema. Proceeding to projection...', canonicalValidation.errors);
    }

    // 5. Project based on config
    const finalOutput = projectOutput(canonical, config);

    // 6. Write output
    await fs.writeFile(options.output, JSON.stringify(finalOutput, null, 2));
    console.log(`Success! Canonical profile written to ${options.output}`);

  } catch (error: any) {
    console.error(`Pipeline error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}

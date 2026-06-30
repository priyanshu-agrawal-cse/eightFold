import * as fs from 'fs';
import csv from 'csv-parser';
import { RawCandidateData } from '../types';

export async function parseCsv(filePath: string): Promise<RawCandidateData[]> {
  const results: RawCandidateData[] = [];
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      console.warn(`CSV file not found: ${filePath}`);
      return resolve([]);
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        const candidate: RawCandidateData = {
          source: 'csv',
          full_name: data.name || undefined,
          emails: data.email ? [data.email] : undefined,
          phones: data.phone ? [data.phone] : undefined,
          current_company: data.current_company || undefined,
          title: data.title || undefined,
        };
        results.push(candidate);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        console.error(`Error reading CSV: ${error.message}`);
        resolve([]); // Return empty array on error so pipeline doesn't crash
      });
  });
}

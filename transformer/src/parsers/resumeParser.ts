import * as fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import { RawCandidateData } from '../types';

export async function parseResume(filePath: string): Promise<RawCandidateData | null> {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;

    const emails = extractEmails(text);
    const phones = extractPhones(text);
    const skills = extractSkills(text);
    const { full_name } = extractName(text);

    return {
      source: 'resume',
      full_name,
      emails,
      phones,
      skills,
    };
  } catch (error: any) {
    console.warn(`Error parsing PDF resume: ${error.message}`);
    return null; // Return null instead of crashing
  }
}

function extractEmails(text: string): string[] {
  const emailRegex = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex) || [];
  return [...new Set(matches)]; // Deduplicate
}

function extractPhones(text: string): string[] {
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const matches = text.match(phoneRegex) || [];
  return [...new Set(matches)];
}

function extractSkills(text: string): string[] {
  // Simple heuristic: look for a "Skills" section and parse comma separated values
  const skillSectionRegex = /Skills\s*[:\n]\s*([\s\S]*?)(?=\n\n|\n[A-Z][a-z]+:|$)/i;
  const match = text.match(skillSectionRegex);
  if (match && match[1]) {
    const rawSkills = match[1].split(/,|\n/).map(s => s.trim()).filter(s => s.length > 0 && s.length < 30);
    return rawSkills;
  }
  return [];
}

function extractName(text: string): { full_name?: string } {
  // Heuristic: First line of the resume usually contains the name
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length > 0) {
    const nameLine = lines[0];
    if (nameLine.length < 50) {
      return { full_name: nameLine };
    }
  }
  return {};
}

import { v4 as uuidv4 } from 'uuid';
import { CanonicalOutput, RawCandidateData, Provenance, Skill, Experience, Education } from '../types';
import { normalizePhone, normalizeSkill } from '../normalizers';
import { calculateConfidence, boostSkillConfidence } from './confidence';

export function mergeCandidates(rawCandidates: RawCandidateData[]): CanonicalOutput {
  const candidate_id = uuidv4();
  let full_name = '';
  let nameSource = '';
  const emails: string[] = [];
  const phones: string[] = [];
  const skillsMap = new Map<string, { sources: Set<string>; methods: Set<string> }>();
  let experience: Experience[] = [];
  let education: Education[] = [];
  const provenance: Provenance[] = [];

  // Variables to hold candidate data from specific sources for conflict resolution
  const csvData = rawCandidates.find(c => c.source === 'csv');
  const resumeData = rawCandidates.find(c => c.source === 'resume');

  // Conflict Resolution: Name (longer non-empty name wins)
  rawCandidates.forEach(cand => {
    if (cand.full_name && cand.full_name.trim().length > full_name.length) {
      full_name = cand.full_name.trim();
      nameSource = cand.source;
    }
  });
  if (full_name) {
    provenance.push({ field: 'full_name', source: nameSource, method: 'direct' });
  } else {
    full_name = 'Unknown';
  }

  // Emails and Phones (Merge all, deduplicate)
  rawCandidates.forEach(cand => {
    if (cand.emails) {
      cand.emails.forEach(email => {
        if (!emails.includes(email)) {
          emails.push(email);
          provenance.push({ field: `emails[${emails.length - 1}]`, source: cand.source, method: cand.source === 'resume' ? 'regex' : 'direct' });
        }
      });
    }
    if (cand.phones) {
      cand.phones.forEach(phone => {
        const norm = normalizePhone(phone);
        if (norm && !phones.includes(norm)) {
          phones.push(norm);
          provenance.push({ field: `phones[${phones.length - 1}]`, source: cand.source, method: cand.source === 'resume' ? 'regex' : 'direct' });
        }
      });
    }
  });

  // Skills
  rawCandidates.forEach(cand => {
    if (cand.skills) {
      cand.skills.forEach(skill => {
        const norm = normalizeSkill(skill);
        if (!skillsMap.has(norm)) {
          skillsMap.set(norm, { sources: new Set(), methods: new Set() });
        }
        const data = skillsMap.get(norm)!;
        data.sources.add(cand.source);
        data.methods.add(cand.source === 'resume' ? 'regex' : 'direct');
      });
    }
  });

  const skills: Skill[] = Array.from(skillsMap.entries()).map(([name, data]) => {
    const primarySource = Array.from(data.sources)[0];
    const primaryMethod = Array.from(data.methods)[0];
    let conf = calculateConfidence(primarySource, primaryMethod);
    conf = boostSkillConfidence(conf, data.sources.size);
    return {
      name,
      confidence: Number(conf.toFixed(2)),
      sources: Array.from(data.sources),
    };
  });
  if (skills.length > 0) {
    provenance.push({ field: 'skills', source: 'merged', method: 'normalization' });
  }

  // Conflict Resolution: CSV over Resume for recruiter-entered company
  if (csvData?.current_company || csvData?.title) {
    experience.push({
      company: csvData.current_company || '',
      title: csvData.title || '',
      start: null,
      end: null,
      summary: null,
    });
    provenance.push({ field: 'experience[0]', source: 'csv', method: 'direct' });
  }
  // Conflict Resolution: Resume over CSV for experience (we append resume experiences, but if we wanted to fully replace, we could, but let's just use CSV as latest if both exist, or use resume)
  // The assignment says "Resume over CSV for experience" and "CSV over Resume for recruiter-entered company"
  if (resumeData?.experience && resumeData.experience.length > 0) {
    // If we have resume experience, we might want to prioritize it. The assignment says:
    // "Resume over CSV for experience, CSV over Resume for recruiter-entered company"
    // So we keep CSV's recruiter-entered company as maybe a current role, and append resume experience.
    experience = experience.concat(resumeData.experience.map(e => ({
      company: e.company || '',
      title: e.title || '',
      start: e.start || null,
      end: e.end || null,
      summary: e.summary || null,
    })));
    provenance.push({ field: 'experience', source: 'resume', method: 'regex' });
  }

  // Calculate Overall Confidence
  let totalConf = 0;
  let count = 0;
  skills.forEach(s => { totalConf += s.confidence; count++; });
  // Add confidence for name
  if (nameSource) {
    totalConf += calculateConfidence(nameSource, 'direct');
    count++;
  }
  
  const overall_confidence = count > 0 ? Number((totalConf / count).toFixed(2)) : 0.5;

  return {
    candidate_id,
    full_name,
    emails,
    phones,
    location: null, // Could be extracted if we had location in inputs
    links: null,
    headline: null,
    years_experience: null,
    skills,
    experience,
    education,
    provenance,
    overall_confidence,
  };
}

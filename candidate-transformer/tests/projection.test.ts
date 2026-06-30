import { projectOutput } from '../src/projection/projectOutput';
import { CanonicalOutput, Config } from '../src/types';

describe('Projection', () => {
  it('reshapes output based on config', () => {
    const canonical: CanonicalOutput = {
      candidate_id: '123',
      full_name: 'Test Name',
      emails: ['test@test.com'],
      phones: [],
      location: null,
      links: null,
      headline: null,
      years_experience: null,
      skills: [{ name: 'JavaScript', confidence: 0.9, sources: ['csv'] }],
      experience: [],
      education: [],
      provenance: [],
      overall_confidence: 0.95
    };

    const config: Config = {
      fields: [
        { path: 'name', from: 'full_name' },
        { path: 'primary_email', from: 'emails[0]' },
        { path: 'skill_names', from: 'skills[].name' }
      ]
    };

    const result = projectOutput(canonical, config);
    
    expect(result.name).toBe('Test Name');
    expect(result.primary_email).toBe('test@test.com');
    expect(result.skill_names).toEqual(['JavaScript']);
    expect(result.overall_confidence).toBeUndefined(); // include_confidence is false by default
  });
});

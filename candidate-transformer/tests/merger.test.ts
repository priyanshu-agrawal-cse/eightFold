import { mergeCandidates } from '../src/merger';
import { RawCandidateData } from '../src/types';

describe('Merger', () => {
  it('merges candidates and resolves conflicts', () => {
    const raw: RawCandidateData[] = [
      {
        source: 'csv',
        full_name: 'John Doe',
        emails: ['john@test.com'],
        phones: ['9876543210'],
        current_company: 'CSV Corp'
      },
      {
        source: 'resume',
        full_name: 'John Jonathan Doe',
        emails: ['john2@test.com'],
        skills: ['js', 'Python'],
        experience: [{ company: 'Resume Corp', title: 'Eng' }]
      }
    ];

    const result = mergeCandidates(raw);

    // Longer name wins
    expect(result.full_name).toBe('John Jonathan Doe');
    
    // Emails merged
    expect(result.emails).toContain('john@test.com');
    expect(result.emails).toContain('john2@test.com');

    // CSV current_company prioritized
    expect(result.experience[0].company).toBe('CSV Corp');
    
    // Skills normalized
    expect(result.skills[0].name).toBe('JavaScript');
  });
});

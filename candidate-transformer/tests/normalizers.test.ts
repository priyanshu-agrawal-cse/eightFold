import { normalizePhone, normalizeDate, normalizeSkill, normalizeCountry } from '../src/normalizers';

describe('Normalizers', () => {
  describe('normalizePhone', () => {
    it('normalizes 10 digit numbers', () => {
      expect(normalizePhone('9876543210')).toBe('+19876543210');
    });
    it('handles already normalized', () => {
      expect(normalizePhone('+919876543210')).toBe('+919876543210');
    });
    it('handles formatting', () => {
      expect(normalizePhone('(987) 654-3210')).toBe('+19876543210');
    });
  });

  describe('normalizeDate', () => {
    it('normalizes month year format', () => {
      expect(normalizeDate('Jan 2022')).toBe('2022-01');
    });
    it('handles ISO format', () => {
      expect(normalizeDate('2022-01-15')).toBe('2022-01');
    });
  });

  describe('normalizeSkill', () => {
    it('resolves aliases', () => {
      expect(normalizeSkill('js')).toBe('JavaScript');
      expect(normalizeSkill('java script')).toBe('JavaScript');
    });
    it('title cases unknown skills', () => {
      expect(normalizeSkill('my obscure skill')).toBe('My Obscure Skill');
    });
  });
});

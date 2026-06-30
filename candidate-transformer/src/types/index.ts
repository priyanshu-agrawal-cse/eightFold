import { z } from 'zod';

// Config schemas
export const FieldConfigSchema = z.object({
  path: z.string(),
  from: z.string().optional(),
  type: z.string().optional(),
  required: z.boolean().optional(),
  normalize: z.string().optional(),
});

export const ConfigSchema = z.object({
  fields: z.array(FieldConfigSchema),
  include_confidence: z.boolean().optional(),
  on_missing: z.enum(['null', 'omit', 'error']).optional(),
});

export type Config = z.infer<typeof ConfigSchema>;
export type FieldConfig = z.infer<typeof FieldConfigSchema>;

// Output Schemas
export const ProvenanceSchema = z.object({
  field: z.string(),
  source: z.string(),
  method: z.string(),
});

export const SkillSchema = z.object({
  name: z.string(),
  confidence: z.number(),
  sources: z.array(z.string()),
});

export const ExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  start: z.string().nullable(),
  end: z.string().nullable(),
  summary: z.string().nullable(),
});

export const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string().nullable(),
  field: z.string().nullable(),
  end_year: z.number().nullable(),
});

export const LocationSchema = z.object({
  city: z.string().nullable(),
  region: z.string().nullable(),
  country: z.string().nullable(),
});

export const LinksSchema = z.object({
  linkedin: z.string().nullable(),
  github: z.string().nullable(),
  portfolio: z.string().nullable(),
  other: z.array(z.string()).nullable(),
});

export const CanonicalOutputSchema = z.object({
  candidate_id: z.string(),
  full_name: z.string(),
  emails: z.array(z.string()),
  phones: z.array(z.string()),
  location: LocationSchema.nullable(),
  links: LinksSchema.nullable(),
  headline: z.string().nullable(),
  years_experience: z.number().nullable(),
  skills: z.array(SkillSchema),
  experience: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  provenance: z.array(ProvenanceSchema),
  overall_confidence: z.number(),
});

export type CanonicalOutput = z.infer<typeof CanonicalOutputSchema>;
export type Provenance = z.infer<typeof ProvenanceSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Links = z.infer<typeof LinksSchema>;

// Intermediate Raw Schemas (parsed but not merged)
export interface RawCandidateData {
  source: string;
  candidate_id?: string;
  full_name?: string;
  emails?: string[];
  phones?: string[];
  location?: Partial<Location>;
  links?: Partial<Links>;
  headline?: string;
  skills?: string[];
  experience?: Array<Partial<Experience>>;
  education?: Array<Partial<Education>>;
  current_company?: string;
  title?: string;
}

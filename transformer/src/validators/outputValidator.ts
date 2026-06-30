import { CanonicalOutputSchema } from '../types';

export function validateOutput(output: any): { valid: boolean; errors?: any } {
  const result = CanonicalOutputSchema.safeParse(output);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors,
    };
  }
  return { valid: true };
}

import { CanonicalOutput, Config } from '../types';

function get(obj: any, path: string): any {
  if (!path) return undefined;
  // Handle array maps like skills[].name
  if (path.includes('[]')) {
    const parts = path.split('[]');
    const arrPath = parts[0];
    const restPath = parts[1].replace(/^\./, '');
    const arr = get(obj, arrPath);
    if (Array.isArray(arr)) {
      return arr.map(item => restPath ? get(item, restPath) : item);
    }
    return undefined;
  }
  
  // Standard dot notation & array indexing like emails[0]
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let result = obj;
  for (const key of keys) {
    if (result === null || result === undefined) return undefined;
    result = result[key];
  }
  return result;
}

export function projectOutput(canonical: CanonicalOutput, config: Config): any {
  const projected: any = {};
  const onMissing = config.on_missing || 'null';

  for (const field of config.fields) {
    const sourcePath = field.from || field.path;
    let value = get(canonical, sourcePath);

    if (value === undefined || value === null) {
      if (onMissing === 'error') {
        throw new Error(`Missing required field: ${sourcePath}`);
      } else if (onMissing === 'omit') {
        continue;
      } else {
        value = null;
      }
    }
    
    // Set the value in the projected object (only supporting 1 level deep for now for simplicity, or dot notation)
    const destKeys = field.path.split('.');
    let current = projected;
    for (let i = 0; i < destKeys.length - 1; i++) {
      if (!current[destKeys[i]]) current[destKeys[i]] = {};
      current = current[destKeys[i]];
    }
    current[destKeys[destKeys.length - 1]] = value;
  }

  if (config.include_confidence) {
    projected.overall_confidence = canonical.overall_confidence;
  }

  // Handle provenance manually if needed, or if it's in config it will be picked.

  return projected;
}

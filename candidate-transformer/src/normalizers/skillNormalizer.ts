const SKILL_ALIASES: Record<string, string> = {
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'java script': 'JavaScript',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',
  'node': 'Node.js',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'react': 'React',
  'react.js': 'React',
  'reactjs': 'React',
  'python': 'Python',
  'py': 'Python',
  'go': 'Go',
  'golang': 'Go',
  'aws': 'AWS',
  'amazon web services': 'AWS'
};

export function normalizeSkill(skill: string): string {
  const clean = skill.trim().toLowerCase();
  if (SKILL_ALIASES[clean]) {
    return SKILL_ALIASES[clean];
  }
  // Title case the skill if no alias is found
  return skill.trim().replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

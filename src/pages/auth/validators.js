export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const passwordProblems = (pw) => {
  const out = [];
  if (pw.length < 8) out.push('at least 8 characters');
  if (!/[a-z]/.test(pw)) out.push('a lowercase letter');
  if (!/[A-Z]/.test(pw)) out.push('an uppercase letter');
  if (!/\d/.test(pw)) out.push('a number');
  return out;
};

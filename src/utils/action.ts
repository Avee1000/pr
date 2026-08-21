export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) return 'your email';
  
  const visiblePart = name.slice(0, 2);
  const maskedName = visiblePart + '*'.repeat(Math.max(1, name.length - 2));
  
  return `${maskedName}@${domain}`;
}

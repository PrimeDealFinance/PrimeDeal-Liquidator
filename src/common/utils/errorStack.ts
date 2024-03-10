export function extractErrorLocation(stack: string): string {
  const stackLines = stack.split('\n');
  if (stackLines.length > 1) {
    const errorLocation = stackLines[1];
    return errorLocation.trim();
  }
  return '';
}

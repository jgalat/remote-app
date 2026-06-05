export function count(pieces: string) {
  const bytes = Uint8Array.from(atob(pieces), (c) => c.charCodeAt(0));
  let count = 0;
  for (const byte of bytes) {
    let b = byte;
    while (b) {
      b &= b - 1;
      count++;
    }
  }
  return count;
}

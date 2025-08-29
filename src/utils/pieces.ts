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

export function decode(base64Pieces: string, count: number): Uint8Array {
  const bytes = Uint8Array.from(atob(base64Pieces), (c) => c.charCodeAt(0));
  const bitsNeeded = Math.ceil(count / 8);
  return bytes.slice(0, bitsNeeded);
}

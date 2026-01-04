export function getRpcUrl(chain: string): string {
  const key = `RPC_${chain.toUpperCase()}`;
  const url = process.env[key];
  if (!url) throw new Error(`Missing env ${key}`);
  return url;
}

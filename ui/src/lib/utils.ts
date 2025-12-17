export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

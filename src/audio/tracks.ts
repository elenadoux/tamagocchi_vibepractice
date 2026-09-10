export type Track = { id: string; title: string; artist: string; src: string };
const files = import.meta.glob('../../tracks/*.{mp3,wav,ogg,m4a,flac}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
export const tracks: Track[] = Object.entries(files).sort(([a], [b]) => a.localeCompare(b)).map(([path, src]) => {
  const name = path.split('/').pop()!.replace(/\.[^.]+$/, '');
  const [artist, ...title] = name.split(' - ');
  return { id: name, artist: title.length ? artist : 'Local collection', title: title.length ? title.join(' - ') : name, src };
});

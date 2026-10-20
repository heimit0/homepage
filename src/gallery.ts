// Load every image in content/gallery/ as a URL at build time.
const modules = import.meta.glob(
  '../content/gallery/*.{png,jpg,jpeg,gif,webp,avif,svg}',
  {
    query: '?url',
    import: 'default',
    eager: true,
  },
) as Record<string, string>

export interface GalleryImage {
  src: string
  alt: string
  name: string
}

export const galleryImages: GalleryImage[] = Object.entries(modules)
  .map(([path, src]) => {
    const name = path.split('/').pop()!
    const base = name.replace(/\.[^.]+$/, '')
    return {
      src,
      alt: base.replace(/[-_]/g, ' '),
      name,
    }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

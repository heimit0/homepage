// All site copy and links live here. Edit this one file to change what the
// site says — no need to touch the markup.

export interface SiteLink {
  label: string
  href: string
}

export interface SiteConfig {
  name: string
  domain: string
  splash: string
  links: SiteLink[]
}

export const site: SiteConfig = {
  name: 'heimito',
  domain: 'heimito.dev',
  splash: '~>...',
  links: [
    { label: 'GitHub', href: 'https://github.com/heimit0' },
    { label: 'Email', href: 'mailto:me@heimito.dev' },
  ],
}

import MarkdownIt from 'markdown-it'

// Load every .md file in content/posts/ as raw text at build time.
const modules = import.meta.glob('../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export interface Post {
  slug: string
  title: string
  /** ISO date string, e.g. "2026-10-20" */
  date: string
  description: string
  html: string
}

interface Frontmatter {
  title?: string
  date?: string
  description?: string
  [key: string]: string | undefined
}

// Minimal `key: value` frontmatter parser — no YAML/Node dependency. It handles
// the small, well-defined header this blog needs, and keeps values as plain
// strings so dates are never mangled into Date objects.
function parseFrontmatter(raw: string): { data: Frontmatter; content: string } {
  const data: Frontmatter = {}
  let content = raw
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (match) {
    content = raw.slice(match[0].length)
    for (const line of match[1].split(/\r?\n/)) {
      const idx = line.indexOf(':')
      if (idx === -1) continue
      const key = line.slice(0, idx).trim()
      let value = line.slice(idx + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (key) data[key] = value
    }
  }
  return { data, content }
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const posts: Post[] = Object.entries(modules)
  .map(([filePath, raw]) => {
    const slug = filePath.split('/').pop()!.replace(/\.md$/, '')
    const { data, content } = parseFrontmatter(raw)
    return {
      slug,
      title: data.title ?? slug,
      date: data.date ?? '',
      description: data.description ?? '',
      html: md.render(content),
    }
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1))

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug)
}

export function formatDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${MONTHS[m - 1]} ${d}, ${y}`
}

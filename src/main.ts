import './style.css'
import { site } from './content'
import { posts, getPost, formatDate } from './posts'
import { galleryImages } from './gallery'

type Route =
  | { name: 'home' }
  | { name: 'blog' }
  | { name: 'post'; slug: string }
  | { name: 'gallery' }
  | { name: 'notfound' }

const app = document.querySelector<HTMLDivElement>('#app')!

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ESCAPES[c])
}

function parseRoute(pathname: string): Route {
  if (pathname === '/' || pathname === '') return { name: 'home' }
  if (pathname === '/blog' || pathname === '/blog/') return { name: 'blog' }
  if (pathname === '/gallery' || pathname === '/gallery/') {
    return { name: 'gallery' }
  }
  const match = pathname.match(/^\/blog\/([^/]+)\/?$/)
  if (match) return { name: 'post', slug: decodeURIComponent(match[1]) }
  return { name: 'notfound' }
}

function layout(content: string, mainClass: string): string {
  const year = new Date().getFullYear()
  const footerLinks = site.links
    .map((link) => {
      const rel = link.href.startsWith('http') ? ' rel="noopener noreferrer"' : ''
      return `<a href="${link.href}"${rel}>${escapeHtml(link.label)}</a>`
    })
    .join('')
  const blogActive = location.pathname.startsWith('/blog')
    ? ' aria-current="page"'
    : ''
  const galleryActive = location.pathname.startsWith('/gallery')
    ? ' aria-current="page"'
    : ''

  return `
    <div class="page">
      <header class="site-header">
        <a class="wordmark" href="/">${escapeHtml(site.domain)}</a>
        <nav class="site-nav" aria-label="Site">
          <a href="/blog"${blogActive}>Blog</a>
          <a href="/gallery"${galleryActive}>Gallery</a>
        </nav>
      </header>
      <main class="${mainClass}">${content}</main>
      <footer class="site-footer">
        <nav class="links" aria-label="Links">${footerLinks}</nav>
        <span class="copy">&copy; ${year} ${escapeHtml(site.name)}</span>
      </footer>
    </div>
  `
}

function renderHome() {
  document.title = site.domain
  app.innerHTML = layout(
    `<h1 class="splash">${escapeHtml(site.splash)}</h1>`,
    'hero',
  )
}

function renderBlog() {
  document.title = `Blog — ${site.domain}`
  const items = posts
    .map((post) => {
      const meta = [formatDate(post.date), post.description]
        .filter(Boolean)
        .join(' · ')
      return `
        <a class="post-link" href="/blog/${encodeURIComponent(post.slug)}">
          <span class="post-title">${escapeHtml(post.title)}</span>
          ${meta ? `<span class="post-meta">${escapeHtml(meta)}</span>` : ''}
        </a>
      `
    })
    .join('')
  app.innerHTML = layout(
    `
      <h1 class="page-title">Blog</h1>
      <div class="post-list">${items || '<p class="blurb">No posts yet.</p>'}</div>
    `,
    'content',
  )
}

function renderPost(slug: string) {
  const post = getPost(slug)
  if (!post) {
    renderNotFound()
    return
  }
  document.title = `${post.title} — ${site.domain}`
  app.innerHTML = layout(
    `
      <article class="post">
        <a class="back-link" href="/blog">← Blog</a>
        <h1 class="post-title-heading">${escapeHtml(post.title)}</h1>
        <time class="post-date" datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time>
        <div class="prose">${post.html}</div>
      </article>
    `,
    'content',
  )
}

function renderGallery() {
  document.title = `Gallery — ${site.domain}`
  const items = galleryImages
    .map(
      (image) => `
        <button class="gallery-item" type="button" data-src="${image.src}" aria-label="View ${escapeHtml(image.alt)}">
          <img src="${image.src}" alt="${escapeHtml(image.alt)}" loading="lazy" />
        </button>
      `,
    )
    .join('')
  app.innerHTML = layout(
    `
      <h1 class="page-title">Gallery</h1>
      ${
        items
          ? `<div class="gallery">${items}</div>`
          : '<p class="blurb">No images yet. Add files to <code>content/gallery/</code>.</p>'
      }
    `,
    'content',
  )
}

function renderNotFound() {
  document.title = `Not found — ${site.domain}`
  app.innerHTML = layout(
    `
      <h1 class="page-title">404</h1>
      <p class="blurb">This page doesn’t exist.</p>
      <p><a class="back-link" href="/">← Home</a></p>
    `,
    'content',
  )
}

function render() {
  const route = parseRoute(location.pathname)
  switch (route.name) {
    case 'home':
      renderHome()
      break
    case 'blog':
      renderBlog()
      break
    case 'post':
      renderPost(route.slug)
      break
    case 'gallery':
      renderGallery()
      break
    default:
      renderNotFound()
  }
}

// Lightbox overlay for the gallery.
let lightbox: HTMLDivElement | null = null

function openLightbox(src: string, alt: string) {
  if (!lightbox) {
    lightbox = document.createElement('div')
    lightbox.className = 'lightbox'
    lightbox.setAttribute('role', 'dialog')
    lightbox.setAttribute('aria-modal', 'true')
    lightbox.innerHTML = '<img src="" alt="" />'
    document.body.appendChild(lightbox)
  }
  const image = lightbox.querySelector('img')!
  image.src = src
  image.alt = alt
  lightbox.classList.add('open')
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  if (!lightbox) return
  lightbox.classList.remove('open')
  document.body.style.overflow = ''
}

document.addEventListener('click', (event) => {
  const galleryItem = (event.target as HTMLElement).closest('.gallery-item')
  if (galleryItem) {
    const src = galleryItem.getAttribute('data-src')
    if (src) openLightbox(src, galleryItem.querySelector('img')?.alt ?? '')
    return
  }

  if ((event.target as HTMLElement).closest('.lightbox')) {
    closeLightbox()
    return
  }

  const anchor = (event.target as HTMLElement).closest('a')
  if (!anchor) return
  const href = anchor.getAttribute('href')
  if (!href) return
  const url = new URL(href, location.origin)
  if (url.origin !== location.origin) return
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  if (anchor.target && anchor.target !== '_self') return
  event.preventDefault()
  history.pushState({}, '', url.pathname + url.search + url.hash)
  render()
  window.scrollTo(0, 0)
})

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeLightbox()
})

window.addEventListener('popstate', render)

render()

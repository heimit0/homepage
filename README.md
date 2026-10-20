# heimito.dev

A minimal personal landing page with a Markdown-powered blog. Vite + TypeScript,
served by nginx in a multi-stage Docker image.

## Develop

```sh
npm install
npm run dev        # http://localhost:5173
```

## Build

```sh
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build locally
```

## Run with Docker

```sh
docker compose up --build      # http://localhost:8081
```

or without compose:

```sh
docker build -t heimito-homepage .
docker run --rm -p 8081:80 heimito-homepage
```

## Content

All site copy and links live in [`src/content.ts`](src/content.ts).

## Blog

Drop Markdown files into [`content/posts/`](content/posts/). Each file needs a
small frontmatter block:

```md
---
title: My post
date: 2026-10-20
description: One-line summary shown on the blog index.
---

Post body in **Markdown**.
```

- `title` and `date` are required (the index sorts by `date`, newest first).
- `description` is optional and shown on the index.
- The filename (without `.md`) becomes the URL slug — e.g.
  `content/posts/my-post.md` is served at `/blog/my-post`.

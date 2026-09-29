---
title: 'Reliable Content with Astro and Zod'
description: 'How a small Zod schema can make Markdown content safer to write, easier to query, and more dependable to publish.'
pubDate: '2026-09-29'
author: 'jane-doe'
---

Markdown makes it easy to write a blog post, but a collection becomes much more useful when every entry follows a predictable shape. Astro content collections let us describe that shape with Zod and validate it whenever content is loaded.

## Start with the fields every post needs

A post needs a title, an author, and a publication date. In Astro, a collection schema can express those requirements directly:

```ts
schema: z.object({
	title: z.string(),
	author: reference('authors'),
	pubDate: z.coerce.date(),
})
```

The author field is a reference to an entry in the authors collection. In this post's frontmatter, `author: 'jane-doe'` points to the existing Jane Doe profile. Astro validates that reference instead of leaving it as an unchecked string.

## Keep frontmatter readable

The matching Markdown frontmatter stays small and familiar:

```yaml
title: 'Reliable Content with Astro and Zod'
pubDate: '2026-09-29'
author: 'jane-doe'
```

This project also uses a description for page metadata, while fields such as the hero image and updated date are optional. Those extra fields can grow with the site without changing the three essentials every post needs.

## Let validation catch mistakes early

If a title is missing, a date cannot be parsed, or an author ID does not exist, Astro reports the problem during its content check. That moves errors closer to the file being edited and keeps templates from having to guess what data they will receive.

Schemas are most helpful when they describe real content needs rather than every possible future field. Start with the essentials, add optional metadata when the site uses it, and keep each Markdown entry easy to review.
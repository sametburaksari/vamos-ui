---
"@vamos-ui/react": minor
---

Block definitions for the news and commerce blocks (`blocks/site/registry-news.ts`): `news-masthead`, `featured-posts`, `post-card`, `post-block`, `post-tabs`, `news-ticker`, `ad-slot`, `news-columns` (main / sidebar slots), `popular-posts`, `recent-comments`, `category-counts`, `follow-counts`, `product-grid` and `review-score`. Each has a zod schema, previews, block lint and JSON-LD through the renderer, so a news front page or a shop grid can be stored and rendered as JSON. Combine with the other site registries: `createRegistry([...siteBlocks1, ...siteBlocks2, ...newsBlocks])`.

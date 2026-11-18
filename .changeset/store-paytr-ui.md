---
"@vamos-ui/react": minor
---

commerce: PayTR checkout (`createPaytrCheckout`: start + server-to-server notification answered "OK", hash and amount checked, notify once per order) and server-side order storage (`OrderStore` with `memoryOrderStore`, `cloudflareKvOrderStore`, `upstashOrderStore`; `markPaid` idempotency guard). `PaidOrder.provider` can be "paytr".

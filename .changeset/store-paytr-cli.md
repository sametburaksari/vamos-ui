---
"vamos-ui": minor
---

`site store --provider paytr` writes the PayTR checkout (store/checkout.ts, /api/checkout and /api/checkout/paytr-notify) for the next and edge runtimes, with orders in a KV binding (ORDERS) or Upstash Redis. `--runtime`, `--currency` and `--provider` now take a separate value (`--runtime next`), not only `--runtime=next`.

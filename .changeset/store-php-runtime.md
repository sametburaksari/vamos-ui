---
"vamos-ui": minor
---

`site store` now works on shared hosting: a static export on cPanel (or any Apache with PHP 8.1+, via `--runtime php`) gets a PHP checkout with the same prices, cart checks, signed order cookie and iyzico signature checks as the Node and edge runtimes. Products live in one `catalog.json` that both the cart and the server read, the payment keys stay in a config file outside the web root, and each paid order is emailed once through the host's mail (plus the optional signed webhook). Discount codes are not supported by the PHP checkout yet. `--runtime` and `--currency` are now read correctly as options.

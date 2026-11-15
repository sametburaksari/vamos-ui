---
"vamos-ui": minor
---

The CLI works without network access. The package now carries a copy of the whole Vamos UI registry (`snapshot/registry.json.br`, about 2.5 MB, built with the CLI), and `add`, `list`, `search`, `view`, `init`, `create`, `diff` and `upgrade` use it when `https://ui.vamos.ist/r` cannot be reached: no answer within 5 s (`VAMOS_REGISTRY_TIMEOUT`, ms), a failed connection, or a proxy answering instead. One line says which copy was used (`using the bundled registry (v0.4.3, built 2026-11-15)`; on stderr with `--json`). `--offline` or `VAMOS_OFFLINE=1` skips the network for the registry entirely and refuses items from URLs and `github:`. An explicit `--registry`, `VAMOS_REGISTRY` or a non-default `registry` in `vamos.json` is used as before and never falls back. `vamos-ui registry export <dir>` writes the bundled copy (the same files the site serves) to a folder for a team to host or vendor, and `vamos-ui registry info` prints its version and build date.

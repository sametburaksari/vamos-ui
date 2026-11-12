# Contributing

Thanks for helping. Two rules before the code ones:

1. **Sign off every commit (DCO).** By adding `Signed-off-by: Your Name <you@example.com>` (`git commit -s`) you certify the [Developer Certificate of Origin](https://developercertificate.org/): you wrote the change or have the right to submit it under the license of the folder you are changing.
2. **Contributions are licensed like the folder they land in** — MIT for `packages/ui` and `apps/www`, FSL-1.1-ALv2 for `apps/admin`. See [LICENSE.md](LICENSE.md).

## Code rules
- Components read semantic tokens only. No raw colours, no `dark:`.
- Group by what a component is, not by domain.
- Every built-in string comes from the locale dictionary (English first).
- Every component ships with a docs page: preview, code, install, examples, props.

## Changes and releases

- If users of `@vamos-ui/react`, `vamos-ui` or `@vamos-ui/mcp` will notice your change, add a
  changeset: `pnpm changeset` (pick the packages, patch / minor / major, one plain sentence).
  The sentence goes into that package's CHANGELOG.md and the docs changelog page.
- Don't edit versions, CHANGELOG.md or the version constants by hand. Releases run from GitHub
  Actions (see `.changeset/README.md`): a "Version packages" pull request, then publishing with
  provenance, a git tag (`<package>@<version>`) and a GitHub release per package.
- `pnpm release:check` builds and packs every package, installs the tarballs with npm in an
  empty folder and smoke-tests them. CI runs it on every push.

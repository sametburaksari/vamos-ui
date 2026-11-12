# Changesets

Every change that users of a published package will notice comes with a changeset:

```bash
pnpm changeset            # pick the packages, the bump (patch / minor / major) and write one line
```

Write the line for the people who use the package: what they can do now or what was broken,
in plain words, no internal file names. Several changesets may go into one release.

Releasing is done by GitHub Actions (`.github/workflows/release.yml`):

1. Changesets on `main` open a "Version packages" pull request. It bumps the versions, writes
   each package's CHANGELOG.md (dated) and syncs the version constants in the code.
2. Merging that pull request builds and packs every package, installs the tarballs with plain
   npm in an empty folder and smoke-tests them, then publishes the versions that are not on npm
   yet with provenance (npm trusted publishing, no token), and creates a git tag and a GitHub
   release per package.

Locally the same steps are `pnpm release:version` and `pnpm release:check`.

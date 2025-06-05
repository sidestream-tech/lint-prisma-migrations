# Lint Prisma migrations action

**Lint Prisma migrations** is a github action that can lint the names of your [Prisma Migrations](https://www.prisma.io/docs/orm/prisma-migrate) based on a set of rules. The action was originally developed for [SIDESTREAM](https://github.com/sidestream-tech/).

## Rules

This action currently supports the following rules:
- `format`: The name of the migration folder matches [`YYYYMMDDHHMMSS_YOUR_MIGRATION_NAME`](https://regex101.com/r/GoZmJG/1)
- `date`: The date specified inside the migration name is not in the future
- `missing`: The migration folder contains a `migration.sql` file
- `link`: The migration begins with a link to the PR it was added it: `-- https://github.com/ORG/REPO/pull/NUMBER`
- `transaction`: The migration is wrapped with a `BEGIN;` and `COMMIT;` [transaction block](https://www.postgresql.org/docs/current/tutorial-transactions.html)

## Configuration

```yml
jobs:
  check-migrations-folder:
    runs-on:
      group: ubuntu-large-4CPU-16RAM

    steps:
      - uses: actions/checkout@v4
      - name: Validate prisma migration folder names
        uses: sidestream-tech/lint-prisma-migrations@1.1.0
        with:
          path: ./prisma/migrations/
          rules: |
            format
            date
            missing
            link
            transaction
          ignore: |
            20260101000000_ignore_me
            20270101000000_ignore_me_too
```

### `path`

The path to the Prisma migrations folder.

### `ignore`

A multiline input of migration names to ignore. Helpful if these were already applied and their naming cannot be fixed.

### `rules`

A multiline input of the rules you would like to run again your migrations. If not set all rules with be enabled by default.

## Development

```sh
# Install dependencies
pnpm install

# Run unit tests
pnpm test

# Build the project
pnpm build

# Package the build (run after `pnpm build`)
pnpm package
```

## Credits

This action was inspired by https://github.com/batista/lint-filenames

# Lint Prisma migrations action

A GitHub Action that lints [Prisma Migrations](https://www.prisma.io/docs/orm/prisma-migrate) and/or flat-key i18n JSON files. Originally developed for [SIDESTREAM](https://github.com/sidestream-tech/).

## Prisma Migrations Rules

- `format`: The name of the migration folder matches [`YYYYMMDDHHMMSS_YOUR_MIGRATION_NAME`](https://regex101.com/r/GoZmJG/1)
- `date`: The date specified inside the migration name is not in the future
- `missing`: The migration folder contains a `migration.sql` file
- `link`: The migration begins with a link to the PR it was added in: `-- https://github.com/ORG/REPO/pull/NUMBER`
- `transaction`: The migration is wrapped with a `BEGIN;` and `COMMIT;` [transaction block](https://www.postgresql.org/docs/current/tutorial-transactions.html)

## i18n Rules

- **Namespace conflicts**: Detects keys that are both a leaf value and a namespace prefix (e.g., `"expand"` and `"expand.all"`)
- **Invalid value types**: Ensures all values in locale JSON files are strings (rejects numbers, booleans, arrays, null)

## Configuration

### Prisma migrations only

```yml
steps:
  - uses: actions/checkout@v4
  - name: Lint Prisma migrations
    uses: sidestream-tech/lint-prisma-migrations@3.0.0
    with:
      prisma-migrations-path: ./prisma/migrations/
      prisma-migrations-rules: |
        format
        date
        missing
        link
        transaction
      prisma-migrations-ignore: |
        20260101000000_ignore_me
```

### i18n only

```yml
steps:
  - uses: actions/checkout@v4
  - name: Lint i18n files
    uses: sidestream-tech/lint-prisma-migrations@3.0.0
    with:
      i18n-path: src/locales
```

### Both linters

```yml
steps:
  - uses: actions/checkout@v4
  - name: Lint migrations and i18n
    uses: sidestream-tech/lint-prisma-migrations@3.0.0
    with:
      prisma-migrations-path: ./prisma/migrations/
      i18n-path: src/locales
```

## Inputs

| Input | Required | Description |
|---|---|---|
| `prisma-migrations-path` | No | Path to the Prisma migrations directory |
| `prisma-migrations-ignore` | No | Migration names to ignore (multiline) |
| `prisma-migrations-rules` | No | Rules to enable (multiline). Default: all |
| `i18n-path` | No | Path to the i18n directory containing locale JSON files |

At least one of `prisma-migrations-path` or `i18n-path` must be provided.

## Outputs

| Output | Description |
|---|---|
| `prisma-migrations-files-analyzed` | Number of Prisma migration files analyzed |
| `i18n-files-analyzed` | Number of i18n JSON files analyzed |

## Migration from v2

v3 renames the inputs to support both linters:

| v2 | v3 |
|---|---|
| `path` | `prisma-migrations-path` |
| `ignore` | `prisma-migrations-ignore` |
| `rules` | `prisma-migrations-rules` |

## Development

```sh
pnpm install
pnpm test
pnpm build
pnpm package
```

## Credits

This action was inspired by https://github.com/batista/lint-filenames

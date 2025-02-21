# Lint Prisma migrations action

**Lint Prisma migrations** is a github action that can lint the names of your [Prisma Migrations](https://www.prisma.io/docs/orm/prisma-migrate) based on a set of rules. The action was originally developed for [SIDESTREAM](https://github.com/sidestream-tech/).

The action checks that:
- The name matches the format of `YYYYMMDDHHMMSS_YOUR_MIGRATION_NAME`
- The date specified inside the migration name is not in the future

## Example

```yml
jobs:
  check-migrations-folder:
    runs-on:
      group: ubuntu-large-4CPU-16RAM

    steps:
      - uses: actions/checkout@v4
      - name: Validate prisma migration folder names
        uses: zoey-kaiser/migrations-folder-linter@0.2.0
        with:
          path: ./prisma/migrations/
          ignore: |
            20260101000000_ignore_me
            20270101000000_ignore_me_too
```

## Inputs

### `path`

The path to the Prisma migrations folder.

### `ignore`

A multiline input of migration names to ignore. Helpful if these were already applied and their naming cannot be fixed.

## Credits

This action was developed by [Zoey Kaiser](https://github.com/zoey-kaiser) and was based on https://github.com/batista/lint-filenames

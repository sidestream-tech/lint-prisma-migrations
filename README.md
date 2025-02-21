## Migrations Folder Linter

This github action validates if the prisma migration folders follow a set naming structure

### Example

```yml
jobs:
  check-migrations-folder:
    runs-on:
      group: ubuntu-large-4CPU-16RAM

    steps:
      - uses: actions/checkout@v4
      - name: Validate prisma migration folder names
        uses: zoey-kaiser/migrations-folder-linter@0.1.0
        with:
          path: ./prisma/migrations/
          ignore: |
            20260101000000_ignore_me
            20270101000000_ignore_me_too
```

### Inputs

#### `path`

The path to the Prisma migrations folder.

#### `ignore`

A multiline input of migration names to ignore. Helpful if these were already applied and their naming cannot be fixed.

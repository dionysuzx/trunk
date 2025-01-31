# lint js
lint-js:
  pnpm -r format-lint

# lint and fix js
lint-js-fix:
  pnpm -r format-lint:fix

# update all toolchains and dependencies
update:
  pnpm self-update
  pnpm up -r

# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [2.0.0] - 2025-10-16
### Added
- First-class TypeScript definitions (`index.d.ts`) for the full public API:
  - `createDataContext`, `parse`, `stringify`, `syncData`, `stringifyChanges`, event APIs, and helpers.
  - Strongly-typed `DataContext<T>` with recursive typing for objects and arrays.
  - `ChangeEvent`, `StringifyOptions`, `WatchJsonFileOptions`, and `JSONReplacer` types.
- `stringify` option `includeBOM` to prefix output with BOM when needed.
- `ignoreMetadata` toggle exposed as a public property to include/exclude metadata comments globally.
- Node helper `watchJsonFile` type surfaced (returns an opaque handle to avoid forcing Node types).

### Changed
- Stabilized public API surface and clarified event contract:
  - Property events: `new`, `set`, `reposition`, `delete`
  - Aggregate events: `-` (bubbled) and `-change` (debounced)
- Improved docs and JSDoc within code to reflect v2 behavior.

### Fixed
- Consistent handling of non-enumerable metadata keys during parse/stringify.
- Safer overwriting semantics when parsing into an existing DataContext.

### Migration notes
- No breaking API changes are intended versus 1.x. If you relied on undocumented internals, prefer the public methods and properties reflected in the new typings.
- `watchJsonFile` is Node-only; in browser environments it is a no-op and typings reflect an opaque return value.

[2.0.0]: https://github.com/your-repo/data-context/releases/tag/v2.0.0
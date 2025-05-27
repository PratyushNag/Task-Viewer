# Unused Files to Remove

This document lists files that can be safely removed from the project to reduce the build size and improve maintainability.

## Duplicate Configuration Files

| File | Reason for Removal | Keep Instead |
|------|-------------------|-------------|
| `next.config.ts` | Duplicate configuration file | `next.config.js` |
| `temp-project/next.config.ts` | Duplicate in temp directory | N/A |
| `eslint.config.mjs` (if `.eslintrc.json` exists) | Duplicate ESLint config | Keep only one ESLint config |
| `temp-project/eslint.config.mjs` | Duplicate in temp directory | N/A |

## Duplicate Project Files

| File | Reason for Removal | Keep Instead |
|------|-------------------|-------------|
| `temp-project/README.md` | Duplicate README | `README.md` |
| `temp-project/package.json` | Duplicate package.json | `package.json` |
| `temp-project/package-lock.json` | Duplicate lock file | `package-lock.json` |
| `temp-project/tsconfig.json` | Duplicate TypeScript config | `tsconfig.json` |
| `temp-project/postcss.config.mjs` | Duplicate PostCSS config | `postcss.config.mjs` |
| `temp-project/.gitignore` | Duplicate Git ignore file | `.gitignore` |

## Unused Source Files

| File | Reason for Removal | Notes |
|------|-------------------|-------|
| `index.js` | Empty file at root | Not needed, Next.js uses app directory |
| `src/utils/dndPolyfill.ts` | Can be replaced with a more efficient solution | Replace with proper polyfill if needed |
| `temp-project/src/app/globals.css` | Duplicate CSS file | Use `src/app/globals.css` |
| `temp-project/src/app/layout.tsx` | Duplicate layout file | Use `src/app/layout.tsx` |
| `temp-project/src/app/page.tsx` | Duplicate page file | Use `src/app/page.tsx` |

## Unused Public Assets

| File | Reason for Removal | Notes |
|------|-------------------|-------|
| `public/vercel.svg` | Default Next.js logo, not used | Remove if not used in the application |
| `temp-project/public/vercel.svg` | Duplicate SVG file | Remove if not used |
| `temp-project/public/file.svg` | Likely unused | Remove if not used in the application |
| `temp-project/public/window.svg` | Likely unused | Remove if not used in the application |

## Legacy or Deprecated Files

| File | Reason for Removal | Notes |
|------|-------------------|-------|
| `scripts/migrate-to-mongodb.js` | Migration script, likely one-time use | Keep only if needed for future migrations |
| `scripts/migrate-to-mongodb.ts` | TypeScript version of migration script | Keep only one version if needed |

## Entire Directories to Consider Removing

| Directory | Reason for Removal | Notes |
|-----------|-------------------|-------|
| `temp-project/` | Appears to be a duplicate or template project | Merge any needed files first |
| `src/data/` | If using MongoDB, local JSON data files may be unused | Ensure data is migrated to MongoDB first |

## Files with Excessive Console Logging

These files should be modified to remove console logs rather than being removed entirely:

| File | Issue | Action |
|------|-------|--------|
| `src/context/TaskContext.tsx` | Contains multiple console.log statements | Remove console logs |
| `src/components/tasks/DraggableTaskItem.tsx` | Contains logging in render functions | Remove console logs |
| `src/app/api/tasks/[id]/route.ts` | Contains API debugging logs | Remove console logs |
| `src/utils/dndPolyfill.ts` | Contains initialization logs | Remove console logs |

## Optimization Strategy

1. **Backup**: Before removing any files, create a backup or ensure all changes are committed to version control
2. **Verify**: Check that each file is truly unused by searching for imports throughout the codebase
3. **Remove**: Delete the files systematically, testing the application after each major removal
4. **Test**: Run a full test suite after removing files to ensure nothing breaks
5. **Build**: Verify that the build process completes successfully after removing files

## Potential Build Size Reduction

By removing these unused files, we expect to reduce the build size by:

- Eliminating duplicate configuration files (~10-20KB)
- Removing the entire temp-project directory (~500KB-1MB)
- Eliminating unused SVG and image files (~50-100KB)
- Removing console logging code (~5-10KB)

The total expected reduction in build size could be approximately 1-2MB, which will improve load times and reduce hosting costs.

## Next Steps After Removal

After removing unused files:

1. Run `npm run build` to verify the build process works correctly
2. Check the build output size to confirm the reduction
3. Deploy to a staging environment to verify everything works as expected
4. Monitor performance metrics to confirm improvements

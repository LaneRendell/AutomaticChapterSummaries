# Changelog v1.3.2

## Bug Fixes

### Fixed duplicate lorebook entries after rebuild
- Added manual entry deletion loop in `finalizeRebuildCategories()` before calling `removeCategory()`
- NovelAI's `removeCategory()` does not cascade delete entries, causing orphaned entries
- Now explicitly deletes all entries in backup category before deleting the category itself

### Added missing rebuild-progress UI element to panel
- Element was referenced in rebuild logic but never added to the UI panel
- Now displays real-time progress during rebuild operations (e.g., "Processing chapter 5/12...")
- Clear rebuild-progress element on initialization to prevent stale messages

### Complete rewrite of showBackupModal() with restore functionality
- Old version only displayed backup list without any restore capability
- New version includes individual "Restore" button for each backup
- Added inline confirmation modal to prevent accidental restores
- Confirmation modal uses `api.v1.ui.modal.open()` to avoid z-index layering issues with Larry dialogs

### Fixed restoreFromBackup() category ID assignment
- Restored entries were being assigned old backup category IDs instead of current category ID
- Now correctly assigns `category: lorebookCategoryId` to all restored entries
- Added debug logging to track category ID assignment during restore

## Improvements

### Updated panel title to "Chapter Summaries v1.3.2"
- Previously showed v1.3.2 in title but v1.3.1 in log messages (inconsistent)

### Wrapped Testing & Debug section behind DEBUG_MODE flag
- Clean production UI when `DEBUG_MODE = false`
- Testing section only visible during development (`DEBUG_MODE = true`)
- Built panel content as dynamic array with conditional push of debug UI elements

### Updated "View Backups" test button to use full showBackupModal()
- Now provides same restore functionality as the main "View/Restore Backups" button
- Consistent UX across testing and production interfaces

### Replaced Larry confirmation dialogs with inline modals
- Larry dialogs (`api.v1.ui.larry.help()`) appear behind modal windows due to z-index
- Converted to `api.v1.ui.modal.open()` for proper layering and better UX
- Affects restore confirmations and other critical user confirmations

---

**Release Date:** November 21, 2025  
**Total Changes:** 4 bug fixes, 4 improvements  
**Lines Added:** ~732 (3023 → 3755 lines)

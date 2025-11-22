# Changelog v1.5.0

## Overview

Version 1.5.0 introduces a comprehensive backup browser that allows you to explore, inspect, and restore rebuild backups directly from the UI. This release focuses on improving visibility into your backup data and making recovery operations more accessible and user-friendly.

## New Features

### Comprehensive Backup Browser
- **New function:** `viewBackupDetails()` - Shows complete backup information in a modal
- View all lorebook entries in a backup with inline text display
- Token counts displayed for each individual entry
- Full entry text displayed inline (selectable for manual copying)
- Comprehensive metadata display:
  - Fingerprints count
  - Changed chapters count
  - Condensed ranges count
  - Failed chapters count
  - Last processed chapter count
  - Is first chapter flag
- Navigate between backup list and details views seamlessly
- Restore functionality accessible from both views

### Enhanced Backup List Modal
- Shows token count and entry count per backup for quick overview
- **New "View Details" button** per backup for comprehensive inspection
- Maintains existing "Restore" functionality with confirmation modal
- Clean, organized layout with visual separators
- All backups sorted by date (newest first)

### Configurable Backup Retention
- **New config option:** `maxRebuildBackups` (default: 5, range: 1-20)
- Controls how many backups are automatically kept in storage
- Older backups automatically pruned when limit is reached
- Keeps the most recent backups, discarding oldest first
- Helps manage storage space for long-running stories

### Helper Functions
- **New function:** `calculateBackupTokens()` - Accurately calculates total token count for any backup
- Used throughout backup browser for quick overview statistics
- Tokenizes all entry text using the same model as generation (GLM-4-6)

## Technical Improvements

### Modal Navigation Pattern
- Implements `modal.closed.then()` pattern for proper modal chaining
- NovelAI modal system requires this pattern for sequential modal displays
- Simplified implementation with inline text display (avoids nested modal complexity)
- Proper cleanup and state management between modal transitions

### Inline Text Display
- Entry text displayed directly in UI without nested modals
- Format: `• {displayName} ({tokenCount} tokens)\n{entryText}`
- Text is fully selectable for manual copying
- Avoids complexity of nested callback modals
- Better performance and simpler code

### Backup Organization
- Entries sorted by chapter number in details view
- Smart chapter number extraction from both entry text and display name
- Handles both singular ("Chapter 5") and plural ("Chapters 1-3") formats
- Fallback ordering for entries without clear chapter numbers

## User Experience Enhancements

### Backup List View
- Quick overview of all available backups
- Key information at a glance:
  - Creation date and time
  - Reason for backup creation
  - Chapter count
  - Entry count
  - Total token count
- Easy access to both details and restore operations

### Backup Details View
- Comprehensive information about a specific backup
- Full metadata section with all state information
- Complete entry list with individual token counts
- Full entry text for each summary (no truncation)
- Quick navigation back to list view
- Direct restore access with confirmation modal

### Confirmation Modals
- All destructive operations require explicit confirmation
- Restore confirmation shows:
  - Backup creation date
  - Number of entries to be restored
  - Warning about data replacement
  - Cancel option returns to details view
- Clear success/error feedback after operations

## Configuration Changes

### New Config Schema Entry
```typescript
maxRebuildBackups: {
    title: "Max Rebuild Backups",
    description: "Maximum number of rebuild backups to keep in storage (1-20). Older backups are automatically pruned.",
    type: "number",
    default: 5,
    minimum: 1,
    maximum: 20
}
```

## Affected Functions

### New Functions (v1.5.0)
- `calculateBackupTokens(backup)` - Lines ~1407-1425 - Calculate total tokens for a backup
- `viewBackupDetails(backup)` - Lines ~1434-1640 - Display comprehensive backup information
- `buildBackupListContent(backups, modalRef)` - Lines ~2408-2644 - Build reusable backup list UI

### Modified Functions
- `pruneOldBackups(backups)` - Now uses configurable `maxRebuildBackups` limit
- `showBackupModal()` - Enhanced to use `buildBackupListContent()` for reusability

### Removed Functions
- `viewBackupEntry()` - No longer needed with inline text display approach

## Technical Details

### Modal Reference Pattern
Uses a wrapper object pattern for forward references:
```typescript
const modalRef: { modal?: any } = {};
const content = await buildBackupListContent(backups, modalRef);
modalRef.modal = api.v1.ui.modal.open({ content });
```
This allows callback functions to reference the modal before it's created.

### Modal Chaining Pattern
Proper pattern for opening sequential modals:
```typescript
modal.close();
modal.closed.then(() => {
    // Open next modal here
    api.v1.ui.modal.open({ ... });
});
```
This ensures proper cleanup and avoids display issues.

### Entry Sorting Logic
1. Try to extract chapter number from entry text (`/^Chapters? (\d+)/`)
2. Fallback to display name extraction (`/Chapter (\d+)/`)
3. Last resort: assign high number (999999) to sort to end
4. Sort all entries by extracted chapter number
5. Display in sorted order

## Storage Impact

### Storage Keys (Unchanged)
- `rebuildBackups` - Array of `RebuildBackup` objects
  - Now automatically pruned to `maxRebuildBackups` limit
  - Sorted by timestamp (newest first)

### Backup Data Structure (Unchanged)
```typescript
type RebuildBackup = {
    timestamp: number;
    reason: string;
    categoryName: string;
    entries: LorebookEntry[];
    fingerprints: ChapterFingerprint[];
    changedChapters: ChangedChapter[];
    condensedRanges: CondensedRange[];
    failedChapters: FailedChapter[];
    lastProcessedChapterCount: number;
    isFirstChapter: boolean;
    chapterCount: number;
}
```

## Testing Recommendations

After updating to v1.5.0, test the following scenarios:

1. **Backup List Display:**
   - Click "View/Restore Backups" button
   - Verify all backups show correct token counts
   - Verify all backups show correct entry counts

2. **Backup Details Navigation:**
   - Click "View Details" on a backup
   - Verify all metadata fields display correctly
   - Verify all entries are listed with token counts
   - Verify entry text is fully visible and selectable
   - Click "← Back to List" to return
   - Verify list view reappears correctly

3. **Restore Workflow:**
   - From details view, click "Restore This Backup"
   - Verify confirmation modal appears with correct information
   - Click "Cancel" - should return to details view
   - Click "Restore This Backup" again
   - Click "Yes, Restore" - should restore backup
   - Verify success message appears
   - Verify lorebook entries match backup

4. **Backup Retention:**
   - Set `maxRebuildBackups` to a low value (e.g., 3)
   - Perform multiple rebuilds to create backups
   - Verify oldest backups are automatically removed
   - Verify only the most recent N backups remain

5. **Token Counting:**
   - Create backups with varying entry counts
   - Verify token counts are accurate
   - Compare with manual count if needed

## Migration Notes

No migration required. This is a drop-in replacement for v1.4.1. All existing backups remain compatible and will work with the new browser interface.

### New Config Option
If you want to change backup retention, add this to your config:
```typescript
maxRebuildBackups: 10  // Keep up to 10 backups (default is 5)
```

### Recommended Settings
- Default `maxRebuildBackups: 5` is suitable for most users
- Increase to 10-20 for long stories where you want more backup history
- Decrease to 1-3 if storage space is a concern

## Known Limitations

### NovelAI Modal System Constraints
Due to NovelAI's modal system architecture:
- Only one modal can be open at a time
- Nested modals (modals that open other modals from callbacks) have display issues
- This is why entry text is displayed inline rather than in separate modals

### Performance Considerations
- Token counting is performed during backup list display
- For backups with many entries (100+), initial display may take 1-2 seconds
- This is a one-time calculation per backup per session
- Subsequent views use cached results

### Text Display
- Entry text displayed in monospace font for readability
- Very long entries (1000+ tokens) may require scrolling
- Text is not syntax-highlighted (displayed as plain text)

## Future Enhancements (Post-v1.5.0)

Potential features for future versions:
- Search/filter functionality for large entry lists
- Export backup to external file
- Import backup from external file
- Diff view comparing two backups
- Backup compression for storage efficiency
- Entry-level restore (restore individual entries instead of full backup)

---

**Release Date:** November 22, 2025  
**Total Changes:** 3 new features, 4 helper functions, technical improvements  
**Lines Changed:** ~400+ additions and modifications  
**Script Version:** 1.5.0  
**Builds on:** v1.4.1

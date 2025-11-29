# Changelog - Version 1.6.0

## History-Aware Tracking

Version 1.6.0 introduces **History-Aware Tracking** for automatic undo/redo management of chapter summaries, along with important bug fixes.

---

## New Features

### History-Aware Tracking

Automatically manages chapter summaries when you use undo/redo operations. No more orphaned summaries or missing entries after navigating your story history!

**How It Works:**
- When you **undo** past a chapter break: The orphaned summary is automatically removed from the lorebook
- When you **redo** to restore a chapter break: The cached summary is restored from history storage
- Works with **undo**, **redo**, **retry**, and **history jumps**

**Technical Details:**
- Uses NovelAI's `onHistoryNavigated` hook to detect navigation events
- Stores complete chapter state (summaries, fingerprints, condensed ranges) per history node
- Validates cached state against actual document to prevent stale state restoration
- Full state preservation through condensation operations

**Configuration:**
- **Key:** `history_aware_tracking`
- **Type:** boolean
- **Default:** `true` (enabled by default)
- **Label:** "History-Aware Tracking"

---

## Bug Fixes

### Rebuild Counting In-Progress Chapter

**Symptom:**
"Rebuild All Summaries" was counting the currently in-progress chapter when calculating chapters to rebuild. With 3 chapter break tokens, it would try to summarize 4 chapters instead of 3.

**Root Cause:**
The analysis used `chapterBreakCount + 1` which incorrectly included the text after the last break as a "complete" chapter.

**Solution:**
Changed to only process complete chapters (those with an ending break). The number of complete chapters equals the number of break tokens.

### Backup Failing on New Stories

**Symptom:**
On a newly created story with no content, creating a backup would fail with:
```
Backup failed: cannot read property 'length' of undefined
```

**Root Cause:**
The `failedChapters` storage retrieval was missing a fallback value, returning `undefined` on new stories.

**Solution:**
Added `|| []` fallback to `failedChapters` retrieval in `createRebuildBackup()`.

### Stale Lorebook Entry IDs After Redo

**Symptom:**
After using redo to restore chapter summaries, uncondense operations would fail or target wrong entries because the `condensedRanges` metadata contained old entry IDs.

**Root Cause:**
When `restoreFullHistoryState()` recreated lorebook entries, they received new IDs from NovelAI. The cached `condensedRanges` metadata still referenced the old entry IDs.

**Solution:**
After recreating entries, `restoreFullHistoryState()` now:
1. Queries back all newly created entries to get their IDs
2. Builds a map from display name to new entry ID
3. Updates `condensedRanges` with the correct entry IDs before saving to storage

---

## Technical Changes

### New Types

```typescript
// v1.6.0: History-aware tracking types
type HistoryChapterState = {
    chapterBreakCount: number;
    summaries: CachedChapterSummary[];
    condensedRanges: CondensedRange[];
    fingerprints: ChapterFingerprint[];
    lastProcessedChapterCount: number;
    timestamp: number;
}

type CachedChapterSummary = {
    chapterNumber: number;
    title: string;
    summaryText: string;
    lorebookEntryId: string;
    isCondensed: boolean;
    startChapter?: number;
    endChapter?: number;
}
```

### New Functions

| Function | Purpose |
|----------|---------|
| `storeHistoryChapterState()` | Stores complete chapter state to current history node |
| `getHistoryChapterState(nodeId)` | Retrieves cached state for a specific history node |
| `countCurrentChapterBreaks()` | Counts chapter breaks in current document |
| `restoreFullHistoryState(state)` | Performs complete state restoration from cache |
| `historyStatesAreDifferent(a, b)` | Compares two history states for changes |
| `onHistoryNavigatedHook(params)` | Main handler for history navigation events |

### New Configuration Variables

```typescript
let historyAwareTracking: boolean;  // Default: true
```

### Hook Registrations

```typescript
// History-aware tracking hook
api.v1.hooks.register('onHistoryNavigated', onHistoryNavigatedHook);
```

---

## Changes Summary

| Change | Type | Description |
|--------|------|-------------|
| History-Aware Tracking | Feature | Auto-manage summaries on undo/redo |
| Rebuild Chapter Count | Bug Fix | No longer counts in-progress chapter |
| Backup on New Stories | Bug Fix | Fixed undefined length error |
| Stale Entry IDs After Redo | Bug Fix | Updates condensedRanges with correct entry IDs |
| Stale Cache Detection | Enhancement | Validates cached state matches document |

---

## Migration from v1.5.6

### For Users
**No action required!** Simply update to v1.6.0:

1. Copy the new script code
2. Paste into NovelAI script editor
3. Save and reload

All your existing data remains compatible:
- Fingerprints preserved
- Condensed ranges intact
- Backups fully compatible
- Settings unchanged

### New Configuration Options

After updating, you can configure the new feature in NovelAI's script configuration:

- **History-Aware Tracking** - Enabled by default
  - Disable if you prefer manual summary management after undo/redo

---

## Version History

| Version | Date | Type | Description |
|---------|------|------|-------------|
| **v1.6.0** | 2025-11-29 | Feature | History-aware tracking |
| v1.5.6 | 2025-11-27 | Bug Fix | Status panel initialization fix |
| v1.5.5 | 2025-11-25 | Maintenance | API compatibility (modal async) |
| v1.5.4 | 2025-11-24 | Feature | Permissions system integration |
| v1.5.3 | 2025-11-22 | Feature | Manual condensation controls |

---

## Known Limitations

1. **Pre-Tracking History**: History nodes that existed before the script was loaded will not have cached state. Undoing to these nodes syncs lorebook to document state.

---

## Support

### Issues or Questions?
- **GitHub Issues**: Report problems or ask questions
- **Documentation**: See USER_MANUAL.md for feature documentation

### Reporting Problems
If you encounter issues:

1. **Enable DEBUG_MODE** in the script
2. **Check browser console** for `[History]` prefixed messages
3. **Note exact symptoms** and reproduction steps
4. **Report on GitHub** with details and log output

---

**Version**: 1.6.0
**Release Date**: November 29, 2025
**Type**: Feature Release
**Previous Version**: 1.5.6

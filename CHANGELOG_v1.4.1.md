# Changelog v1.4.1

## Overview

Version 1.4.1 combines the major new features from v1.4.0 (which was never publicly released) with critical bug fixes discovered during testing. This release introduces automatic change detection and regeneration features, along with 8 bug fixes (including one critical regex parsing fix) and 2 improvements that significantly enhance the reliability and safety of the generation limit tracking and token management systems.

## New Features (from v1.4.0)

### Automatic Change Detection After Each Generation
- **New config option:** `autoDetectOnGeneration` (default: `false`)
- Automatically detects edited chapters after user generates text
- Hooks into NovelAI's `onResponse` event to trigger detection
- Respects NovelAI's 5-generation non-interactive limit
- Shows "Auto-detected X changed chapters" notifications with timestamp
- "Last auto-check" timestamp displayed in status panel
- Notifications persist until dismissed or next auto-detection

### Automatic Regeneration of Changed Chapters
- **New config option:** `autoRegenerate` (default: `false`)
- When enabled, automatically regenerates summaries for detected changed chapters
- When disabled, shows notifications for manual review
- Smart generation limit handling:
  - Tracks non-interactive generations (0-5 counter)
  - Shows warning modal at 4 generations with option to continue
  - Resets counter automatically when user performs text generation or UI callback
- Pre-checks token budget before auto-regeneration
- Shows modal if regeneration would exceed threshold

### Fixed summarizeAllBreaks Configuration
- Config option now actually works as intended
- **When `true`:** All chapter breaks create summaries (uses every break token)
- **When `false`:** Only breaks followed by `[` on next line create summaries (explicit chapter markers)
- Title extraction handles incomplete brackets gracefully
- Added DEBUG_MODE logging for title pattern matching

### Enhanced UI for Auto-Detection
- Real-time notifications for auto-detected changes
- Notifications persist until dismissed or next detection
- "Last auto-check" timestamp in status display
- Clear visual feedback for all automatic operations

## Critical Bug Fixes

### CRITICAL: Fixed regex pattern to support plural "Chapters"
- **Impact:** System was silently failing to detect condensed lorebook entries
- Changed regex from `/^Chapter (\d+)/` to `/^Chapters? (\d+)/` to match both singular and plural
- Affects three critical functions:
  - `getChapterSummaryEntries()` - Entry retrieval and token counting
  - `regenerateChapter()` - Chapter regeneration logic
  - `findEntryByChapterNumber()` - Entry lookup during rebuild
- **Symptoms this was causing:**
  - Incorrect token counts (e.g., showing 448 tokens instead of 652)
  - Missing fingerprints for condensed chapters
  - Broken change detection for condensed entries
  - Only 3 of 5 lorebook entries being detected in some cases
- This was the root cause of multiple cascading system failures

## Bug Fixes

### Full rebuild now respects 5-generation limit
- Added generation counter tracking to `performFullRebuild()`
- Counter increments for each `regenerate` and `generate` action during rebuild
- Counter resets before rebuild starts and after rebuild completes
- Prevents bypassing NovelAI's 5-generation non-interactive limit during batch operations

### Retry failed chapters now respects 5-generation limit
- Added generation counter tracking to `retryFailedChapters()`
- Counter resets before retry operations begin
- Counter increments for each chapter retry attempt
- Counter resets after all retry operations complete
- Ensures retry operations don't bypass generation limit safety checks

### Stale UI status messages now auto-clear
- `updateStatusPanel()` now automatically clears `retry-status` and `rebuild-progress` fields
- Only clears when no active operations are running (checks `backgroundSummaryInProgress` and `batchRegenerationInProgress` flags)
- Prevents persistent "Retry complete" and "Rebuild finished" messages that never disappear
- Provides cleaner UI experience after operations complete

### Token budget warning after manual generation
- New `checkTokenBudgetAfterGeneration()` function called in `onResponse` hook
- Checks token budget after every user text generation (not just auto-regeneration)
- Three scenarios:
  1. **Under threshold:** Proceed normally
  2. **Over threshold:** Show warning modal with "Continue" or "Condense Now" options
  3. **Over max limit:** Force automatic condensation
- State-tracked `condensationWarningShown` flag prevents modal spam during same session
- Ensures users are always aware of token budget status

### Editing condensed chapters now triggers proper regeneration
- Fixed `expandCondensedRange()` fingerprint preservation logic
- **For changed chapters:** Only marks `isCondensed = false`, preserves old hash
- **For unchanged chapters:** Updates fingerprint with current text
- Allows proper detection and regeneration of edited chapters that were part of condensed ranges
- Previously, expanding would update all fingerprints, making edited chapters appear unchanged

### Generation counter now tracks expansion operations
- `expandCondensedRange()` now increments generation counter for each chapter regenerated
- Logs counter progress during expansion operations (`Expansion generation counter: X/5`)
- Prevents hitting generation limit without warning during range expansion
- Example: Expanding chapters 1-3 = 3 generations, system now tracks this correctly

### Generation counter now tracks condensation operations
- `condenseSummaries()` now increments generation counter for the condensation generation
- Logs counter during condensation (`Condensation generation counter: X/5`)
- Ensures complete tracking across all generation operation types
- Combined with expansion tracking, prevents silent limit violations

## Improvements

### Enhanced debug logging for condensed chapters
- Logs condensed chapter count during change detection
- Shows stored vs current hash comparisons for condensed chapters
- Example output:
  ```
  Found 3 condensed chapter fingerprints
  Checking condensed chapter 2:
    Stored hash: abc123
    Current hash: def456
    Match: false
  ```
- Helps diagnose fingerprint and detection issues during development and troubleshooting

### New "Refresh All Fingerprints" debug utility
- Rescans current document and updates all chapter fingerprints to current state
- Preserves `isCondensed` flag during fingerprint updates
- Allows recovery from bad fingerprint state caused by previous bugs
- Located in Testing & Debug section (only visible when `DEBUG_MODE = true`)
- Provides users with a recovery mechanism without needing to rebuild

## Technical Details

### Generation Counter Tracking (Complete Coverage)
The generation counter now tracks ALL generation operations across the system:
- ✅ User text generation (resets counter)
- ✅ Auto-regeneration (increments, checks at 4)
- ✅ Full rebuild operations (increments, resets before/after)
- ✅ Retry failed chapters (increments, resets before/after)
- ✅ Expansion operations (increments per chapter) **[NEW in v1.4.1]**
- ✅ Condensation operations (increments for condensation) **[NEW in v1.4.1]**

### Affected Functions
- `performFullRebuild()` - Lines ~1775, ~1009, ~1902, ~1916
- `retryFailedChapters()` - Lines ~3480-3510, ~3571-3580
- `updateStatusPanel()` - Lines ~3465-3480
- `checkTokenBudgetAfterGeneration()` - Lines ~2593-2712 (new function)
- `expandCondensedRange()` - Lines ~444-446, ~507-533, ~492-498
- `condenseSummaries()` - Lines ~3162-3168
- `getChapterSummaryEntries()` - Line ~3052 (regex fix)
- `regenerateChapter()` - Line ~644 (regex fix)
- `findEntryByChapterNumber()` - Line ~1585 (regex fix)

### New State Variables
- `condensationWarningShown: boolean` - Session flag to prevent modal spam (v1.4.1)

## Testing Recommendations

After updating to v1.4.1, users should test the following scenarios:

1. **Condensed Chapter Editing:**
   - Edit a chapter that's part of a condensed range (e.g., Chapter 2 in "Chapters 1-3")
   - Generate text to trigger auto-detection
   - Verify modal appears after 4 generations (3 expansions + 1 condensation)
   - Confirm all fingerprints update correctly

2. **Token Budget Warnings:**
   - Generate text while near condensation threshold
   - Verify warning modal appears with accurate token counts
   - Test both "Continue" and "Condense Now" options

3. **Full Rebuild:**
   - Trigger "Rebuild All Chapters" with multiple chapters
   - Verify modal appears at 4 generations
   - Confirm counter resets after rebuild completes

4. **Entry Detection:**
   - Create condensed summaries
   - Verify all entries are detected (check status panel token count)
   - Should now correctly detect "Chapters 1-3" format entries

## Migration Notes

No migration required. This is a drop-in replacement for v1.4.0. All existing fingerprints, condensed ranges, and storage data remain compatible.

If you experienced issues with v1.4.0 (incorrect token counts, missing entries, etc.), the "Refresh All Fingerprints" debug utility can help reset your fingerprint state without losing data.

---

**Release Date:** November 21, 2025  
**Total Changes:** 4 new features (from v1.4.0), 8 bug fixes (1 critical), 2 improvements  
**Lines Changed:** ~1000+ additions and modifications  
**Script Version:** 1.4.1  
**Note:** This release includes both v1.4.0 features (never publicly released) and v1.4.1 bug fixes

# Changelog - Version 1.5.2

## Release Date
November 22, 2025

## Overview
Version 1.5.2 is a **major stability and control release** that fixes critical bugs in automatic processing behavior. The script now properly respects user configuration settings and provides three distinct behavior modes based on the `autoDetectOnGeneration` and `autoRegenerate` settings.

---

## Critical Bug Fixes

### 1. **Automatic Processing Bypass Fixed**
**Problem**: Script was processing all chapters automatically when pasting multi-chapter stories, completely ignoring the `autoDetectOnGeneration` and `autoRegenerate` configuration settings.

**Solution**: 
- Removed automatic multi-chapter batch processing loop from `onResponse` hook
- Added proper configuration checks before any automatic processing
- Script now respects all three behavior modes (see Configuration Modes below)

**Impact**: Users now have full control over when and how chapter summaries are generated.

---

### 2. **Generation Counter Limit During Condensation**
**Problem**: When condensing chapters, the script would hit the "Non-interactive generation limit reached (5 calls)" error because the generation counter wasn't being reset between different operations.

**Solution**:
- Reset `generationCounter = 0` at the start of `autoRegenerateChanges()` batch processing
- Reset counter before Level 1 (normal) condensation
- Reset counter before Level 2 (aggressive) condensation  
- Reset counter before Level 3 (emergency) condensation

**Impact**: Condensation now works reliably without hitting generation limits, even during aggressive multi-level condensation scenarios.

---

### 3. **Wrong Chapter Generation on Story Paste**
**Problem**: When pasting a story with 10 chapter breaks, the script would generate "Chapter 10" first using Chapter 1's text content.

**Solution**:
- Skip single-chapter generation in full auto mode when no fingerprints exist
- Let the automatic batch detection handle all chapters at once
- Only process single chapters when appropriate based on configuration mode

**Impact**: Pasted multi-chapter stories are now processed correctly with proper chapter numbering and content.

---

### 4. **Chapter Numbering Off-By-One Error**
**Problem**: Script was determining chapter readiness incorrectly, requiring N+1 breaks for chapter N to be ready.

**Solution**:
- Changed `chapterToSummarize` calculation from `chapterBreakCount - 1` to `chapterBreakCount`
- Logic now correctly recognizes: N breaks = N complete chapters, chapter N+1 in progress
- Chapter N is ready to summarize when the Nth break exists

**Impact**: Chapters are now detected and processed at the correct time based on break count.

---

### 5. **Incomplete Chapters Being Detected**
**Problem**: When no fingerprints existed, the script would detect chapters that were still in progress (not yet complete).

**Solution**:
- Modified `detectChangedChapters()` to only detect complete chapters when no fingerprints exist
- Set `completeChapterCount = chapterBreakCount` (not total chapter count)
- In-progress chapters are no longer treated as "new" chapters

**Impact**: Only complete chapters trigger detection and generation, preventing premature processing.

---

### 6. **Lorebook Entry Format Inconsistency**
**Problem**: `generateChapterSummary()` used Format B while `regenerateChapter()` used Format A, causing inconsistent lorebook entries.

**Format A** (old):
```
Chapter 5: Title Here
Type: chapter
Summary: Text here
```

**Format B** (standardized):
```
Chapter 5
Type: chapter
Title: Title Here
Summary: Text here
```

**Solution**:
- Standardized both functions to use Format B
- Fixed variable name typo in `regenerateChapter()` (messages → message)
- All lorebook entries now have consistent structure

**Impact**: All chapter summaries have uniform formatting regardless of how they were created.

---

### 7. **Chapter 2 Title Extraction Bug**
**Problem**: Chapter 2's lorebook entry would display Chapter 1's title instead of its own title (e.g., showing "Starship Hijinks" instead of "Bridge").

**Root Cause**: The `isFirstChapter` flag wasn't being cleared after chapter 1 was created via the auto-regeneration code path (`regenerateChapter()`), causing `scanForPreviousChapter()` to always return Chapter 1's text even when generating Chapter 2.

**Solution**:
- Added universal flag clearing logic to `storeChapterFingerprint()`
- When chapter 1's fingerprint is stored, set `isFirstChapter = false`
- This fix applies to both code paths: `generateChapterSummary()` and `regenerateChapter()`

**Impact**: All chapters now extract their correct titles regardless of which code path created them.

---

## Configuration Modes

Version 1.5.2 properly implements three distinct behavior modes:

### Mode 1: Full Manual (Both OFF)
- `autoDetectOnGeneration: false`
- `autoRegenerate: false`

**Behavior**: Nothing happens automatically. User must click "Check for Changes" button to detect and regenerate chapters manually.

**Exception**: First chapter of a brand new story is still auto-generated when user adds the first chapter break.

---

### Mode 2: Semi-Automatic (Detect ON, Regenerate OFF)
- `autoDetectOnGeneration: true`
- `autoRegenerate: false`

**Behavior**: 
- Script automatically detects changed/new chapters after each generation
- Shows notification modal with list of detected changes
- User manually clicks "Regenerate" or "Dismiss" for each chapter

---

### Mode 3: Fully Automatic (Both ON)
- `autoDetectOnGeneration: true`
- `autoRegenerate: true`

**Behavior**:
- Script automatically detects changed/new chapters after each generation
- Automatically regenerates all detected changes in batch
- No user intervention required (fully hands-off)

---

## Technical Improvements

### Code Quality
- Removed obsolete `multiChapterBatchInProgress` flag
- Cleaned up redundant configuration checks
- Improved error handling and logging throughout
- Better separation of concerns between detection and generation

### Timing & Logic
- More precise chapter completion detection
- Proper sequencing of automatic operations
- Better handling of edge cases (pasted stories, mixed scenarios)

### Debugging
- Enhanced debug logging for flag state changes
- Better visibility into which code paths are executing
- Clear log messages for configuration mode detection

---

## Migration Notes

**No breaking changes** - Existing configurations will continue to work. However, users may notice different behavior if they previously relied on the buggy automatic processing that bypassed configuration settings.

**Recommended Action**: Review your `autoDetectOnGeneration` and `autoRegenerate` settings to ensure they match your desired workflow (see Configuration Modes above).

---

## Testing Coverage

All fixes have been tested with:
- ✅ Manual mode (both settings OFF)
- ✅ Semi-automatic mode (detect ON, regenerate OFF)
- ✅ Fully automatic mode (both ON)
- ✅ Pasted multi-chapter stories (10+ chapters)
- ✅ Writing chapters incrementally from scratch
- ✅ Mixed scenarios (existing chapters + adding new ones)
- ✅ Condensation triggering during various workflows
- ✅ Title extraction for all chapters
- ✅ Format consistency across all entry types

---

## Known Limitations

None identified in v1.5.2 testing. All critical bugs from v1.5.1 and earlier have been resolved.

---

## Credits

Special thanks to the testing that identified these edge cases and helped refine the three configuration modes into truly distinct, predictable behaviors.

---

## Files Changed

- `Automatic_Chapter_Summaries_v1.5.2.ts` - Main script file with all fixes applied
- `FEATURE_EXPLANATION_AUTO_VS_MANUAL.md` - Documentation of the three behavior modes
- `CHANGELOG_v1.5.2.md` - This changelog

---

## Upgrade Instructions

1. Replace your current script with `Automatic_Chapter_Summaries_v1.5.2.ts`
2. Review your configuration settings (`autoDetectOnGeneration` and `autoRegenerate`)
3. Read `FEATURE_EXPLANATION_AUTO_VS_MANUAL.md` to understand the three modes
4. Test with your current story to verify behavior matches expectations

---

**Version 1.5.2 represents a major leap forward in reliability and user control. Enjoy the bug-free experience!** 🎉

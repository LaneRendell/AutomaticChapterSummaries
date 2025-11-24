# Changelog - Version 1.5.1

**Release Date:** November 22, 2025

## 🎉 New Features

### Condensed Ranges Management UI
- **New Section in Main Panel**: View all your condensed chapter ranges at a glance
- **Range Details Display**: Each range shows:
  - Chapter span (e.g., "Chapters 1-8")
  - Token count
  - Condensation date
  - Number of original summaries archived
- **Quick Actions**: "View Details" and "Uncondense" buttons for each range

### View Condensed Range Details
- **Comprehensive Modal**: Shows complete information about any condensed range
  - Current condensed summary with full text
  - Metadata (token count, condensation date)
  - All archived original summaries with chapter numbers
  - Scrollable sections for easy navigation of long content

### Uncondense Entire Range
- **Preview Before Action**: Confirmation modal shows:
  - Token impact calculation (+X tokens, +Y% increase)
  - List of chapters that will be restored
  - Option to proceed or cancel
- **Smart Restoration**: Deletes condensed entry and restores all original detailed summaries
- **Fingerprint Updates**: Automatically marks chapters as no longer condensed

### Undo Last Uncondense Operation
- **One-Click Undo**: Reverse an uncondense operation if needed
- **Automatic Backup**: Stores condensed entry data before uncondensing
- **UI Integration**: Undo button appears when undo data is available
- **Perfect for Testing**: Facilitates safe experimentation and error recovery

### Uncondense Single Chapter with Range Splitting
- **Surgical Precision**: Extract one chapter from a condensed range
- **Smart Splitting**: 
  - Example: Uncondense Chapter 5 from "Chapters 3-7"
  - Result: "Chapters 3-4" (condensed) + Chapter 5 (detailed) + "Chapters 6-7" (condensed)
- **Token Efficiency**: Remaining chapters stay condensed to minimize token impact
- **Single-Chapter Format**: Uses "Chapter N" (not "Chapters N-N") for better readability
- **Preview Modal**: Shows split preview and token impact before proceeding
- **Generation Limit Respect**: Warns if operation would exceed 5-generation limit

## 🐛 Critical Bug Fixes

### Fixed Overlapping Condensed Ranges Bug
**Severity:** Critical - Could corrupt lorebook state during automatic condensation

**Symptoms:**
- Multiple overlapping condensed ranges after auto-condensation
- Example: "Chapter 1", "Chapters 3-5", and "Chapters 1-8" all existing simultaneously
- Lorebook entries not properly cleaned up
- Storage array contained duplicate/overlapping ranges

**Root Causes:**
1. `performNormalCondensation()` was calling `condenseSummaries()` directly, bypassing overlap detection
2. `condenseWithExpansion()` was modifying the `condensedRanges` array during iteration
3. Function tried to delete same lorebook entries twice (overlap detection + deletion loop)
4. `getChapterSummaryEntries()` returns lorebook entries, not logical chapters, causing confusion

**Solution:**
- Complete rewrite of `condenseWithExpansion()` with clear 6-step process:
  1. Calculate new range boundaries from input chapters
  2. Find ALL overlapping ranges (before any modifications)
  3. Delete lorebook entries for overlapping ranges (with error handling)
  4. Collect summaries (from ranges + individuals, with duplicate prevention)
  5. Remove overlapping ranges from storage
  6. Create new condensed summary
- Changed `performNormalCondensation()` to use `condenseWithExpansion()`
- Added `chaptersAdded` Set to prevent duplicate chapters in summaries
- Each entry deleted exactly once with graceful error handling
- Clear separation: ranges provide originals, individuals provide themselves

**Impact:** Automatic condensation now properly cleans up old ranges and maintains clean lorebook state

### Fixed Aggressive Condensation Duplicate Entries
**Problem:** When expanding condensed ranges during aggressive condensation, individual entries weren't being deleted, causing duplicates

**Example Scenario:**
- Had "Chapters 1-5" (condensed) + Chapters 6-9 (detailed)
- Aggressive condensation should create "Chapters 1-9"
- Chapter 9 wasn't deleted because only condensed entries were being removed
- Result: Both "Chapters 1-9" and old Chapter 9 entry existed

**Solution:**
- `condenseWithExpansion()` now tracks ALL entry IDs (condensed + individual)
- Deletes both condensed entries and individual entries before creating new range
- Created `condenseSummariesWithoutDeletion()` for pre-deleted entries
- Properly cleans up all old entries before creating new condensed range

### Fixed Uncondense Single Chapter Errors
**Problem:** `uncondenseSingleChapter()` called `condenseSummaries()` which tried to delete non-existent entries

**Details:**
- Function was working with archived summaries (no actual lorebook entries)
- `condenseSummaries()` tried to delete entries by ID, causing errors
- Storage update: old range was filtered out but never saved, causing stale UI
- UI incorrectly showed old range instead of new split ranges

**Solution:**
- Changed to use `condenseSummariesWithoutDeletion()` for archived summaries
- Properly saves filtered `condensedRanges` array before creating new ranges
- UI now correctly displays only the new split ranges after operation

### Fixed Duplicate Chapters in Condensed Summaries
**Problem:** When overlapping ranges existed, same chapter could be added to `summariesToCondense` twice

**Example:**
- "Chapter 1" (condensed 1-1) overlaps with new "Chapters 1-8" range
- Chapter 1 added from overlapping range's originalSummaries
- Chapter 1 also added from individual entries list
- Result: "Chapter 1" appears twice in archived summaries display

**Solution:**
- Added `chaptersAdded` Set to track processed chapter numbers
- Check before adding chapters from overlapping ranges
- Check before adding individual entries
- Prevents any chapter from being added more than once

## 🔧 Improvements

### Single-Chapter Condensation Logic
- **Token Efficiency Focus**: When uncondensing creates single-chapter splits, they remain condensed
- **Rationale**: User wants ONE detailed chapter, others should stay token-efficient
- **Format Consistency**: Single-chapter entries use "Chapter N" everywhere:
  - Modal titles
  - Modal headers  
  - Main panel display
  - Lorebook entry text
  - Type field: "Type: chapter" (not "Type: chapters")
- **Automatic Condensation Safeguards**: 
  - Normal, aggressive, and emergency condensation all require minimum 2 chapters
  - Single-chapter condensed entries only created during manual uncondense splits
  - Prevents inappropriate automatic single-chapter condensation

### Enhanced UI Feedback
- **Status Panel Improvements**:
  - Accurate detailed/condensed entry counts using storage data (not lorebook scan)
  - Clear display of which chapters are in condensed ranges
  - Better visual separation between sections
- **Modal Consistency**: All modals use consistent formatting for singular vs. plural chapters
- **Generation Limit Tracking**: Counter properly increments for all condensation operations

### Code Architecture Improvements
- **Separation of Concerns**: 
  - `condenseSummaries()` - normal condensation with deletion
  - `condenseSummariesWithoutDeletion()` - condensation for pre-deleted entries
  - `condenseWithExpansion()` - condensation with overlap handling
- **Better Error Handling**: Graceful handling of missing/already-deleted entries
- **Cleaner Logic Flow**: Step-by-step process easier to understand and debug

## 📋 Technical Details

### New Functions
- `buildCondensedRangesUI()` - Builds UI section for condensed ranges display
- `showCondensedRangeDetails()` - Opens detailed modal for a condensed range
- `confirmUncondenseRange()` - Shows preview modal before uncondensing entire range
- `uncondenseEntireRange()` - Deletes condensed entry and restores all originals
- `undoLastUncondense()` - Reverses last uncondense operation
- `confirmUncondenseSingleChapter()` - Shows preview for single chapter uncondense
- `uncondenseSingleChapter()` - Entry point with generation limit checking
- `performUncondenseSingleChapter()` - Internal function performing split operation
- `condenseSummariesWithoutDeletion()` - Condenses pre-deleted entries

### Modified Functions
- `condenseWithExpansion()` - Complete rewrite with 6-step clear process
- `performNormalCondensation()` - Now uses `condenseWithExpansion()`
- `updateStatusPanel()` - Fixed count calculations using storage data
- `getChapterSummaryEntries()` - Enhanced logging and validation

### Storage Keys
- `lastUncondenseData` - Stores backup for undo functionality
- `condensedRanges` - Enhanced with proper overlap management

## 🎮 Usage Tips

1. **View Your Condensed Ranges**: Check the "📦 Condensed Ranges" section in the main panel
2. **Need Details?**: Click "View Details" on any range to see the full condensed summary and all archived originals
3. **Want Full Detail Back?**: Click "Uncondense" to restore all original detailed summaries (with token impact preview)
4. **Made a Mistake?**: Use the "Undo Last Uncondense" button (appears after uncondense operations)
5. **Extract One Chapter**: In the details modal, use "Uncondense Single Chapter" to get just one chapter back in detail while keeping others condensed
6. **Watch Your Tokens**: All operations show token impact before proceeding

## ⚠️ Breaking Changes

None - All changes are backward compatible with v1.5.0 data structures.

## 🔮 Future Enhancements

Potential improvements for future versions:
- Batch uncondense multiple ranges
- Search/filter condensed ranges
- Export/import condensed summaries
- Custom condensation rules per chapter range
- Visual timeline of condensation history

---

**Upgrade Note:** This version requires no data migration. Your existing condensed ranges, fingerprints, and backups will work seamlessly with the new features.

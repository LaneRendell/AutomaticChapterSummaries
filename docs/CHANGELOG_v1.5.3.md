# Changelog - Version 1.5.3

## Release Date
November 22, 2025

## Overview
Version 1.5.3 introduces **Manual Condensation Controls**, giving users complete control over how and when chapter summaries are condensed to save tokens. This release adds two powerful new features: the ability to re-condense existing chapters with custom settings, and the ability to manually select specific chapter ranges to condense together.

---

## New Features

### 1. **Manual "Condense With Settings" Feature**
Allows users to re-condense existing chapter summaries with custom prompts and token limits without modifying the script configuration.

**What It Does:**
- Opens a modal with current token usage and threshold status
- Provides a multiline text input for custom condensation prompts
- Includes a number input for custom max tokens per condensed summary (50-1000 range)
- Applies custom settings to the NORMAL condensation process (not re-condensing existing ranges)
- Settings are session-only (temporary) and don't modify the script's base configuration

**UI Integration:**
- New "🔧 Condense With Settings" button in main panel (settings icon)
- Located in the main control section alongside other manual operations
- Modal displays placeholder text with {title} and {summaries} variables explained
- Clear "What This Does" section at top explaining the feature's behavior

**Technical Implementation:**
- `showCondensationSettingsModal()` - Displays custom settings modal
- `tempCondensePrompt` and `tempCondenseMaxTokens` stored in session storage
- `condenseSummaries()` checks for temp settings and uses them if present
- Triggers normal condensation flow via `checkAndCondenseIfNeeded()`

**Use Cases:**
- Testing different condensation strategies without editing script config
- Temporarily using more aggressive condensation when approaching token limits
- Experimenting with different prompt styles for better summary quality
- Quick adjustments without needing to reconfigure and reload the script

---

### 2. **Manual "Condense Range" Feature**
Enables users to manually select and condense specific chapter ranges, providing precise control over which chapters get consolidated.

**What It Does:**
- Opens a modal showing the highest available chapter number
- Provides number inputs for selecting start and end chapter numbers
- Validates the selected range (minimum 2 chapters required)
- Checks for overlaps with existing condensed ranges
- Condenses the selected chapters into a single lorebook entry

**UI Integration:**
- New "📦 Condense Range" button in main panel (folder-plus icon)
- Located next to "Condense With Settings" button
- Modal provides clear instructions and validation feedback
- Shows chapter count and warns about minimum requirements

**Technical Implementation:**
- `showManualCondenseModal()` - Displays range selection modal
- `manualCondenseRange()` - Executes the manual condensation
- Reads actual lorebook entries to determine highest chapter (prevents off-by-one errors)
- Parses entry.text first line for "Chapter N" or "Chapters N-M" patterns
- Validates range doesn't overlap with existing condensed ranges

**Use Cases:**
- Condensing specific story arcs or sections together
- Consolidating older chapters to make room for new detailed summaries
- Strategic token management for long-running stories
- Creating logical groupings that match story structure

---

### 3. **Improved Undo Overlap Prevention UX**
Enhanced the overlap detection system for undo operations to provide better user guidance without blocking actions.

**What It Does:**
- Detects when restoring a previously uncondensed range would overlap with existing ranges
- Disables the "Undo Last Uncondense" button when overlap would occur
- Displays a prominent warning message explaining the conflict
- Shows which specific range is causing the conflict
- Guides users to uncondense the conflicting range first

**UI Integration:**
- Warning box displayed at top of Condensed Ranges section when overlap detected
- Orange-highlighted border and background for visibility
- Disabled button shown with "(disabled - see warning above)" text
- Clear action instructions: "Uncondense the conflicting range below to enable undo"

**Technical Implementation:**
- Overlap detection moved from `undoLastUncondense()` to `buildCondensedRangesUI()`
- Pre-checks overlap before rendering the undo button
- Uses range overlap formula: `!(endA < startB || startA > endB)`
- Maintains defensive error handling in function itself

**Example Scenario:**
1. User condenses Chapters 1-3
2. User uncondenses all (undo data stored)
3. User condenses Chapters 1-4
4. Undo button disabled with message: "⚠️ Cannot restore Chapters 1-3 because it would overlap with Chapters 1-4"
5. User clicks "Uncondense" on Chapters 1-4 from the list
6. Undo button re-enables automatically
7. User can now restore original Chapters 1-3 range

---

## Bug Fixes

### 1. **Modal Clarity Enhancement**
**Problem:** The "Condense With Settings" modal was unclear about what it actually does - users thought it would re-condense existing condensed ranges.

**Solution:**
- Moved "What This Does" explanation section to the top of the modal
- Clarified that it triggers NORMAL condensation, not re-condensation of existing ranges
- Explained that it affects ALL chapter summaries in the lorebook
- Reduced excessive line spacing for better readability
- Added bullet points and horizontal rule for better visual structure

---

### 2. **Condense Range Off-By-One Error**
**Problem:** Users could select chapter numbers higher than actually existed (e.g., selecting chapter 5 when only 4 complete chapters existed).

**Solution:**
- Changed from using `chapters.length` to counting actual lorebook entries
- Queries `api.v1.lorebook.entries(lorebookCategoryId)` for real entry count
- Parses entry text to determine actual chapter numbers
- Prevents invalid range selection based on in-progress chapters

---

### 3. **Chapter Number Detection Failure**
**Problem:** "Could not determine chapter numbers from entries" error when trying to use Condense Range feature.

**Solution:**
- Changed from parsing `entry.displayName` (which includes full title like "Chapter 1: The Adventure")
- Now parses `entry.text` first line which has clean format: "Chapter N" or "Chapters N-M"
- Updated regex pattern: `/^Chapters?\s+(\d+)(?:-(\d+))?/`
- More robust detection that works with both individual and condensed entries

---

### 4. **Lorebook Entry Properties Inconsistency**
**Problem:** Some restored entries after uncondensing weren't using `forceActivation: true` and had incorrect `keys` arrays.

**Solution:**
- Fixed `uncondenseEntireRange()` to always use:
  - `forceActivation: true`
  - `keys: undefined`
  - `hidden: false`
  - `advancedConditions: undefined`
- Standardized entry creation across all functions
- Ensures all chapter summaries activate consistently

---

### 5. **Undo Operation Creating Duplicate Ranges**
**Problem:** Using "Condense Range" followed by "Undo Last Uncondense" could create overlapping condensed ranges, causing data corruption.

**Solution:**
- Added overlap detection to `undoLastUncondense()` function
- Checks if restoring a range would overlap with existing condensed ranges
- Instead of throwing error, moved detection to UI layer
- Disables undo button preemptively with helpful guidance message
- Prevents the issue before it occurs rather than handling errors after

---

## Technical Changes

### Configuration
No new configuration options added. New features use session-based temporary storage:
- `tempCondensePrompt` - Stored per-session for custom condensation prompts
- `tempCondenseMaxTokens` - Stored per-session for custom token limits

### New Functions
```typescript
showCondensationSettingsModal()      // Display custom settings UI
showManualCondenseModal()            // Display range selection UI
manualCondenseRange()                // Execute manual range condensation
```

### Modified Functions
```typescript
condenseSummaries()                  // Now checks for temp settings
buildCondensedRangesUI()            // Added overlap detection for undo
uncondenseEntireRange()             // Fixed entry properties
undoLastUncondense()                // Kept defensive overlap check
```

### Storage Schema
No changes to storage schema. Uses existing `storyStorage` keys:
- Reads: `condensedRanges`, `chapterFingerprints`, `lastUndoData`
- Writes: `tempCondensePrompt`, `tempCondenseMaxTokens` (session-only)

---

## Usage Tips

### When to Use "Condense With Settings"
- You want to test different condensation strategies without editing the script
- You're approaching your token limit and need more aggressive condensation temporarily
- You want to experiment with different summary styles
- You need a quick one-time adjustment without changing base configuration

### When to Use "Condense Range"
- You have a specific story arc that makes sense to group together (e.g., Chapters 5-8: "The Quest")
- You want to condense older chapters to make room for detailed summaries of recent chapters
- You're doing strategic token management for a long-running story
- You want logical groupings that match your story's structure

### Undo Overlap Prevention
- If undo is disabled, look for the orange warning box at the top of the Condensed Ranges section
- The message tells you exactly which range is conflicting
- Click "Uncondense" on the conflicting range from the list below
- Undo button will automatically re-enable once the conflict is resolved

---

## Breaking Changes
None. All changes are additive features and bug fixes.

---

## Known Issues
None at this time.

---

## Upgrade Notes
No special upgrade steps required. The script will work with existing lorebook entries and storage data from previous versions.

---

## Future Enhancements
Potential features for future versions:
- Ability to re-condense existing condensed ranges with different settings
- Batch uncondense operations (uncondense multiple ranges at once)
- Visual chapter map showing which chapters are condensed vs. detailed
- Condensation presets (conservative, balanced, aggressive)
- Token projection calculator ("if I condense chapters X-Y, I'll save Z tokens")

---

## Credits
Developed by Lane (LaneLearns)
NovelAI Script API Version: 1.x
Testing and feedback: NovelAI community

---

## Version History
- **v1.5.3** - Manual condensation controls (November 22, 2025)
- **v1.5.2** - Fixed automatic processing bypass and configuration modes (November 22, 2025)
- **v1.5.1** - Condensed ranges UI and management (November 2025)
- **v1.5.0** - Backup browser and retention system (November 2025)
- **v1.4.1** - Generation limits and token budget warnings (November 2025)
- **v1.4.0** - Auto-detection and auto-regeneration (November 2025)
- **v1.3.2** - Full rebuild improvements (October 2025)
- **v1.3.1** - Changed chapters UI improvements (October 2025)
- **v1.3.0** - Chapter fingerprinting and change detection (October 2025)

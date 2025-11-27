# Automatic Chapter Summaries v1.5.6 - Status Panel Fix

Hey NovelAI community!

Quick bug fix release for **v1.5.6** of the Automatic Chapter Summaries script.

## What's Fixed

### Status Panel Stuck on "Loading..."

Some users were seeing the Status Panel stuck on "Loading status...", "Loading...", "Loading..." even after the script successfully initialized. The logs showed everything was working, but the UI never updated.

**Before (v1.5.5):**
```
Loading status...
Loading...
Loading...
```

**After (v1.5.6):**
```
Token Usage:
✓ 450 / 2000 tokens (23%)

Summary Breakdown:
✓ Detailed: 5 chapter(s) - [1, 2, 3, 4, 5]

Status:
✓ Successfully summarized: 5 chapter(s)
✗ Failed summaries: 0
```

## Why This Happened

The NovelAI `updateParts` API silently fails during panel initialization. The previous approach registered the panel with placeholder "Loading..." text, then tried to update it immediately. The updates were being ignored.

**The fix:** Build all the real content *before* registering the panel, so it shows actual data from the start.

## Also Fixed

- **Permission check workaround**: NovelAI's `has()` API was returning false even when permissions were granted. Now using `list()` as a workaround.
- **Startup timing issues**: Added retry logic for cases where NovelAI's permission system isn't ready when the script first loads.

## Installation

1. Copy the script from the GitHub repo
2. Paste into NovelAI's script editor
3. Save and reload

All your existing data (fingerprints, condensed ranges, backups) is fully compatible.

## Links

- **GitHub Repo:** [AutomaticChapterSummaries](https://github.com/LaneRendell/AutomaticChapterSummaries)
- **Full Changelog:** See CHANGELOG_v1.5.6.md

## Version History

- **v1.5.6** - Status panel initialization fix (current)
- **v1.5.5** - API compatibility update (modal async)
- **v1.5.4** - Permissions system integration
- **v1.5.3** - Manual condensation controls
- **v1.5.2** - Fixed automatic processing and configuration modes

Happy writing!

---

*Automatic Chapter Summaries uses NovelAI's Script API to automatically generate, manage, and condense chapter summaries as you write, keeping your lorebook organized and your token budget under control.*

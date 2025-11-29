# Automatic Chapter Summaries v1.6.0 - History-Aware Tracking

Hey NovelAI community!

Excited to announce **v1.6.0** of the Automatic Chapter Summaries script with a major new feature: **History-Aware Tracking**!

## What's New

### History-Aware Tracking

Ever hit undo after the AI generated a new chapter and found yourself with an orphaned summary in your lorebook? Or redo'd back and the summary was gone? Those days are over!

**How it works:**
- **Undo** past a chapter break? The summary is automatically removed
- **Redo** to restore a chapter break? The summary comes back from cache
- Works with undo, redo, retry, and history tree jumps

The script now tracks your complete chapter state at each history node, so your lorebook stays perfectly in sync with your story no matter how much you navigate your history.

**Enabled by default** - just update and it works!

## Bug Fixes

### Rebuild No Longer Counts In-Progress Chapter
Previously, "Rebuild All Summaries" would try to summarize the chapter you're currently writing. With 3 chapter breaks (3 complete chapters), it was trying to process 4. Now it correctly only rebuilds complete chapters.

### Backup Works on New Stories
Fixed an error when creating backups on brand new stories with no content:
```
Backup failed: cannot read property 'length' of undefined
```

### Condensed Ranges Work After Redo
Previously, after using redo to restore chapter summaries, uncondense operations could fail because the metadata had stale entry IDs. Now the script updates entry IDs correctly after history restoration.

## Installation

1. Copy the script from the GitHub repo
2. Paste into NovelAI's script editor
3. Save and reload

All your existing data (fingerprints, condensed ranges, backups) is fully compatible.

## Configuration

New option in script settings:
- **History-Aware Tracking** (default: ON) - Automatically manage summaries on undo/redo

## Links

- **GitHub Repo:** [AutomaticChapterSummaries](https://github.com/LaneRendell/AutomaticChapterSummaries)
- **Full Changelog:** See CHANGELOG_v1.6.0.md

## Version History

- **v1.6.0** - History-aware tracking (current)
- **v1.5.6** - Status panel initialization fix
- **v1.5.5** - API compatibility update (modal async)
- **v1.5.4** - Permissions system integration
- **v1.5.3** - Manual condensation controls

Happy writing!

---

*Automatic Chapter Summaries uses NovelAI's Script API to automatically generate, manage, and condense chapter summaries as you write, keeping your lorebook organized and your token budget under control.*

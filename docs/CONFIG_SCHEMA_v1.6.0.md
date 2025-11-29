# Configuration Schema for v1.6.0

This document describes the configuration options that need to be added to the NovelAI script configuration UI.

## New in v1.6.0

### history_aware_tracking
- **Type**: `boolean`
- **Default**: `true`
- **Label**: "History-Aware Tracking"
- **Description**: "Automatically manage chapter summaries when using undo/redo. When enabled, undoing a chapter break will remove the orphaned summary, and redoing will restore the cached summary."
- **Section**: "Advanced Options"
- **Details**:
  - Uses the `onHistoryNavigated` hook to detect undo/redo/retry/jump operations
  - When undo removes a chapter break: automatically removes the orphaned summary from lorebook
  - When redo restores a chapter break: restores the cached summary from historyStorage
  - Uses `api.v1.historyStorage` to persist chapter state per history node
  - Cached summaries are stored per history node for accurate restoration on redo
  - Requires `lorebookEdit` permission to modify lorebook entries

## Complete Config Schema Reference

For reference, here are all configuration options used by this script:

### Core Settings
- `chapter_break_token` (string) - Token used to split chapters (e.g., "***")
- `lorebook_category` (string) - Name of lorebook category for summaries
- `summarize_scene_breaks` (boolean) - Summarize all breaks or require chapter titles
- `summary_max_tokens` (number) - Max tokens per individual summary
- `summary_prompt_string` (string) - Prompt template for AI summary generation

### Token Management
- `max_total_summary_tokens` (number) - Total token budget for all summaries
- `condensation_threshold` (number) - Percentage threshold to trigger condensation
- `recent_chapters_to_keep` (number) - How many recent chapters to keep uncondensed
- `chapters_per_condensed_group` (number) - Chapters per condensed group

### Rebuild Settings
- `max_rebuild_backups` (number, default: 3) - Maximum number of rebuild backups to retain

### Auto-Detection (v1.4.0)
- `auto_detect_on_generation` (boolean, default: false) - Auto-detect changed chapters after generation
- `auto_regenerate` (boolean, default: false) - Auto-regenerate changed chapters

### History (v1.6.0)

- `history_aware_tracking` (boolean, default: true) - **NEW** - Manage summaries on undo/redo

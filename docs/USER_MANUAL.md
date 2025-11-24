# Automatic Chapter Summaries - User Manual

**Version:** 1.5.3  
**Last Updated:** November 22, 2025  
**Author:** Lane (LaneLearns)

---

## Table of Contents
1. [Introduction](#introduction)
2. [What This Script Does](#what-this-script-does)
3. [Installation & Setup](#installation--setup)
4. [Configuration Options](#configuration-options)
5. [Understanding the UI](#understanding-the-ui)
6. [Core Features](#core-features)
7. [Token Management System](#token-management-system)
8. [Manual Controls](#manual-controls)
9. [Change Detection & Regeneration](#change-detection--regeneration)
10. [Backup & Restore System](#backup--restore-system)
11. [Advanced Usage](#advanced-usage)
12. [Troubleshooting](#troubleshooting)
13. [Best Practices](#best-practices)
14. [FAQ](#faq)

---

## Introduction

Automatic Chapter Summaries is a NovelAI script that automatically generates, manages, and condenses chapter summaries as you write your story. It helps you maintain a comprehensive lorebook of your story's events while intelligently managing your token budget through automatic condensation.

### Key Benefits
- **Automatic summarization** of completed chapters using AI
- **Token budget management** with multi-level condensation
- **Change detection** to track edited chapters
- **Manual controls** for fine-tuned condensation
- **Backup system** for safe rebuilds and recovery
- **Flexible configuration** to match your writing style

---

## What This Script Does

### Basic Workflow
1. **Detect Chapter Breaks**: Monitors your document for chapter break tokens (e.g., `***`)
2. **Generate Summaries**: When a chapter is complete, generates an AI summary
3. **Store in Lorebook**: Creates lorebook entries with chapter summaries
4. **Track Changes**: Detects when you edit previously summarized chapters
5. **Manage Tokens**: Automatically condenses older summaries when approaching token limits
6. **Provide Controls**: Gives you manual tools to manage all aspects of the system

### How It Works
- **Chapter Detection**: When you write a chapter break token (like `***`) on its own line, the script recognizes that the previous chapter is complete
- **Automatic Summary**: After generation completes, the script uses GLM (or your configured model) to create a concise summary
- **Lorebook Entry**: The summary is stored as a lorebook entry in your configured category
- **Fingerprinting**: The script stores a hash of the chapter text to detect future edits
- **Token Monitoring**: Continuously tracks total summary tokens against your configured budget
- **Smart Condensation**: When approaching limits, condenses older summaries while keeping recent ones detailed

---

## Installation & Setup

### Prerequisites
- Active NovelAI subscription
- Access to the scripting feature
- Basic familiarity with NovelAI's interface

### Installation Steps

1. **Copy the Script**
   - Download `Automatic_Chapter_Summaries_v1.5.3.ts` from the GitHub repository
   - Or copy the raw script content

2. **Open NovelAI Script Editor**
   - Navigate to the scripting section in NovelAI
   - Create a new script

3. **Paste the Script**
   - Paste the entire script content into the editor
   - Save the script

4. **Configure Settings** (see [Configuration Options](#configuration-options))
   - Set your chapter break token (e.g., `***`)
   - Set lorebook category name (e.g., `Chapter Summaries`)
   - Adjust other settings to your preferences

5. **Activate the Script**
   - Enable the script in NovelAI
   - The script will initialize and create the lorebook category if needed

6. **Verify Setup**
   - Open the "Chapter Summaries v1.5.3" panel in NovelAI
   - Check that status displays correctly
   - Write a test chapter and verify summarization works

---

## Configuration Options

All configuration is done through NovelAI's script configuration interface. Here are all available options:

### Core Settings

#### `chapter_break_token` (string)
- **Purpose**: The token that marks chapter breaks in your story
- **Default**: `***`
- **Examples**: `***`, `---`, `===`, `# # #`
- **Usage**: Must be on its own line to be recognized
- **Tips**: Choose something you won't use in regular prose

#### `lorebook_category` (string)
- **Purpose**: Name of the lorebook category where summaries are stored
- **Default**: `Chapter Summaries`
- **Usage**: The script will create this category automatically if it doesn't exist
- **Tips**: Use a descriptive name you won't confuse with other categories

#### `summarize_scene_breaks` (boolean)
- **Purpose**: Controls what triggers summarization
- **Default**: `true`
- **Options**:
  - `true`: Every chapter break creates a summary (auto-numbered)
  - `false`: Only breaks followed by `[Chapter Title]` on the next line create summaries
- **Example** (when false):
  ```
  ***
  [Chapter 5: The Quest Begins]
  ```

### Summary Generation Settings

#### `summary_max_tokens` (number)
- **Purpose**: Maximum tokens per individual chapter summary
- **Default**: `150`
- **Range**: `50` - `500` (recommended)
- **Usage**: Controls how detailed each summary is
- **Tips**: 
  - Higher = more detail but more tokens
  - Lower = more concise but less context
  - 100-200 is optimal for most stories

#### `summary_prompt_string` (string)
- **Purpose**: The prompt template used to generate summaries
- **Default**: "Summarize the following chapter concisely, focusing on key events, character developments, and plot progression:"
- **Variables**: 
  - `{title}`: Chapter title (if available)
  - `{text}`: Chapter content
- **Tips**: Customize to emphasize what matters in your story (characters, plot, worldbuilding, etc.)

### Token Management Settings

#### `max_total_summary_tokens` (number)
- **Purpose**: Total token budget for ALL chapter summaries
- **Default**: `3000`
- **Range**: `1000` - `10000` (recommended)
- **Usage**: When total summaries exceed this, condensation triggers
- **Tips**:
  - Higher = more chapters with detailed summaries
  - Lower = more aggressive condensation
  - Consider your total context budget

#### `condensation_threshold` (number)
- **Purpose**: Percentage of budget that triggers condensation warning
- **Default**: `80` (meaning 80%)
- **Range**: `50` - `95`
- **Usage**: 
  - At 80% of `max_total_summary_tokens`, warnings appear
  - At 100%, automatic condensation triggers
- **Tips**: Lower threshold = earlier warnings and proactive management

#### `recent_chapters_to_keep` (number)
- **Purpose**: How many recent chapters to keep uncondensed
- **Default**: `5`
- **Range**: `1` - `20` (recommended)
- **Usage**: During condensation, this many recent chapters stay detailed
- **Tips**: 
  - Higher = more context for current story events
  - Lower = more aggressive token savings
  - Consider your story's callback frequency

#### `chapters_per_condensed_group` (number)
- **Purpose**: How many chapters to combine when condensing
- **Default**: `3`
- **Range**: `2` - `10` (recommended)
- **Usage**: Older chapters are grouped into ranges of this size
- **Example**: With `3`, chapters 1-3 become "Chapters 1-3" summary
- **Tips**: Higher = fewer entries but less granularity

### Rebuild & Backup Settings

#### `max_rebuild_backups` (number)
- **Purpose**: Maximum number of backup copies to keep
- **Default**: `5`
- **Range**: `1` - `20`
- **Usage**: When doing full rebuilds, old backups are pruned
- **Tips**: Higher = more recovery options but more storage

### Automation Settings (v1.4.0+)

#### `auto_detect_on_generation` (boolean)
- **Purpose**: Automatically detect changed chapters after you generate text
- **Default**: `false`
- **Usage**: 
  - `true`: Script checks for edits every time you generate
  - `false`: You manually use "Check for Changes" button
- **Tips**: Enable if you frequently edit past chapters

#### `auto_regenerate` (boolean)
- **Purpose**: Automatically regenerate summaries for detected changes
- **Default**: `false`
- **Requires**: `auto_detect_on_generation` must be `true`
- **Usage**:
  - `true`: Script auto-regenerates changed chapters (respects 5-generation limit)
  - `false`: Script notifies you but waits for manual action
- **Tips**: Enable for fully hands-off experience, disable for more control

### Configuration Modes

Based on your `auto_detect_on_generation` and `auto_regenerate` settings:

| Auto-Detect | Auto-Regenerate | Behavior |
|-------------|-----------------|----------|
| OFF | OFF | Fully manual - use buttons to detect and regenerate |
| ON | OFF | Auto-detects changes, shows notification, you choose when to regenerate |
| ON | ON | Fully automatic - detects and regenerates changes automatically |

---

## Understanding the UI

When you open the "Chapter Summaries v1.5.3" panel, you'll see several sections:

### Status Display (Top Box)

```
**Token Usage:**
✓ 1250 / 3000 tokens (42%)

**Summary Breakdown:**
✓ Detailed: 5 chapter(s) - [8, 9, 10, 11, 12]
📦 Condensed: 2 entry(s)

**Status:**
✓ Successfully summarized: 12 chapter(s)
✗ Failed summaries: 0
```

**What It Shows:**
- **Token Usage**: Current tokens vs. budget with percentage
  - ✓ = Under threshold (green)
  - ⚠️ = Over threshold (warning)
  - ❌ = Over budget (critical)
- **Summary Breakdown**: How many detailed vs. condensed entries
- **Success/Failure Counts**: Track of processing status

### Main Control Buttons

#### "🔍 Check for Changes"
- **Purpose**: Manually scan all chapters for edits
- **When to Use**: 
  - After pasting story updates
  - After editing past chapters
  - When `auto_detect_on_generation` is OFF
- **What Happens**: Compares current chapter text to stored fingerprints

#### "🔧 Condense With Settings" (v1.5.3)
- **Purpose**: Re-condense summaries with custom prompt/tokens
- **When to Use**:
  - Testing different condensation strategies
  - Need more aggressive condensation temporarily
  - Want different summary style
- **What Happens**: Opens modal for custom settings, applies to normal condensation

#### "📦 Condense Range" (v1.5.3)
- **Purpose**: Manually condense specific chapter range
- **When to Use**:
  - Consolidating story arcs
  - Strategic token management
  - Creating logical groupings
- **What Happens**: Opens modal to select start/end chapters, condenses them

#### "🔄 Full Rebuild"
- **Purpose**: Regenerate ALL chapter summaries from scratch
- **When to Use**:
  - Changed summary prompt and want to reapply
  - Recovering from errors
  - Major story edits
- **What Happens**: Creates backup, regenerates all chapters

#### "💾 View/Restore Backups"
- **Purpose**: Browse and restore previous backup states
- **When to Use**:
  - Recovery after bad rebuild
  - Reviewing past states
  - Undoing unwanted changes
- **What Happens**: Shows list of backups with restore option

### Changed Chapters Section

```
**📝 Changed Chapters (2)**

Chapter 5: The Quest
- Changed 15m ago
- Current: abc123, Stored: def456
[Regenerate] [Dismiss]

Chapter 8: The Battle
- Changed 30m ago
- Current: xyz789, Stored: uvw012
[Regenerate] [Dismiss]

Actions:
[Regenerate All] [Dismiss All]
```

**What It Shows:**
- List of chapters detected as changed
- Hash comparison (current vs. stored)
- Time since change detected
- Per-chapter and bulk actions

**Button Actions:**
- **Regenerate**: Regenerate that chapter's summary
- **Dismiss**: Mark as reviewed, remove from list
- **Regenerate All**: Process all changed chapters in batch
- **Dismiss All**: Clear entire changed list

### Condensed Ranges Section (v1.5.1+)

```
**📦 Condensed Ranges (2)**

[⏪ Undo Last Uncondense]

Chapters 1-3
📊 Token savings: 312 tokens
📅 Condensed: 2 days ago
📚 Original summaries: 3
[View Details] [Uncondense]

Chapters 4-6
📊 Token savings: 298 tokens
📅 Condensed: 2 days ago
📚 Original summaries: 3
[View Details] [Uncondense]
```

**What It Shows:**
- All currently condensed chapter ranges
- Token savings per range
- When condensed
- Number of original summaries

**Button Actions:**
- **Undo Last Uncondense**: Restore most recently uncondensed range
- **View Details**: See full condensed summary and original summaries
- **Uncondense**: Restore detailed summaries for that range

**Overlap Warning** (v1.5.3):
```
⚠️ **Undo Blocked:** Cannot restore Chapters 1-3 because it 
would overlap with Chapters 1-4. Uncondense the conflicting 
range below to enable undo.
```

### Failed Chapters Section

```
**Failed Chapters:**
- Chapter 7: 2 attempt(s), 5m ago
  Error: Generation timeout...
[Retry Failed Chapters] [Clear Failed Records]
```

**What It Shows:**
- Chapters that failed to generate summaries
- Number of retry attempts
- Last error message

**Button Actions:**
- **Retry Failed Chapters**: Attempt to regenerate all failed chapters
- **Clear Failed Records**: Remove from list (doesn't delete summaries)

### Debug Section (DEBUG_MODE only)

Only visible when `DEBUG_MODE = true` in the script. Provides testing tools for developers.

---

## Core Features

### Automatic Chapter Summarization

**How It Works:**
1. You write your chapter
2. You add chapter break token (`***`) on its own line
3. You continue writing or generate text
4. Script detects completed chapter
5. Script generates summary using AI
6. Summary stored in lorebook with chapter number

**Chapter Format:**

**With `summarize_scene_breaks = true`:**
```
Chapter content here...
***
Next chapter content...
```
- Creates: "Chapter 1", "Chapter 2", etc. (auto-numbered)

**With `summarize_scene_breaks = false`:**
```
Chapter content here...
***
[Chapter 2: The Journey Begins]
Next chapter content...
```
- Creates: "Chapter 2: The Journey Begins" (uses title)
- Breaks without titles are ignored

**Lorebook Entry Format:**
```
Chapter 5
Type: chapter
Title: The Quest Begins
Summary: [AI-generated summary here]
```

**Entry Settings:**
- `forceActivation: true` - Always active in context
- `keys: undefined` - No keyword triggers
- `hidden: false` - Visible in lorebook
- `enabled: true` - Active

### Fingerprinting & Change Detection

**What Is Fingerprinting?**
- When a summary is created, the script stores a hash of the chapter text
- Hash is like a unique fingerprint for that exact text
- If you edit the chapter, the fingerprint changes
- Script can detect changes by comparing current vs. stored hash

**How to Detect Changes:**

**Manual Detection:**
1. Click "🔍 Check for Changes" button
2. Script scans all chapters
3. Compares current text to stored fingerprints
4. Lists changed chapters in Changed Chapters section

**Automatic Detection** (if `auto_detect_on_generation = true`):
1. You generate text
2. Script automatically checks for changes
3. Shows notification in status display
4. Populates Changed Chapters section

**What Happens to Changed Chapters:**
- Listed in Changed Chapters UI section
- Shows both hashes for comparison
- Timestamp of when change detected
- Can regenerate individually or in batch
- Can dismiss if change was intentional and doesn't need new summary

**Special Case - Condensed Chapters:**
- If you edit a chapter that's part of a condensed range
- Script marks entire range as changed
- You need to uncondense first, then regenerate individual chapters

---

## Token Management System

### How Token Budget Works

**Token Tracking:**
- Script continuously monitors total tokens across all summary entries
- Counts tokens in both detailed summaries and condensed summaries
- Compares against your `max_total_summary_tokens` budget

**Status Levels:**
- **Under Threshold** (e.g., < 80%): ✓ Green, no action needed
- **Over Threshold** (e.g., > 80%): ⚠️ Warning, condensation recommended
- **Over Budget** (> 100%): ❌ Critical, automatic condensation triggers

### Condensation Levels

The script uses a three-level condensation system:

#### Level 1: Normal Condensation
**Triggers:** Token usage exceeds budget
**What It Does:**
- Keeps `recent_chapters_to_keep` chapters detailed (e.g., last 5)
- Groups older chapters into ranges of `chapters_per_condensed_group` (e.g., 3)
- Creates condensed summaries: "Chapters 1-3", "Chapters 4-6", etc.
- Stores original summaries as archived backups

**Example:**
- 12 total chapters
- Keep last 5 detailed (chapters 8-12)
- Condense older 7 chapters
- Result: "Chapters 1-3" (condensed), "Chapters 4-6" (condensed), Chapter 7 (condensed), Chapters 8-12 (detailed)

#### Level 2: Aggressive Condensation
**Triggers:** Normal condensation didn't free enough tokens
**What It Does:**
- Expands existing condensed ranges with adjacent summaries
- Creates larger consolidated ranges
- Example: "Chapters 1-3" + "Chapters 4-6" → "Chapters 1-6"

#### Level 3: Emergency Condensation
**Triggers:** Aggressive condensation still insufficient
**What It Does:**
- Condenses even the most recent chapters
- Only keeps last 2 chapters detailed
- Maximum token savings mode

### Condensation Prompt

**Default Prompt:**
```
Summarize the following chapters together. Focus on the most important 
events and developments across this entire section. Be extremely concise.

{title}

Original Summaries:
{summaries}
```

**Variables:**
- `{title}`: e.g., "Chapters 1-3"
- `{summaries}`: All original summaries concatenated

**Token Target:**
- Condensed summaries target fewer tokens than original
- Typically 30-50% of original combined tokens

### Archived Summaries

**What Are Archives?**
- When chapters are condensed, original detailed summaries are saved
- Stored in `storyStorage` with metadata
- Can be restored via "Uncondense" feature
- Not deleted, just replaced in active lorebook

**Archive Metadata:**
```typescript
{
  chapterNumber: 1,
  originalText: "Detailed summary...",
  originalTitle: "Chapter 1: The Beginning",
  tokens: 150,
  condensedAt: [timestamp]
}
```

---

## Manual Controls

### Manual Condensation (v1.5.3)

#### Condense With Settings

**Purpose:** Re-condense existing summaries with custom prompt and token settings without editing script configuration.

**How to Use:**
1. Click "🔧 Condense With Settings" button
2. Modal opens showing:
   - Current token usage and threshold
   - Multiline text input for custom condensation prompt
   - Number input for max tokens (50-1000)
3. Customize prompt:
   - Use `{title}` for chapter range (e.g., "Chapters 1-3")
   - Use `{summaries}` for original summaries
4. Set max tokens for condensed summaries
5. Click "Apply Custom Settings"
6. Script triggers normal condensation with your custom settings

**Example Use Case:**
```
Current situation: 2400 / 3000 tokens (80%)
Goal: More aggressive condensation to free up space

Custom Prompt:
"Create an ultra-concise summary covering these chapters. 
Focus only on critical plot points. {title}: {summaries}"

Max Tokens: 75 (instead of default 150)

Result: Re-condenses all chapters with shorter summaries
```

**Important Notes:**
- Settings are session-only (not saved permanently)
- Applies to NORMAL condensation process (all summaries)
- Does NOT re-condense existing condensed ranges
- To revert, just close script and reopen (settings cleared)

#### Condense Range

**Purpose:** Manually select and condense specific chapter range, useful for strategic token management.

**How to Use:**
1. Click "📦 Condense Range" button
2. Modal shows highest available chapter number
3. Enter start chapter number (e.g., 5)
4. Enter end chapter number (e.g., 8)
5. Script validates:
   - Minimum 2 chapters required
   - No overlap with existing condensed ranges
   - Valid chapter numbers
6. Click "Condense Range"
7. Selected chapters condensed into single entry

**Example Use Case:**
```
Current summaries:
- Chapter 1-4: Individual detailed summaries
- Chapter 5-8: Story arc "The Quest"
- Chapter 9-12: Recent chapters, detailed

Action: Manually condense chapters 5-8
Reason: Logical grouping + token savings
Result: "Chapters 5-8" condensed, others unchanged
```

**Validation Errors:**
- "Minimum 2 chapters required" - Can't condense single chapter
- "Overlaps with existing range" - Conflicts with already condensed chapters
- "Invalid chapter numbers" - Start > End or chapters don't exist

### Uncondensing

**Purpose:** Restore detailed summaries from a condensed range.

**How to Use:**
1. Find range in Condensed Ranges section
2. Click "View Details" to preview (optional)
3. Click "Uncondense" button
4. Confirmation modal shows:
   - Token impact (+X tokens, +Y%)
   - Warning if over budget
5. Confirm uncondense
6. Detailed summaries restored to lorebook
7. Undo data stored for potential undo

**What Happens:**
- Condensed entry deleted from lorebook
- Original archived summaries restored
- Fingerprints updated
- Token count increases
- Undo option becomes available

**Token Impact Example:**
```
Current: 2400 / 3000 tokens (80%)
Uncondense "Chapters 1-3":
- Remove condensed summary: -100 tokens
- Restore 3 detailed summaries: +450 tokens
- Net impact: +350 tokens
Result: 2750 / 3000 tokens (92%)
```

**Undo Last Uncondense:**
- Appears after uncondensing
- Click "⏪ Undo Last Uncondense"
- Restores the condensed version
- Removes detailed summaries
- Only available for most recent uncondense
- Disabled if overlap would occur (v1.5.3)

---

## Change Detection & Regeneration

### Manual Change Detection

**When to Use:**
- After pasting story updates from external editor
- After making significant edits to past chapters
- When `auto_detect_on_generation` is OFF

**Steps:**
1. Click "🔍 Check for Changes"
2. Script scans all chapters
3. Compares current text hashes to stored fingerprints
4. Populates Changed Chapters section
5. Review list and decide action

**Changed Chapter Information:**
- Chapter number and title
- Time since change detected
- Current hash vs. stored hash (for debugging)
- Individual action buttons

### Automatic Change Detection (v1.4.0)

**Enable:** Set `auto_detect_on_generation = true`

**How It Works:**
1. You generate text in NovelAI
2. After generation completes, script auto-checks
3. Detects any edited chapters
4. Shows notification in status display
5. Populates Changed Chapters section

**Generation Limit:**
- NovelAI limits scripts to 5 non-interactive generations
- Script tracks this counter
- At 4 generations, shows warning modal
- You can continue (hit limit) or cancel
- Counter resets when you manually generate text

**Notification Example:**
```
**Auto-Detection:**
Auto-detected 2 changed chapters
Last check: 3m ago
```

### Regenerating Summaries

**Individual Regeneration:**
1. Find chapter in Changed Chapters section
2. Click "Regenerate" button
3. Script generates new summary
4. Fingerprint updated
5. Chapter removed from changed list

**Batch Regeneration:**
1. Click "Regenerate All" in Changed Chapters section
2. Script processes all changed chapters sequentially
3. Progress shown in UI
4. Respects 5-generation limit

**Automatic Regeneration:**
- Enable: Set `auto_regenerate = true` (requires `auto_detect_on_generation = true`)
- Script automatically regenerates detected changes
- Still respects generation limit
- Shows completion notification

### Dismissing Changes

**When to Dismiss:**
- You edited a chapter but summary is still accurate
- Change was minor (typo, formatting)
- You manually updated the lorebook entry already

**How to Dismiss:**
- **Individual:** Click "Dismiss" button for that chapter
- **Batch:** Click "Dismiss All" to clear entire list

**Effect:** Removes from changed list, doesn't regenerate, doesn't update fingerprint

---

## Backup & Restore System

### Rebuild Backups (v1.5.0)

**What Are Rebuild Backups?**
- Complete snapshots of your chapter summaries state
- Created before full rebuilds
- Include: lorebook entries, fingerprints, condensed ranges, metadata
- Stored in `storyStorage`
- Pruned to `max_rebuild_backups` limit (default: 5)

**When Backups Are Created:**
- Before "Full Rebuild" operation
- Manually via "Create Test Backup" (DEBUG_MODE)
- Automatically before major operations

**Backup Contents:**
```typescript
{
  timestamp: "2025-11-22T10:30:00.000Z",
  entries: [...],           // All lorebook entries
  fingerprints: [...],      // All chapter fingerprints
  condensedRanges: [...],   // Condensed range metadata
  changedChapters: [...],   // Changed chapter list
  failedChapters: [...],    // Failed chapter records
  lastProcessedCount: 12,   // Chapters processed
  chapterCount: 12,         // Total chapters
  totalTokens: 2400         // Token count
}
```

### Viewing Backups

**Steps:**
1. Click "💾 View/Restore Backups" button
2. Modal shows list of backups with:
   - Timestamp
   - Chapter count
   - Token count
   - Actions: [View Details] [Restore]

**View Details:**
1. Click "View Details" for a backup
2. Comprehensive modal shows:
   - All lorebook entries with full text
   - Token count per entry
   - Metadata: fingerprints, changed chapters, etc.
   - Condensed ranges information
3. Can copy text manually if needed

### Restoring Backups

**When to Restore:**
- Full rebuild went wrong
- Need to revert to earlier state
- Testing different configurations
- Recovery from errors

**Steps:**
1. Click "View/Restore Backups"
2. Find backup to restore
3. Click "Restore" button
4. Confirmation modal warns about overwriting current state
5. Confirm restore
6. Script:
   - Deletes all current entries in category
   - Restores all entries from backup
   - Restores metadata (fingerprints, condensed ranges)
   - Updates status display

**Important:** Restore overwrites current state completely. Consider creating a backup first if you want to preserve current state.

---

## Advanced Usage

### Full Rebuild

**Purpose:** Regenerate all chapter summaries from scratch.

**When to Use:**
- Changed summary prompt and want to reapply to all chapters
- Recovering from corrupted state
- Made major story edits
- Want to start fresh

**Steps:**
1. Click "🔄 Full Rebuild" button
2. Warning modal explains what will happen
3. Confirm rebuild
4. Script:
   - Creates backup of current state
   - Renames category to "(Backup [timestamp])"
   - Creates new "(Rebuilding)" category
   - Determines actions for each chapter:
     - **Reuse:** Chapter unchanged, copy from backup
     - **Regenerate:** Chapter changed, generate new summary
     - **Generate:** New chapter, create summary
   - Processes all chapters
   - Finalizes: deletes backup, renames rebuilding → original
   - Updates status

**Progress Display:**
```
**Rebuild Progress:**
Processing chapter 5 of 12...
Status: Generating new summary
```

**Rollback on Error:**
- If error occurs during rebuild
- Script automatically rolls back
- Restores backup category
- Deletes incomplete rebuilding category
- No data loss

### Generation Counter & Limits

**NovelAI Constraint:**
- Scripts limited to 5 non-interactive generations
- Prevents runaway generation loops
- Counter resets on user actions

**How Script Handles It:**
- Tracks `generationCounter` variable
- Increments on each generation
- At 4 generations, shows warning modal:
  ```
  You've reached 4 out of 5 non-interactive generations.
  Continue? (Will hit limit)
  [Continue] [Cancel]
  ```
- Resets counter:
  - When user generates text
  - Before batch operations
  - At start of major features

**Best Practice:**
- Don't chain multiple automatic operations
- Let counter reset between operations
- Generate text manually to reset if needed

### Condensed Range Management

**Understanding Ranges:**
- Each range has: start chapter, end chapter, condensed text
- Archived summaries stored separately
- Metadata tracks: tokens, date, original count

**Splitting Ranges** (Uncondensing):
- Uncondense middle chapter of range splits it
- Example: Uncondense chapter 2 from "Chapters 1-3"
- Result:
  - "Chapter 1" (detailed or condensed)
  - "Chapter 2" (detailed)
  - "Chapter 3" (detailed or condensed)

**Single-Chapter Condensation:**
- Only happens during splits
- Automatic condensation requires minimum 2 chapters
- Prevents token bloat when uncondensing

### Failed Chapter Recovery

**Why Chapters Fail:**
- Generation timeout
- API errors
- Concurrent generation errors
- Token limit errors

**Tracking Failures:**
- Script stores: chapter number, attempts, last error, timestamp
- Displayed in Failed Chapters section

**Recovery Steps:**
1. Review failed chapters in status display
2. Click "Retry Failed Chapters"
3. Script attempts regeneration for each
4. Success/failure count shown
5. Successful chapters removed from failed list
6. Still-failing chapters remain with updated attempts

**Clearing Failed Records:**
- Doesn't affect summaries
- Just clears tracking list
- Use when errors are no longer relevant

---

## Troubleshooting

### Common Issues

#### "Non-interactive generation limit reached (5 calls)"

**Cause:** Hit NovelAI's 5-generation script limit

**Solutions:**
1. Generate text manually in editor (resets counter)
2. Wait for operations to complete before starting new ones
3. Don't chain multiple automatic operations
4. Enable `auto_regenerate` carefully with large change sets

#### "Could not determine chapter numbers from entries"

**Cause:** Lorebook entries don't match expected format

**Solutions:**
1. Check entry text starts with "Chapter N" or "Chapters N-M"
2. Verify entries in correct category
3. Try "Full Rebuild" to regenerate all entries
4. Check for manual edits to entry format

#### Chapter summaries not generating

**Possible Causes & Solutions:**

**1. Chapter break not recognized:**
- Ensure break token is on its own line
- Check `chapter_break_token` config matches what you're using
- Try adding blank lines around break token

**2. summarize_scene_breaks = false:**
- Requires `[Chapter Title]` on line after break
- Format: `***\n[Chapter 5: Title]`
- Change config to `true` for auto-numbered chapters

**3. Chapter already has fingerprint:**
- Check if summary already exists in lorebook
- May have been generated in previous session
- Use "Check for Changes" to detect edits

**4. Editor not ready:**
- Script waits for editor before generating
- Try generating text manually first
- Check for concurrent generation warnings

#### Token count seems wrong

**Possible Causes & Solutions:**

**1. Condensed entries not counted:**
- Check regex pattern matches "Chapters" (plural)
- Fixed in v1.4.1 with improved regex
- Try "Full Rebuild" if using older version

**2. Manual edits to entries:**
- Script counts tokens from entry text
- Manual edits may change count
- Regenerate entries to sync

**3. Wrong tokenizer:**
- Script uses model specified in generation
- Ensure using same model consistently
- Check generation parameters

#### Uncondense creates wrong chapter numbers

**Cause:** Bug in earlier versions (fixed in v1.5.1)

**Solution:**
- Upgrade to v1.5.3
- Use "Full Rebuild" to fix numbering
- Check entry text format

#### Undo button disabled (v1.5.3)

**Cause:** Restoring would overlap with existing range

**What to Do:**
1. Look for orange warning box in Condensed Ranges section
2. Note which range is conflicting
3. Click "Uncondense" on conflicting range
4. Undo button will re-enable automatically
5. Now safe to undo

**Example:**
```
⚠️ Cannot restore Chapters 1-3 because it would 
overlap with Chapters 1-4. Uncondense that range first.

Current ranges:
- Chapters 1-4 [Uncondense] ← Click this first
```

### Debug Mode

**Enabling:**
- Open script file
- Find `const DEBUG_MODE: boolean = false;`
- Change to `const DEBUG_MODE: boolean = true;`
- Save and reload script

**What It Provides:**
- Detailed console logging
- Additional testing buttons in UI
- Fingerprint refresh utility
- Category management testing
- Backup creation/viewing
- Regeneration testing

**Console Logs:**
- Chapter detection details
- Hash comparisons
- API call results
- Error stack traces
- Token calculations
- Generation parameters

**Use When:**
- Troubleshooting issues
- Understanding script behavior
- Developing features
- Reporting bugs

---

## Best Practices

### Chapter Break Hygiene

**Good Practices:**
```
End of chapter text here.

***

Start of next chapter.
```

**What To Avoid:**
```
Text here *** more text     ❌ (inline)
***text here                ❌ (no spacing)
   ***                      ✓ (whitespace OK)
```

### Token Budget Planning

**Consider:**
- Total context limit: 8192 tokens (varies by tier)
- Reserve space for: story text, lorebook, author's note
- Summary budget recommendation: 20-30% of total
- Example: 3000 tokens for summaries leaves 5000+ for content

**Budget By Story Length:**
- **Short (<50k words):** 1000-2000 tokens
- **Medium (50-150k words):** 2000-4000 tokens
- **Long (150k+ words):** 4000-8000 tokens

### When to Condense Manually

**Use "Condense Range" when:**
- Story has natural arcs to group
- Want specific groupings (e.g., "Chapters 1-5: Act I")
- Proactive token management
- Know which chapters are less relevant

**Use "Condense With Settings" when:**
- Approaching token limit
- Testing different condensation styles
- Need temporary aggressive condensation
- Experimenting before changing config

### Configuration Recommendations

**For Active Writing (Current Chapters):**
```
recent_chapters_to_keep: 7-10
condensation_threshold: 85
auto_detect_on_generation: true
auto_regenerate: false (review changes manually)
```

**For Long-Term Storage (Completed Stories):**
```
recent_chapters_to_keep: 3
condensation_threshold: 70
chapters_per_condensed_group: 5
```

**For Maximum Detail:**
```
summary_max_tokens: 200
max_total_summary_tokens: 5000
recent_chapters_to_keep: 10
condensation_threshold: 90
```

**For Minimum Tokens:**
```
summary_max_tokens: 100
max_total_summary_tokens: 2000
recent_chapters_to_keep: 3
condensation_threshold: 70
chapters_per_condensed_group: 5
```

### Backup Strategy

**Regular Backups:**
- Before major story edits
- Before changing summarization prompts
- Before full rebuilds
- Monthly for active stories

**Backup Retention:**
- Keep `max_rebuild_backups` at 5-10
- More for complex stories
- Prune old backups manually if needed

### Change Detection Workflow

**Recommended Approach:**
1. Enable `auto_detect_on_generation = true`
2. Keep `auto_regenerate = false`
3. Let script detect changes
4. Review changed chapters
5. Regenerate selectively
6. Dismiss irrelevant changes

**Why Not Fully Automatic?**
- More control over which changes matter
- Avoids hitting generation limit
- Can batch regenerations strategically
- Review changes before committing

---

## FAQ

### General Questions

**Q: Do I need to configure anything after installation?**
A: Yes, at minimum set `chapter_break_token` and `lorebook_category`. Other settings have sensible defaults.

**Q: Will this work with my existing story?**
A: Yes! Use "Full Rebuild" to generate summaries for all existing chapters.

**Q: Can I use this with multiple stories?**
A: Yes, but configuration is per-script. Settings apply to current story. Can duplicate script with different configs.

**Q: Does this use my generation quota?**
A: Yes, each summary generation counts toward your NovelAI usage.

### Feature Questions

**Q: What's the difference between "Condense With Settings" and "Condense Range"?**
A: "Condense With Settings" applies custom prompt/tokens to normal condensation (all chapters). "Condense Range" condenses specific chapters you select.

**Q: Can I re-condense existing condensed ranges?**
A: Not directly in v1.5.3. You need to: Uncondense → "Condense With Settings" → Script will re-condense with new settings.

**Q: What happens if I delete the lorebook category?**
A: Script will recreate it on next run. Summaries and fingerprints will be lost. Use backups to restore.

**Q: Can I manually edit lorebook entries?**
A: Yes, but script may regenerate them if it detects changes or during rebuilds. Better to adjust prompt and regenerate.

**Q: How do I change the summary style?**
A: Modify `summary_prompt_string` config or use "Condense With Settings" for temporary changes.

### Troubleshooting Questions

**Q: Why isn't my chapter being summarized?**
A: Check: (1) Break token on own line, (2) Chapter complete, (3) No existing fingerprint, (4) Not currently pending, (5) Config correct

**Q: Token count seems higher than expected, why?**
A: Script counts all entry text including "Chapter N\nType: chapter\n..." formatting. Also check for uncounted condensed entries (update to v1.5.3).

**Q: Can I recover if I accidentally delete summaries?**
A: Yes, use "View/Restore Backups" to restore from most recent backup.

**Q: What happens if generation fails mid-rebuild?**
A: Script automatically rolls back to backup state. No data loss.

### Advanced Questions

**Q: Can I customize the condensation prompt?**
A: Yes, use "Condense With Settings" or modify script's `condensePrompt` directly.

**Q: How does the script detect changes?**
A: Uses djb2 hash algorithm to fingerprint chapter text. Compares current hash to stored hash.

**Q: What if I want different condensation for different story sections?**
A: Use "Condense Range" to manually condense specific sections with strategic groupings.

**Q: Can I uncondense everything at once?**
A: Not in v1.5.3, but you can uncondense ranges one at a time. Consider token impact before doing this.

**Q: How do I debug issues?**
A: Enable `DEBUG_MODE = true` in script, check console logs, use testing buttons in debug section.

---

## Appendix

### Glossary

- **Chapter Break Token**: Marker indicating chapter boundaries (e.g., `***`)
- **Fingerprint**: Hash of chapter text used for change detection
- **Condensation**: Process of combining multiple summaries into one
- **Condensed Range**: Group of chapters with combined summary (e.g., "Chapters 1-3")
- **Archived Summary**: Original detailed summary stored when condensed
- **Token Budget**: Total token allocation for all summaries
- **Threshold**: Percentage of budget that triggers warnings
- **Generation Counter**: Tracks non-interactive generations (max 5)
- **Rebuild**: Regenerating all chapter summaries from scratch
- **Backup**: Snapshot of lorebook state for recovery

### Storage Keys Reference

Script uses NovelAI's `storyStorage` for persistent data:

- `chapterSummaryCategoryId`: Lorebook category ID
- `chapterFingerprints`: Array of chapter hashes
- `changedChapters`: Detected changed chapters
- `failedChapters`: Failed generation attempts
- `condensedRanges`: Metadata for condensed groups
- `archivedSummaries`: Original pre-condensation summaries
- `rebuildBackups`: Full backup snapshots
- `lastProcessedChapterCount`: Progress tracking
- `pendingChapter`: Currently processing chapter
- `isFirstChapter`: First-run flag
- `lastUndoData`: Undo information
- `tempCondensePrompt`: Session-only custom prompt
- `tempCondenseMaxTokens`: Session-only custom tokens

### Version History

- **v1.5.3** (2025-11-22): Manual condensation controls, improved undo UX
- **v1.5.2** (2025-11-22): Fixed automatic processing bypass, configuration modes
- **v1.5.1** (2025-11): Condensed ranges UI and management system
- **v1.5.0** (2025-11): Backup browser and retention system
- **v1.4.1** (2025-11): Generation limits, token warnings, bug fixes
- **v1.4.0** (2025-11): Auto-detection and auto-regeneration
- **v1.3.2** (2025-10): Full rebuild improvements
- **v1.3.1** (2025-10): Changed chapters UI enhancements
- **v1.3.0** (2025-10): Chapter fingerprinting and change detection
- **v1.2.2** (2025-10): Fixed chapter break detection
- **v1.2.1** (2025-10): Concurrency handling

---

## Support & Contribution

### Getting Help
- Check [Troubleshooting](#troubleshooting) section
- Review [FAQ](#faq)
- Check GitHub Issues
- Enable DEBUG_MODE for detailed logs

### Reporting Bugs
- Enable DEBUG_MODE
- Note exact steps to reproduce
- Include console logs
- Specify NovelAI tier and model
- Mention script version

### Feature Requests
- Open GitHub Issue
- Describe use case
- Explain why existing features don't work
- Consider edge cases

### Contributing
- Fork repository
- Create feature branch
- Follow existing code style
- Test thoroughly
- Submit pull request with detailed description

---

**End of Manual**

*For latest updates and changelog, see CHANGELOG_v1.5.3.md*  
*For release announcement, see DISCORD_ANNOUNCEMENT_v1.5.3.md*  
*For source code, visit: https://github.com/LaneLearns/AutomaticChapterSummaries*

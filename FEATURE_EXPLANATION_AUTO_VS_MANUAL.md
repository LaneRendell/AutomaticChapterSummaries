# Feature Explanation: Automatic vs Manual Chapter Processing

## Overview

The Automatic Chapter Summaries script provides flexible control over when and how chapter summaries are generated and condensed. This document explains the different behavior modes based on your configuration settings.

---

## Configuration Options

The script has two key settings that control automatic behavior:

### 1. Auto Detect Chapter Changes on Generation
**Config Key:** `auto_detect_on_generation`  
**Default:** `false`

When enabled, the script automatically scans your document for changed chapters every time you generate text in the editor.

### 2. Auto Regenerate Changed Chapter Summaries  
**Config Key:** `auto_regenerate`  
**Default:** `false`

When enabled (requires Auto Detect to also be enabled), the script automatically regenerates summaries for any chapters it detects have been edited.

---

## Behavior Modes

### Mode 1: Both Settings OFF (Full Manual Control)

**Configuration:**
```javascript
auto_detect_on_generation: false
auto_regenerate: false
```

**Behavior:**
- ✋ **Nothing happens automatically**
- When you paste a long story → No automatic processing
- When you generate text → No automatic detection or processing
- You must manually click **"Check for Changes"** to detect edited chapters
- You must manually click **"Regenerate"** buttons to update summaries
- **Condensation:** Only triggered when you exceed the hard token limit during generation
  - Shows warning modal when approaching threshold (75% by default)
  - Forces condensation when over the limit
  - User has full control otherwise

**Use Case:** Maximum control for users who want to decide exactly when to update summaries and when to condense.

---

### Mode 2: Auto-Detect ON, Auto-Regenerate OFF (Informed Manual Control)

**Configuration:**
```javascript
auto_detect_on_generation: true
auto_regenerate: false
```

**Behavior:**
- 🔍 **Automatic detection, manual action**
- When you paste a long story → No automatic processing
- When you generate text → Script detects changed chapters automatically
- 📢 **Shows notification modal:** "Chapter Summaries Available"
  - Lists which chapters need summaries
  - Provides "Open Panel" button for quick access
- 📊 **Status panel updates** to show changed chapters
- You must manually click **"Regenerate"** or **"Regenerate All"** to update summaries
- **Condensation:** Same as Mode 1 (only when exceeding token budget)

**Use Case:** Ideal for users who want to be informed about changes but prefer to control when summaries are updated (e.g., after finishing an editing session).

---

### Mode 3: Both Settings ON (Fully Automatic)

**Configuration:**
```javascript
auto_detect_on_generation: true
auto_regenerate: true
```

**Behavior:**
- 🤖 **Fully automatic processing**
- When you paste a long story → No automatic processing (must generate first)
- When you generate text:
  1. Script detects changed chapters automatically
  2. Immediately starts regenerating summaries for changed chapters
  3. Shows progress notifications in the status panel
  4. Respects the 5-generation limit (shows modal at 4/5 asking to continue)
- 📢 **Keeps you informed** with status updates
- **Condensation:** Happens automatically after auto-regeneration completes
  - Checks token budget after regenerating multiple chapters
  - Runs condensation if needed
  - Also triggers via normal token budget checks during generation

**Use Case:** "Set it and forget it" mode for users who want the script to maintain summaries automatically as they write.

---

## Condensation Behavior (All Modes)

Condensation (combining multiple detailed summaries into one compressed summary to save tokens) is handled separately from chapter detection:

### When Condensation Happens:

1. **Token Budget Exceeded (All Modes)**
   - Triggered by `checkTokenBudgetAfterGeneration()`
   - Runs after you generate text in the editor
   - **Over threshold (75% by default):** Shows warning modal with option to condense now or continue
   - **Over hard limit:** Forces condensation immediately with notification

2. **After Auto-Regeneration (Mode 3 Only)**
   - When auto-regenerate processes multiple chapters
   - Checks if condensation is needed after regeneration completes
   - Helps maintain token budget automatically

3. **Manual Trigger (All Modes)**
   - Click the **"Condense Now"** button in the status panel
   - Available anytime you want to manually reduce token usage

### What Condensation Does:

- **Level 1 (Normal):** Condenses oldest chapters while keeping recent chapters detailed
  - Keeps last X chapters detailed (configurable via `recent_chapters_to_keep`)
  - Groups older chapters into condensed summaries
  
- **Level 2 (Aggressive):** Condenses all except last 2 chapters
  - Used when Level 1 doesn't free enough tokens
  
- **Level 3 (Emergency):** Condenses all except last chapter
  - Used as last resort when over hard limit

### Condensation Rules:

- ✅ Original detailed summaries are archived (can be uncondensed later)
- ✅ Respects generation limits (shows modal at 4/5 generations)
- ✅ Only condenses 2+ chapters automatically (single-chapter condensation only from manual uncondense splits)
- ✅ Properly handles overlapping ranges (v1.5.1 fix)

---

## Story Paste Behavior (All Modes)

**Important:** When you paste a long story into the editor:

- ❌ **Nothing happens automatically** in ANY mode
- The script waits for you to **generate text** first
- This gives you time to review your paste before processing begins
- Once you generate, the appropriate mode (above) takes over

**Why this design?**
- Prevents unwanted processing on accidental pastes
- Lets you edit the pasted text before summarization
- Respects user control regardless of automation settings

---

## First Chapter Behavior

When you write your **first chapter** (fresh story):

- The script detects when a chapter break token appears
- Creates a summary for that first chapter automatically
- Sets the `isFirstChapter` flag to `false` after processing
- Subsequent chapters follow the configured mode above

This ensures the first chapter gets summarized regardless of settings, establishing the baseline for change detection.

---

## Generation Limit (NovelAI Restriction)

NovelAI limits non-interactive generations to **5 per session**. The script respects this:

- Tracks generation counter internally
- At **4 generations:** Shows modal asking if you want to continue or skip
- Resets counter when you manually generate text in the editor
- Prevents hitting the limit during batch operations

**Affected Operations:**
- Auto-regeneration (Mode 3)
- Manual "Regenerate All"
- Condensation operations
- Full rebuild operations

---

## Recommended Settings

### For Active Writing (Drafting New Content):
```javascript
auto_detect_on_generation: true
auto_regenerate: true
```
Let the script maintain summaries automatically as you write.

### For Heavy Editing (Revising Existing Content):
```javascript
auto_detect_on_generation: true
auto_regenerate: false
```
Get notified about changes, but update summaries after finishing your editing session.

### For Maximum Control (Testing, Debugging, Specific Workflows):
```javascript
auto_detect_on_generation: false
auto_regenerate: false
```
Full manual control over all operations.

---

## Summary Comparison Table

| Aspect | Mode 1: Both OFF | Mode 2: Detect Only | Mode 3: Both ON |
|--------|------------------|---------------------|-----------------|
| **Paste Story** | Nothing | Nothing | Nothing |
| **Generate Text** | Nothing | Detects + notifies | Detects + regenerates |
| **User Action** | Click "Check for Changes" | Click "Regenerate" | None (automatic) |
| **Condensation** | Budget exceeded only | Budget exceeded only | Auto + budget exceeded |
| **Notifications** | None | Modal + panel | Panel updates |
| **Control Level** | Full manual | Informed manual | Fully automatic |

---

## Version History

- **v1.5.2:** Fixed automatic processing to respect config settings properly
- **v1.5.1:** Added condensed ranges UI and uncondense features
- **v1.4.1:** Added token budget checking and warning system
- **v1.4.0:** Introduced auto-detect and auto-regenerate features

---

## Questions & Troubleshooting

**Q: The script isn't detecting my changes automatically**  
A: Check that `auto_detect_on_generation` is set to `true` in your config

**Q: Changes are detected but not regenerated**  
A: This is expected if `auto_regenerate` is `false`. Click the "Regenerate" buttons manually, or enable auto-regenerate.

**Q: My token usage keeps growing**  
A: Enable automatic detection/regeneration, or manually click "Condense Now". The script will automatically condense when you exceed the threshold during generation.

**Q: I pasted a long story and nothing happened**  
A: This is correct behavior! Generate text once to trigger processing based on your configured mode.

**Q: Can I switch modes mid-story?**  
A: Yes! Change the config values and they'll take effect immediately. Your existing summaries and fingerprints remain intact.

---

## Technical Notes

The behavior changes in v1.5.2 fixed a critical bug where the script would automatically process all chapters on story paste, ignoring the user's configuration. Now:

- `onResponse` hook only processes the **most recent** chapter
- Multi-chapter detection happens through the **auto-detect system**
- Condensation respects the **token budget system**
- User control is preserved across all modes

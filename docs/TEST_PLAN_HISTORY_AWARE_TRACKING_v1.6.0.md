# Test Plan: History-Aware Tracking (v1.6.0)

This document provides manual test cases to validate the history-aware chapter tracking feature.

## Prerequisites

1. Enable `DEBUG_MODE` in the script (should already be `true`)
2. Ensure `history_aware_tracking` config is enabled (default: `true`)
3. Have the browser console/logs open to observe `[History]` log messages
4. Start with a fresh story or clear existing chapter summaries

---

## Test Environment Setup

### Create Test Story Structure

Use this template to quickly set up test chapters. Copy/paste into NovelAI:

```
[Chapter One: The Beginning]
This is the content of chapter one. It contains enough text for the AI to generate a meaningful summary. The protagonist begins their journey in a small village.

***

[Chapter Two: The Journey]
This is the content of chapter two. The protagonist travels through the forest and encounters various challenges along the way.

***

[Chapter Three: The Discovery]
This is the content of chapter three. A mysterious artifact is discovered that will change everything.

***
```

---

## Test Cases

### TC-01: Basic Undo Removes Orphaned Summary

**Objective:** Verify that undoing past a chapter break removes the corresponding summary.

**Steps:**
1. Start with chapters 1-2 already having summaries generated
2. Type/paste chapter 3 content with the `***` break
3. Generate AI text to trigger chapter 3 summary creation
4. Verify chapter 3 summary appears in lorebook
5. Press Ctrl+Z (undo) multiple times until the chapter 3 break (`***`) is removed
6. Check the logs for `[History] Navigation detected: undo`
7. Verify chapter 3 summary is removed from lorebook

**Expected Results:**
- Log shows: `[History] UNDO: Restoring state from history node X`
- Log shows: `[History] Removing X current lorebook entries...`
- Log shows: `[History] Full state restoration complete.`
- Chapter 3 summary no longer exists in lorebook
- Chapters 1-2 summaries remain intact

---

### TC-02: Basic Redo Restores Cached Summary

**Objective:** Verify that redoing restores the previously removed summary.

**Steps:**
1. Complete TC-01 (chapter 3 summary was removed via undo)
2. Press Ctrl+Y (redo) or Ctrl+Shift+Z multiple times until chapter 3 break is restored
3. Check the logs for `[History] Navigation detected: redo`
4. Verify chapter 3 summary is restored to lorebook

**Expected Results:**
- Log shows: `[History] REDO: Restoring state from history node X`
- Log shows: `[History] Recreating X summaries from cache...`
- Log shows: `[History] Restored summary for chapter 3`
- Chapter 3 summary reappears in lorebook with same content as before

---

### TC-03: Undo/Redo Preserves Condensed Ranges

**Objective:** Verify that condensed ranges are properly preserved across undo/redo.

**Steps:**
1. Create chapters 1-5 with summaries
2. Trigger condensation (manually or via token budget) so chapters 1-3 become condensed
3. Verify lorebook shows "Chapters 1-3" condensed entry
4. Add chapter 6 with summary
5. Undo back before chapter 6 was added
6. Verify condensed range 1-3 still exists
7. Redo to restore chapter 6
8. Verify condensed range 1-3 still exists

**Expected Results:**
- Condensed range metadata is preserved through undo/redo
- Individual summaries within condensed ranges are not duplicated
- UI shows correct condensed range information

---

### TC-04: Undo Past Condensation Operation

**Objective:** Verify that undoing past a condensation operation restores individual summaries.

**Steps:**
1. Create chapters 1-4 with individual summaries
2. Manually condense chapters 1-2 into a range
3. Verify lorebook shows "Chapters 1-2" condensed entry
4. Undo multiple times until before the condensation occurred
5. Check logs for restoration messages

**Expected Results:**
- Log shows full state restoration
- Individual summaries for chapters 1 and 2 are restored
- Condensed range is removed
- `condensedRanges` in storyStorage is restored to pre-condensation state

---

### TC-05: Multiple Sequential Undos

**Objective:** Verify handling of multiple undo operations in sequence.

**Steps:**
1. Create chapters 1-3 with summaries (generate after each)
2. Undo once (removes chapter 3)
3. Verify chapter 3 summary removed
4. Undo again (removes chapter 2)
5. Verify chapter 2 summary removed
6. Undo again (removes chapter 1)
7. Verify chapter 1 summary removed

**Expected Results:**
- Each undo correctly removes the corresponding chapter summary
- No orphaned summaries remain
- Fingerprints are updated at each step

---

### TC-06: Redo After Multiple Undos

**Objective:** Verify correct restoration after multiple undos.

**Steps:**
1. Complete TC-05 (all summaries removed)
2. Redo once (restores chapter 1)
3. Verify chapter 1 summary restored
4. Redo again (restores chapter 2)
5. Verify chapter 2 summary restored
6. Redo again (restores chapter 3)
7. Verify chapter 3 summary restored

**Expected Results:**
- Each redo correctly restores the corresponding chapter summary
- Summary content matches original
- Fingerprints are restored

---

### TC-07: History Jump (Non-Linear Navigation)

**Objective:** Verify handling of direct history jumps (not sequential undo/redo).

**Steps:**
1. Create chapters 1-4 with summaries
2. Open NovelAI's history tree/panel
3. Jump directly to a node where only chapters 1-2 existed
4. Verify chapters 3-4 summaries are removed
5. Jump forward to where all 4 chapters existed
6. Verify all summaries are restored

**Expected Results:**
- Log shows: `[History] Navigation detected: jump`
- Full state restoration occurs correctly
- Non-sequential jumps work the same as sequential undo/redo

---

### TC-08: State Comparison Optimization

**Objective:** Verify that identical states don't trigger unnecessary restoration.

**Steps:**
1. Create chapter 1 with summary
2. Type some text (no chapter break)
3. Undo the text
4. Check logs

**Expected Results:**
- Log shows: `[History] States are identical, no restoration needed`
- No lorebook modifications occur
- Performance is not impacted by non-chapter-break changes

---

### TC-09: Tracking Starts Mid-Story

**Objective:** Verify behavior when undo goes to a node without cached state.

**Steps:**
1. Disable `history_aware_tracking` temporarily
2. Create chapters 1-3 with summaries
3. Re-enable `history_aware_tracking`
4. Add chapter 4 with summary
5. Undo back before chapter 4
6. Continue undoing to before tracking was enabled

**Expected Results:**
- Log shows: `[History] Target node has no cached state (older than tracking). Storing current state.`
- No crash or error occurs
- Current state is preserved

---

### TC-10: Retry Operation

**Objective:** Verify that retry operations are handled correctly.

**Steps:**
1. Create chapters 1-2 with summaries
2. Start generating chapter 3 text
3. Use NovelAI's "Retry" feature to regenerate
4. Check logs for retry handling

**Expected Results:**
- Log shows: `[History] Navigation detected: retry`
- State is handled appropriately (may show "States are identical" if no chapter break change)

---

### TC-11: Fingerprint Restoration

**Objective:** Verify that fingerprints are correctly restored for change detection.

**Steps:**
1. Create chapters 1-2 with summaries
2. Note the fingerprint hashes in logs
3. Undo to remove chapter 2
4. Redo to restore chapter 2
5. Use "Detect Changes" to check for changed chapters

**Expected Results:**
- Fingerprints are restored from cached state
- "Detect Changes" shows no changes (fingerprints match)
- Change detection works correctly after restoration

---

## Verification Checklist

After completing all test cases, verify:

- [ ] No orphaned summaries exist after any undo operation
- [ ] All summaries are correctly restored after redo
- [ ] Condensed ranges are preserved correctly
- [ ] Fingerprints are restored correctly
- [ ] UI status panel updates correctly after each operation
- [ ] No JavaScript errors in console
- [ ] Performance is acceptable (no noticeable lag on undo/redo)

---

## Known Limitations

1. **Lorebook Entry IDs:** When summaries are restored, they get new lorebook entry IDs. The `condensedRanges` metadata will have stale IDs. This affects uncondense operations after a redo - the user may need to manually refresh or the IDs should be updated in a future version.

2. **Pre-Tracking History:** Nodes that existed before history tracking was enabled will not have cached state. Undoing to these nodes preserves current state but doesn't restore "what was there before."

3. **Storage Size:** Full state preservation stores more data per history node. For very long stories with many chapters, this could increase storage usage.

---

## Debugging Tips

If tests fail, check:

1. **Logs:** Look for `[History]` prefixed messages in the console
2. **historyStorage:** Check `api.v1.historyStorage.get("chapterState")` for current node state
3. **storyStorage:** Check `condensedRanges` and `chapterFingerprints` in storyStorage
4. **Permissions:** Ensure `lorebookEdit` permission is granted

---

## Test Results Template

| Test Case | Pass/Fail | Notes |
|-----------|-----------|-------|
| TC-01 | | |
| TC-02 | | |
| TC-03 | | |
| TC-04 | | |
| TC-05 | | |
| TC-06 | | |
| TC-07 | | |
| TC-08 | | |
| TC-09 | | |
| TC-10 | | |
| TC-11 | | |

**Tester:** _______________
**Date:** _______________
**Script Version:** 1.6.0

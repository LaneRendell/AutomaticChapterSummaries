# 🎉 Automatic Chapter Summaries v1.5.1 Released!

## What's New: Full Condensed Range Management! 📦

Hey everyone! Version 1.5.1 is here with a complete suite of tools for managing your condensed chapter ranges. Plus, we've squashed some critical bugs that were causing issues during automatic condensation.

---

## ✨ New Features

### 📊 Condensed Ranges UI Section
Your main panel now has a dedicated "📦 Condensed Ranges" section showing all your condensed chapter groups at a glance!

Each range displays:
- 📖 Chapter span (e.g., "Chapters 1-8")
- 📊 Token count
- 📅 Condensation date
- 📚 Number of original summaries archived

Quick actions: **View Details** | **Uncondense**

### 🔍 View Condensed Range Details
Click "View Details" on any condensed range to see:
- ✅ Full condensed summary text
- 📈 Metadata (tokens, date)
- 📜 All archived original summaries
- 🎯 Quick actions: Uncondense entire range or extract single chapters

### 🔓 Uncondense Operations

#### **Uncondense Entire Range**
Want all your detailed summaries back? One click restores everything!
- ⚖️ Preview modal shows token impact (+X tokens, +Y%)
- 🔄 Restores all original summaries
- ✅ Updates tracking automatically

#### **Uncondense Single Chapter** (NEW!)
Need detail on just ONE chapter? We've got you covered!

**Example:** Uncondense Chapter 5 from "Chapters 3-7"  
**Result:** 
- "Chapters 3-4" (stays condensed) 
- Chapter 5 (detailed!) 
- "Chapters 6-7" (stays condensed)

**Benefits:**
- 🎯 Surgical precision - get exactly the chapter you need
- 💰 Token efficient - other chapters stay condensed
- 🔮 Preview before you commit
- ⚡ Respects generation limits (warns if approaching 5/5)

### ↩️ Undo Last Uncondense
Made a mistake? Just hit undo!
- Appears automatically after uncondense operations
- One-click restoration of condensed state
- Perfect for testing and experimentation

---

## 🐛 Critical Bug Fixes

### Fixed: Overlapping Condensed Ranges 🚨
**This was a big one!** The script could create overlapping condensed ranges during automatic condensation, corrupting your lorebook state.

**Before (broken):**
```
Chapter 1 (condensed)
Chapters 3-5 (condensed)
Chapters 1-8 (condensed) ← ALL THREE EXIST! 😱
```

**After (fixed):**
```
Chapters 1-8 (condensed) ← Clean! 🎉
```

**What we did:**
- Complete rewrite of the condensation logic with a clear 6-step process
- Proper overlap detection and cleanup
- No more duplicate entries or corrupted state
- Each entry deleted exactly once (with error handling)

### Fixed: Duplicate Chapters in Archived Summaries
When viewing condensed range details, you might have seen the same chapter appear twice in the archived summaries. Now properly deduplicated!

### Fixed: Aggressive Condensation Duplicates
Aggressive condensation could leave duplicate entries when expanding previously condensed ranges. Now properly cleans up ALL old entries before creating new ones.

### Fixed: Single Chapter Uncondense Errors
Uncondensing single chapters could throw errors trying to delete non-existent entries. Now uses the correct deletion-free path for working with archived summaries.

---

## 🎨 Improvements

### Better Formatting
- **Single chapters** now display as "Chapter 5" (not "Chapters 5-5")
- **Type field** says "Type: chapter" for singles, "Type: chapters" for ranges
- Consistent formatting across all UI elements (modals, panels, lorebook)

### Accurate Counts
Status panel now shows correct detailed vs. condensed entry counts by using storage data instead of lorebook scanning.

### Token Efficiency
- Single-chapter condensed entries only created during manual uncondense splits (smart!)
- Automatic condensation requires minimum 2 chapters (sensible!)
- User gets the ONE detailed chapter they want, everything else stays efficient

---

## 📖 How to Use

1. **Check your ranges:** Look at the "📦 Condensed Ranges" section in the main panel
2. **View details:** Click "View Details" to see what's inside any range
3. **Restore everything:** Click "Uncondense" on the main panel or in the details modal
4. **Extract one chapter:** Open details modal, use "Uncondense Single Chapter" button
5. **Made a mistake?** Hit "Undo Last Uncondense" (appears after operations)
6. **Preview first:** All operations show token impact before you commit!

---

## 🔧 Technical Notes

- **No breaking changes** - Fully backward compatible with v1.5.0
- **No data migration needed** - Your existing data works seamlessly
- **Enhanced error handling** - Graceful recovery from edge cases
- **Better code architecture** - Cleaner logic, easier to maintain

---

## 🙏 Thank You!

Big thanks to everyone who reported the condensation bugs and tested the uncondense features! Your feedback has been invaluable in making this the most stable and feature-rich version yet.

**Download:** [Link to your release]

**Questions?** Drop them below! 👇

**Found a bug?** Please report it with details and I'll investigate ASAP.

Happy writing! ✍️📖

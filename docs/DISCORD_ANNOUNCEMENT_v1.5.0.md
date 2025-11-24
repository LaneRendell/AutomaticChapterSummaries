# 📦 Automatic Chapter Summaries v1.5.0 - Backup Browser! 🔍

Hey everyone! Got a nice quality-of-life update for you today. This one's all about making your rebuild backups actually *usable* instead of just mysterious blobs of data sitting in storage.

## ✨ What's New: The Backup Browser

**You know those backups the script creates before rebuilds?** Now you can actually *look inside them*!

### The Full Tour:
1. Click "View/Restore Backups" (same button as before)
2. See all your backups with **token counts** and **entry counts** at a glance
3. Click **"View Details"** on any backup to see:
   - All the metadata (fingerprints, changed chapters, condensed ranges, etc.)
   - **Every single lorebook entry** from that backup
   - Token count for each individual entry
   - **The full text of every summary** (selectable for copying!)
4. Navigate back and forth between list and details views
5. Restore directly from either view

**Basically:** You can now inspect exactly what's in a backup before restoring it. No more "fingers crossed, let's see what happens!" 😅

## 🎯 The Use Cases

**Scenario 1: "Wait, what did I lose?"**
- You did a rebuild that went weird
- Open the backup browser
- View the backup from before the rebuild
- See exactly what summaries you had
- Copy any text you want to keep manually
- Or just restore the whole thing

**Scenario 2: "Which backup do I want?"**
- You have 5 backups from different times
- All have different reasons ("Rebuild all chapters", "Before testing", etc.)
- Now you can see token counts and entry counts *before* restoring
- Pick the right one based on actual data, not guesswork

**Scenario 3: "I just want to read what my old summaries said"**
- You condensed chapters 1-5 months ago
- Can't remember what the original summaries were
- Browse through your backups
- Read the full text of any entry
- Copy it if you want to reference it

## 🛠️ New Config Option

**`maxRebuildBackups` (default: 5, range: 1-20)**

Controls how many backups to keep in storage. Older ones get automatically pruned.

- Default 5 is fine for most people
- Bump to 10-20 if you want more history for long stories
- Lower to 1-3 if you're worried about storage space

Just add to your config:
```typescript
maxRebuildBackups: 10  // Keep up to 10 backups
```

## 🎨 The UI Is Pretty Nice

**Backup List:**
```
Backup 1
📅 Nov 22, 2025 2:30 PM
📝 Reason: Rebuild all chapters
📊 Chapters: 12
📦 Entries: 12
🔢 Tokens: 3,450

[View Details] [Restore]
```

**Backup Details:**
Shows you everything:
- Creation date and reason
- Total tokens and entries
- All metadata (fingerprints, changed chapters, condensed ranges, failed chapters, etc.)
- Full list of entries sorted by chapter number
- Each entry shows: `• Chapter 5: The Battle (287 tokens)` followed by the full summary text
- Easy to scroll through and read
- Text is selectable if you want to copy anything

**Navigation:**
- "← Back to List" button to return
- "Close" button to exit
- "Restore This Backup" button with confirmation modal

## 🔧 Technical Stuff (For the Nerds)

**Modal Navigation:**
Figured out NovelAI's modal system properly this time. Had to use the `modal.closed.then()` pattern to chain modals without them vanishing mysteriously. Also learned that nested callback modals don't work, so the entry text is displayed inline instead of in separate modals. Works better anyway!

**Token Counting:**
Calculates token counts on-the-fly using the same tokenizer as generation (GLM-4-6), so the numbers are accurate.

**Entry Sorting:**
Entries are sorted by chapter number (handles both "Chapter 5" and "Chapters 1-3" formats). Makes it easy to find specific chapters.

## 📝 TL;DR

**New in this release:**
- 📦 Browse backup contents before restoring
- 🔍 View all entries and their full text
- 📊 Token counts for everything (backups and individual entries)
- ⚙️ Configurable backup retention (1-20 backups)
- 🎨 Clean, navigable UI for backup management

This is basically "what if backups weren't just mysterious data blobs you restore blindly?"

No bug fixes this time - just pure feature work. v1.4.1 was solid, so this release is focused entirely on making backups more accessible and useful.

---

**How to Update:**
Just replace your current script file with the new v1.5.0 version. Everything is compatible - no need to reset your data or change any settings. All your existing backups will work with the new browser interface.

**Try It Out:**
1. Click "View/Restore Backups"
2. Click "View Details" on any backup
3. Browse through your entries
4. Enjoy actually knowing what's in your backups! 🎉

**Questions?**
Drop them below! This one was fun to build - modal systems are always an adventure in NovelAI's scripting environment.

Happy writing! ✍️

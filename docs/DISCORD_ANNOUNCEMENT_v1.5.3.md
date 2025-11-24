# 📢 Automatic Chapter Summaries v1.5.3 - Manual Condensation Controls

Hey NovelAI community! 👋

I'm excited to release **v1.5.3** of the Automatic Chapter Summaries script, featuring full manual control over condensation!

## 🎯 What's New

### **Manual Condensation Controls**
You asked for more control, and you got it! This release adds two powerful new features:

**🔧 Condense With Settings**
- Re-condense your chapters with custom prompts and token limits
- Test different condensation strategies without editing the script
- Session-based settings that don't modify your base config
- Perfect for when you're approaching your token limit and need more aggressive condensation

**📦 Condense Range**
- Manually select specific chapter ranges to condense together
- Great for consolidating story arcs (e.g., "Chapters 5-8: The Quest")
- Strategic token management for long-running stories
- Full validation to prevent overlaps and invalid ranges

### **Better Undo Experience**
- Improved overlap detection with helpful guidance messages
- No more cryptic errors when undo would cause conflicts
- Clear visual warnings showing exactly what's blocking undo
- Easy resolution: just uncondense the conflicting range first

## 🐛 Bug Fixes
- Fixed modal clarity issues (now clearly explains what each feature does)
- Fixed off-by-one errors in chapter counting
- Fixed chapter number detection failures
- Fixed lorebook entry property inconsistencies
- Fixed potential duplicate range creation via undo

## 📥 Installation
1. Copy the script from the GitHub repo
2. Paste into NovelAI's script editor
3. Configure your settings (chapter break token, category name, etc.)
4. Start writing!

## 🔗 Links
- **GitHub Repo:** [AutomaticChapterSummaries](https://github.com/LaneLearns/AutomaticChapterSummaries)
- **Full Changelog:** See CHANGELOG_v1.5.3.md
- **User Manual:** See USER_MANUAL.md for comprehensive guide

## 💡 Use Cases

**When to use "Condense With Settings":**
- Testing different prompt styles without script edits
- Temporary aggressive condensation near token limits
- Quick one-time adjustments for specific situations

**When to use "Condense Range":**
- Grouping story arcs together logically
- Making room for detailed summaries of recent chapters
- Strategic token management in long stories

## 🙏 Feedback Welcome
This script has evolved significantly thanks to community feedback! If you have suggestions, bug reports, or feature requests, please let me know.

## 📋 Version History
- **v1.5.3** - Manual condensation controls (current)
- **v1.5.2** - Fixed automatic processing and configuration modes
- **v1.5.1** - Condensed ranges UI and management
- **v1.5.0** - Backup browser and retention
- **v1.4.x** - Auto-detection and generation limits
- **v1.3.x** - Change detection and fingerprinting

Happy writing! ✍️

---

*Automatic Chapter Summaries uses NovelAI's Script API to automatically generate, manage, and condense chapter summaries as you write, keeping your lorebook organized and your token budget under control.*

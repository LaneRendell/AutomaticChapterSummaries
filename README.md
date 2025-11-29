# Automatic Chapter Summaries for NovelAI

**Version 1.6.0** | *Last Updated: November 29, 2025*

A powerful NovelAI script that automatically generates, manages, and condenses chapter summaries as you write. Keep your lorebook organized and your token budget under control with intelligent automation and manual controls.

[![NovelAI](https://img.shields.io/badge/NovelAI-Script-purple)](https://novelai.net/)
[![Version](https://img.shields.io/badge/version-1.6.0-blue)](https://github.com/LaneRendell/AutomaticChapterSummaries/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🌟 Features

### Core Functionality
- **🤖 Automatic Summarization** - AI-generated summaries for completed chapters
- **📊 Token Budget Management** - Multi-level condensation system to stay within limits
- **🔍 Change Detection** - Fingerprint-based tracking of chapter edits
- **💾 Backup System** - Complete snapshots for safe recovery and rollback
- **🎛️ Manual Controls** - Fine-tuned control over condensation and regeneration
- **📦 Smart Condensation** - Combine chapters strategically to save tokens
- **🕐 History-Aware Tracking** - Automatic undo/redo management of summaries

### What's New in v1.6.0
- **🕐 History-Aware Tracking** - Auto-manage summaries when using undo/redo/retry
- **🐛 Rebuild Fix** - No longer counts in-progress chapter during rebuild
- **🐛 Backup Fix** - Fixed backup failing on new stories
- **🐛 Entry ID Fix** - Condensed ranges now work correctly after redo operations

### Key Capabilities
- Detect chapter breaks automatically using configurable tokens
- Generate concise AI summaries using your preferred model
- Store summaries as lorebook entries with force activation
- Track changes to chapters and regenerate summaries when edited
- Condense older summaries to save tokens while keeping recent ones detailed
- Restore detailed summaries from condensed ranges
- Full rebuild capability to regenerate all chapters
- Comprehensive backup and restore system
- Automatic or manual operation modes

---

## 📥 Installation

### Prerequisites
- NovelAI subscription with scripting access
- Basic familiarity with NovelAI's interface

### Quick Start

1. **Download the Script**
   ```bash
   # Clone the repository
   git clone https://github.com/LaneLearns/AutomaticChapterSummaries.git
   
   # Or download the latest release
   # https://github.com/LaneLearns/AutomaticChapterSummaries/releases/latest
   ```

2. **Copy to NovelAI**
   - Open the `Automatic_Chapter_Summaries_v1.6.0.ts` file
   - Copy the entire contents
   - In NovelAI, navigate to the script editor
   - Paste the script and save

3. **Configure Settings**
   - Set your `chapter_break_token` (e.g., `***`)
   - Set your `lorebook_category` (e.g., `Chapter Summaries`)
   - Adjust other settings to your preferences (see [Configuration](#-configuration))

4. **Activate**
   - Enable the script in NovelAI
   - Grant required permissions (lorebookEdit, documentEdit)
   - Open the "Chapter Summaries v1.6.0" panel
   - Start writing!

---

## ⚙️ Configuration

### Essential Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `chapter_break_token` | string | `***` | Token marking chapter boundaries (must be on own line) |
| `lorebook_category` | string | `Chapter Summaries` | Lorebook category name for summaries |
| `summarize_scene_breaks` | boolean | `true` | Summarize all breaks (true) or only titled chapters (false) |

### Summary Generation

| Setting | Type | Default | Range | Description |
|---------|------|---------|-------|-------------|
| `summary_max_tokens` | number | `150` | 50-500 | Maximum tokens per individual summary |
| `summary_prompt_string` | string | [default prompt] | - | AI prompt template for generating summaries |

### Token Management

| Setting | Type | Default | Range | Description |
|---------|------|---------|-------|-------------|
| `max_total_summary_tokens` | number | `3000` | 1000-10000 | Total token budget for all summaries |
| `condensation_threshold` | number | `80` | 50-95 | Percentage that triggers condensation warnings |
| `recent_chapters_to_keep` | number | `5` | 1-20 | Recent chapters kept detailed during condensation |
| `chapters_per_condensed_group` | number | `3` | 2-10 | Chapters combined per condensed group |

### Automation (v1.4.0+)

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `auto_detect_on_generation` | boolean | `false` | Auto-detect changed chapters after generating |
| `auto_regenerate` | boolean | `false` | Auto-regenerate detected changes (requires auto_detect) |
| `history_aware_tracking` | boolean | `true` | Auto-manage summaries on undo/redo (v1.6.0+) |

### Backups

| Setting | Type | Default | Range | Description |
|---------|------|---------|-------|-------------|
| `max_rebuild_backups` | number | `5` | 1-20 | Maximum backup snapshots to retain |

---

## 🎮 Usage

### Basic Workflow

1. **Write Your Chapter**
   ```
   Once upon a time, in a land far away...
   [Your chapter content here]
   ```

2. **Add Chapter Break**
   ```
   
   ***
   
   ```
   *(Must be on its own line)*

3. **Continue Writing or Generate**
   - The script automatically detects the completed chapter
   - Generates a summary using AI
   - Stores it in your lorebook

4. **Monitor Token Usage**
   - Open the Chapter Summaries panel
   - Check token usage: `✓ 1250 / 3000 tokens (42%)`
   - System automatically condenses when needed

### Manual Controls (v1.5.3)

#### Condense With Settings
Perfect for testing different condensation strategies:
```
1. Click "🔧 Condense With Settings"
2. Customize the condensation prompt
3. Set max tokens (50-1000)
4. Apply to trigger re-condensation
```

#### Condense Range
Manually select chapters to condense:
```
1. Click "📦 Condense Range"
2. Enter start chapter (e.g., 5)
3. Enter end chapter (e.g., 8)
4. Confirm to condense "Chapters 5-8"
```

### Change Detection

**Manual:**
```
1. Edit past chapters
2. Click "🔍 Check for Changes"
3. Review detected changes
4. Click "Regenerate" or "Regenerate All"
```

**Automatic** (when enabled):
```
1. Edit chapters
2. Generate text
3. Script auto-detects changes
4. Either notifies you or auto-regenerates (based on config)
```

---

## 📖 Documentation

- **[USER_MANUAL.md](USER_MANUAL.md)** - Comprehensive 500+ line guide covering all features
- **[CHANGELOG_v1.6.0.md](docs/CHANGELOG_v1.6.0.md)** - v1.6.0 history-aware tracking details
- **[CHANGELOG_v1.5.6.md](docs/CHANGELOG_v1.5.6.md)** - v1.5.6 status panel fix details
- **[CHANGELOG_v1.5.4.md](CHANGELOG_v1.5.4.md)** - v1.5.4 permissions system changelog

### Quick Links
- [Configuration Options](USER_MANUAL.md#configuration-options) - All settings explained
- [Understanding the UI](USER_MANUAL.md#understanding-the-ui) - UI panel breakdown
- [Token Management](USER_MANUAL.md#token-management-system) - How condensation works
- [Troubleshooting](USER_MANUAL.md#troubleshooting) - Common issues and solutions
- [FAQ](USER_MANUAL.md#faq) - Frequently asked questions

---

## 🎯 Use Cases

### Active Writing
- Automatically summarize chapters as you write
- Keep recent chapters detailed (last 5-10)
- Condense older chapters to save tokens
- Detect and regenerate edited chapters

### Long-Running Stories
- Manage 50+ chapters efficiently
- Strategic condensation by story arcs
- Full rebuild when changing summary style
- Backup and restore for experimentation

### Story Editing
- Re-summarize after major edits
- Track which chapters have been changed
- Selective regeneration of affected chapters
- Maintain lorebook accuracy

---

## 🔧 Advanced Features

### Token Management System

**Three-Level Condensation:**
1. **Normal** - Condense oldest chapters, keep recent ones detailed
2. **Aggressive** - Expand condensed ranges, combine more chapters
3. **Emergency** - Condense even recent chapters (last resort)

### Backup & Restore
- Automatic backups before rebuilds
- Manual backup creation
- View all entries in any backup
- One-click restore to previous state
- Configurable retention (1-20 backups)

### Change Detection
- Hash-based fingerprinting (djb2 algorithm)
- Detects even minor text changes
- Tracks condensed vs. detailed chapters
- Per-chapter or batch regeneration

### Full Rebuild
- Regenerate all summaries from scratch
- Atomic operation with rollback on error
- Automatic backup before rebuild
- Reuse unchanged chapters for efficiency

---

## 🛠️ Troubleshooting

### Common Issues

**Chapter Not Summarizing?**
- Ensure break token is on its own line
- Check if summary already exists
- Verify `chapter_break_token` config matches your usage

**Token Count Wrong?**
- Update to v1.6.0 (includes all fixes)
- Check for manual edits to lorebook entries
- Try "Full Rebuild" to resync

**Permissions Issues?**
- Grant lorebookEdit and documentEdit permissions
- Check permissions box at top of panel
- Script shows clear permission status

**Generation Limit Reached?**
- NovelAI limits scripts to 5 non-interactive generations
- Generate text manually to reset counter
- Avoid chaining multiple automatic operations

**Undo Button Disabled?**
- Check for orange warning box (overlap detected)
- Uncondense the conflicting range first
- Undo will re-enable automatically

See [USER_MANUAL.md#troubleshooting](USER_MANUAL.md#troubleshooting) for detailed solutions.

---

## 📊 Version History

- **v1.6.0** (2025-11-29) - History-aware tracking for undo/redo, rebuild and backup fixes
- **v1.5.6** (2025-11-27) - Fixed status panel stuck on "Loading..." after init
- **v1.5.5** (2025-11-25) - API compatibility update for modal system changes
- **v1.5.4** (2025-11-24) - Permissions system integration and UI improvements
- **v1.5.3** (2025-11-22) - Manual condensation controls, improved undo UX
- **v1.5.2** (2025-11-22) - Fixed automatic processing bypass
- **v1.5.1** (2025-11) - Condensed ranges UI and management
- **v1.5.0** (2025-11) - Backup browser and retention
- **v1.4.1** (2025-11) - Generation limits and token warnings
- **v1.4.0** (2025-11) - Auto-detection and auto-regeneration
- **v1.3.x** (2025-11) - Change detection and fingerprinting
- **v1.2.x** (2025-11) - Chapter break detection fixes

See [CHANGELOG_v1.6.0.md](docs/CHANGELOG_v1.6.0.md) for latest changes or [CHANGELOG_v1.5.3.md](docs/CHANGELOG_v1.5.3.md) for feature history.

---

## 🤝 Contributing

Contributions are welcome! Here's how to help:

1. **Report Bugs**
   - Enable `DEBUG_MODE` in the script
   - Include console logs and steps to reproduce
   - Open an issue on GitHub

2. **Request Features**
   - Describe your use case
   - Explain why existing features don't work
   - Open an issue with the `enhancement` label

3. **Submit Code**
   - Fork the repository
   - Create a feature branch
   - Follow existing code style
   - Test thoroughly
   - Submit a pull request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- NovelAI team for the excellent scripting API
- NovelAI community for feedback and testing
- All contributors and users

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/LaneRendell/AutomaticChapterSummaries/issues)
- **Documentation**: [USER_MANUAL.md](USER_MANUAL.md)
- **Updates**: Watch this repository for releases

---

## ⭐ Show Your Support

If this script helps your writing workflow, please:
- ⭐ Star this repository
- 🐛 Report bugs
- 💡 Suggest features
- 📢 Share with other NovelAI users

Happy writing! ✍️

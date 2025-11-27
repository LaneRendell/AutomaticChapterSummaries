# Changelog - Version 1.5.6

## Status Panel Initialization Fix

Version 1.5.6 fixes a critical bug where the Status Panel would remain stuck on "Loading status...", "Loading...", "Loading..." indefinitely, even after the script successfully initialized.

---

## Bug Fixed

### Status Panel Stuck on "Loading..."

**Symptom:**
After script initialization, the Status Panel displayed:
- "Loading status..."
- "Loading..."
- "Loading..."

Despite logs showing successful initialization:
```
✓ Permissions check: All granted
✓ Loaded category ID from storage
✓ Found 0 chapter entries in lorebook
✓ Initial status panel update attempt 1 completed
```

**Root Cause:**
The `updateParts` API silently fails during panel initialization. The previous approach registered the panel with placeholder content, then attempted to update it immediately afterward. Even with retry loops, the updates were silently ignored by NovelAI's UI system.

**Solution:**
Build real content **before** registering the panel, so the panel is registered with actual data instead of placeholders.

---

## Technical Changes

### New Helper Function: `buildStatusDisplayText()`
Extracted status text building logic into a reusable helper function that can be called during initialization (before panel registration) as well as during normal updates.

```typescript
async function buildStatusDisplayText(): Promise<string> {
    // Builds complete status text with:
    // - Token usage
    // - Background work indicators
    // - Auto-detection notifications
    // - Summary breakdown
    // - Failed chapters list
}
```

### Pre-Registration Content Building
The initialization now builds real content for all three dynamic boxes before registering the panel:

```typescript
// v1.5.6: Build real content BEFORE panel registration
let initialStatusText = "**Initializing...**\n\n...";
let initialChangedChaptersContent: UIPart[] = [...];
let initialCondensedRangesContent: UIPart[] = [...];

// Try to build real content if we have permissions
if (hasRequiredPermissions && lorebookCategoryId) {
    try {
        initialStatusText = await buildStatusDisplayText();
        initialChangedChaptersContent = await buildChangedChaptersUI();
        initialCondensedRangesContent = await buildCondensedRangesUI();
    } catch (error) {
        // Fall back to placeholder content
    }
}

// Register with pre-built content
await api.v1.ui.register([{
    type: "scriptPanel",
    content: panelContent  // Contains pre-built content
}]);
```

### Permission Check API Workaround
Changed `checkPermissions()` to use `list()` instead of `has()` due to a NovelAI API bug where `has()` returns `false` even when permissions are granted.

```typescript
// v1.5.6: Using list() instead of has() due to NovelAI API bug
const currentPerms = await api.v1.permissions.list();
const hasPerms = REQUIRED_PERMISSIONS.every(perm => currentPerms.includes(perm));
```

### Startup Timing Resilience
Added retry logic during startup to handle timing issues where NovelAI's permission system may not be ready immediately when the script loads:

```typescript
// v1.5.6: Check permissions with retry to handle timing issues
for (let attempt = 0; attempt < 3; attempt++) {
    await checkPermissions();
    if (hasRequiredPermissions) {
        await initializeLorebookCategory();
        break;
    }
    await api.v1.timers.sleep(300 * (attempt + 1));
}
```

### updateStatusPanel() Resilience
Added retry logic in `updateStatusPanel()` to re-check permissions and initialize the lorebook category if needed, handling cases where initialization was incomplete:

```typescript
// v1.5.6: Re-check permissions and initialize if needed
if (!hasRequiredPermissions || !lorebookCategoryId) {
    for (let attempt = 0; attempt < 3; attempt++) {
        // Retry permission check and category initialization
        // ...
    }
}
```

---

## Changes Summary

| Change | Description |
|--------|-------------|
| **Bug Fix** | Status panel no longer stuck on "Loading..." |
| **New Function** | `buildStatusDisplayText()` helper for reusable status building |
| **Init Change** | Content built before panel registration |
| **API Workaround** | Using `list()` instead of `has()` for permission checks |
| **Retry Logic** | Added startup timing resilience with retries |
| **Simplified** | Removed ineffective retry loop after panel registration |

---

## Migration from v1.5.5

### For Users
**No action required!** Simply update to v1.5.6:

1. Copy the new script code
2. Paste into NovelAI script editor
3. Save and reload

All your existing data remains compatible:
- Fingerprints preserved
- Condensed ranges intact
- Backups fully compatible
- Settings unchanged

### Verification
After updating, the Status Panel should immediately display:
- Token usage statistics
- Summary breakdown
- Any failed chapters
- Changed chapters list (if any)
- Condensed ranges (if any)

If you see actual content instead of "Loading...", the fix is working.

---

## Version History

| Version | Date | Type | Description |
|---------|------|------|-------------|
| **v1.5.6** | 2025-11-27 | Bug Fix | Status panel initialization fix |
| v1.5.5 | 2025-11-25 | Maintenance | API compatibility (modal async) |
| v1.5.4 | 2025-11-24 | Feature | Permissions system integration |
| v1.5.3 | 2025-11-22 | Feature | Manual condensation controls |

---

## Technical Details

### Why updateParts() Was Failing

The NovelAI `updateParts` API has specific behavior during initialization:

1. **Silent Failure**: `updateParts` does not throw errors when it cannot find elements or when called too early
2. **Timing Dependency**: Panel elements may not be queryable immediately after registration
3. **No Feedback**: Success or failure is not communicated back to the caller

The previous retry loop:
```typescript
// OLD APPROACH (v1.5.5) - This silently failed
for (let attempt = 1; attempt <= 3; attempt++) {
    await api.v1.timers.sleep(100);
    await updateStatusPanel();  // Silent failure
}
```

The new approach eliminates the need for post-registration updates by ensuring the panel is registered with complete, accurate content from the start.

### Files Modified
- `Automatic_Chapter_Summaries_v1.5.6.ts` - Main script file

### Code Locations
- **buildStatusDisplayText()**: Lines 5968-6063
- **Pre-registration content building**: Lines 6949-6978
- **Permission check workaround**: Lines 321-340
- **Startup retry logic**: Lines 7005-7015
- **updateStatusPanel() resilience**: Lines 6137-6175

---

## Support

### Issues or Questions?
- **GitHub Issues**: Report problems or ask questions
- **Documentation**: See main README.md for feature documentation

### Reporting Problems
If you still encounter initialization issues after updating:

1. **Enable DEBUG_MODE** in the script
2. **Check browser console** for error messages
3. **Note exact symptoms** (what displays vs what should display)
4. **Report on GitHub** with details and log output

---

**Version**: 1.5.6
**Release Date**: November 27, 2025
**Type**: Bug Fix
**Previous Version**: 1.5.5

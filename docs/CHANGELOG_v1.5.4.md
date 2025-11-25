# Changelog - Version 1.5.4

## Permissions System Integration

Version 1.5.4 introduces comprehensive integration with NovelAI's permissions API, ensuring the script requests proper access before performing lorebook or document operations.

---

## 🆕 New Features

### Permissions System
- **Permission Checking & Requesting**
  - Script now properly checks for required permissions on initialization
  - Required permissions: `lorebookEdit` and `documentEdit`
  - Automatic permission request flow with user-friendly UI
  
- **Permission Guards**
  - All lorebook operations protected by permission checks
  - All document scanning operations protected by permission checks
  - Functions gracefully handle missing permissions with clear error messages
  
- **Dynamic Permissions UI**
  - Permission status box appears only when permissions are missing
  - Red warning styling with clear explanation of required permissions
  - "Grant Permissions" button for easy permission granting
  - Box automatically hides when permissions are granted
  - Reappears automatically if permissions become disabled

---

## 🐛 Bug Fixes

### Category Initialization After Permission Grant
- **Issue**: When users granted permissions via the UI button, the lorebook category was never created
- **Fix**: Created `initializeLorebookCategory()` helper function that runs after permissions are granted
- **Result**: Category now initializes properly both on startup and after permission grant
- **Impact**: Prevents "category doesn't exist" errors that required manual intervention

### UI Stuck on "Loading..." During Initialization
- **Issue**: Three UI boxes showed "Loading..." text indefinitely until user clicked a button
- **Root Cause**: `updateStatusPanel()` returned early when permissions missing, leaving boxes in their initial state
- **Fix**: Added explicit updates for all dynamic boxes when permissions are missing
- **Added**: 100ms delay after UI registration to ensure panel is ready before updates
- **Result**: Clean UI state on initialization with helpful permission messages instead of stuck loading indicators

### Error Logging Improvements
- **Changed**: Error logging now always uses `api.v1.error()` instead of conditional DEBUG_MODE logging
- **Benefit**: Critical UI update failures are now visible to all users, not just during debugging
- **Added**: Debug trace logging for permission box updates and status panel updates

---

## 🔧 Technical Changes

### Permission API Integration
- Implemented `checkPermissions()` - checks if all required permissions are granted
- Implemented `requestPermissions()` - requests permissions from user with UI refresh
- Implemented `ensurePermissions(operation)` - guard function for protecting operations
- Added `hasRequiredPermissions` state variable - tracks permission status globally
- Added `permissionsChecked` state variable - prevents redundant permission checks

### Category Initialization Refactor
- Extracted category setup logic into `initializeLorebookCategory()` helper
- Function handles: storage retrieval, existence checking, category creation, ID storage
- Called from two locations:
  1. Initialization (if permissions already granted)
  2. After successful permission grant via UI button
- Follows DRY principle and improves maintainability

### UI Update Flow
- `updatePermissionsUI()` now uses `display: none` to completely hide box when permissions granted
- `updateStatusPanel()` updates all three dynamic boxes even when permissions missing
- Shows helpful placeholders instead of generic "Loading..." text:
  - Status box: "⚠️ Permissions Required" message
  - Changed chapters box: "_Permissions required to detect changed chapters_"
  - Condensed ranges box: "_Permissions required to view condensed ranges_"

---

## 📋 Permission Requirements

This script requires the following permissions to function:

| Permission | Purpose |
|------------|---------|
| `lorebookEdit` | Create and manage chapter summary lorebook entries |
| `documentEdit` | Scan document content to detect chapters and changes |

Users will be prompted to grant these permissions on first run or when permissions are revoked.

---

## 🔄 Migration Notes

### For Existing Users
- **No action required** - Script will check permissions on next initialization
- If you already have permissions granted, the script works exactly as before
- If permissions were revoked, you'll see a clear UI prompt to re-grant them

### For New Users
- Script will show red permission box on first run
- Click "Grant Permissions" button to enable functionality
- Box disappears after permissions are granted
- Full script functionality becomes available immediately

---

## 🧪 Testing Scenarios

All scenarios have been tested and verified:

1. **Fresh Install (No Permissions)**
   - ✅ Shows permission request UI
   - ✅ Grants permissions via button
   - ✅ Category creates properly
   - ✅ UI updates immediately
   - ✅ Permission box hides after grant

2. **Existing Installation (Permissions Already Granted)**
   - ✅ No permission UI shown
   - ✅ Category loads from storage
   - ✅ Script functions normally
   - ✅ No breaking changes

3. **Permissions Denied**
   - ✅ Shows clear error messages
   - ✅ All operations blocked gracefully
   - ✅ Can grant permissions later without restart

4. **Permissions Revoked Mid-Session**
   - ✅ Permission box reappears
   - ✅ Operations fail gracefully
   - ✅ Can re-grant without data loss

---

## 📊 Version Comparison

### Before v1.5.4
- No permission checking
- Assumed all permissions granted
- Operations failed silently if permissions missing
- No user feedback about permission issues
- Required manual permission troubleshooting

### After v1.5.4
- ✅ Explicit permission checking
- ✅ User-friendly permission request flow
- ✅ All operations guarded by permission checks
- ✅ Clear UI feedback about permission state
- ✅ Automatic recovery when permissions granted
- ✅ Clean UI that hides permission box when not needed

---

## 🔮 Future Enhancements

Potential improvements for future versions:
- Permission status indicator in panel header
- Automatic retry of failed operations after permission grant
- Per-operation permission feedback (show which operation needs which permission)
- Permission revocation detection with automatic UI updates

---

## 📝 Notes

- This version maintains full backward compatibility with v1.5.3 data structures
- All existing fingerprints, condensed ranges, and backups remain valid
- No data migration required
- DEBUG_MODE logging enhanced for better permission troubleshooting

---

**Version**: 1.5.4  
**Release Date**: November 24, 2025  
**Compatibility**: NovelAI Script API v1 with Permissions support  
**Previous Version**: 1.5.3

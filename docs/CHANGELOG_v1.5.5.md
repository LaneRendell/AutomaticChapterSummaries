# Changelog - Version 1.5.5

## API Compatibility Update

Version 1.5.5 updates the script to be compatible with breaking changes in the NovelAI Script API. This is a maintenance release with no new features - all functionality remains identical to v1.5.4.

---

## 🔧 API Breaking Changes Addressed

### Modal API Updates
The NovelAI Script API introduced breaking changes to the modal system:

**Before (v1.5.4 and earlier):**
```typescript
const modal = api.v1.ui.modal.open({...});  // Returns ModalHandle directly
modal.close();  // Synchronous
await modal.closed;  // Wait for close
```

**After (v1.5.5):**
```typescript
const modal = await api.v1.ui.modal.open({...});  // Returns Promise<ModalHandle>
await modal.close();  // Asynchronous
await modal.closed;  // Wait for close
```

---

## 📝 Changes Made

### All Modal Operations Updated
- ✅ **17 `modal.open()` calls** - All now use `await` to retrieve the modal handle
- ✅ **All `modal.close()` calls** - All now use `await` as the method is async
- ✅ **Callback functions** - Made async wherever they use `await` operations
- ✅ **Promise executors** - Made async for 3 modal creation patterns
- ✅ **`.then()` patterns** - Converted `modal.closed.then()` to `await modal.closed`

### Updated Patterns

**Modal Creation:**
```typescript
// Before
const modal = api.v1.ui.modal.open({
    title: "My Modal",
    content: [...]
});

// After  
const modal = await api.v1.ui.modal.open({
    title: "My Modal",
    content: [...]
});
```

**Modal Closing:**
```typescript
// Before
callback: () => {
    modal.close();
}

// After
callback: async () => {
    await modal.close();
}
```

**Chained Operations:**
```typescript
// Before
modal.close();
modal.closed.then(() => {
    showNextModal();
});

// After
await modal.close();
await modal.closed;
showNextModal();
```

---

## 🎯 Affected Features

All modal-based features have been updated:

### User Interface Modals
- ✅ Condensed range details viewer
- ✅ Backup details browser
- ✅ Backup restore confirmation
- ✅ Changed chapters notifications
- ✅ Token budget warnings

### Configuration Modals
- ✅ Condensation settings modal
- ✅ Manual condensation range selector
- ✅ Generation limit warnings
- ✅ Confirmation dialogs

### All Modals Now Properly Handle
- Async opening (awaits modal handle)
- Async closing (awaits close completion)
- Async callbacks (properly marked as async)
- Proper await patterns throughout

---

## 🔄 Migration from v1.5.4

### For Users
**No action required!** Simply update to v1.5.5:

1. Copy the new script code
2. Paste into NovelAI script editor
3. Save and reload

All your existing data remains compatible:
- ✅ Fingerprints preserved
- ✅ Condensed ranges intact
- ✅ Backups fully compatible
- ✅ Settings unchanged

### For Developers
If you've modified the script, update your modal patterns:

1. **Add `await` before all `modal.open()` calls**
2. **Add `await` before all `modal.close()` calls**
3. **Make callbacks `async` if they use `await`**
4. **Convert `.then()` chains to `await` patterns**

---

## 🧪 Testing Performed

### Comprehensive Modal Testing
- ✅ All 17 modal.open() patterns verified
- ✅ All modal.close() operations tested
- ✅ Callback async conversions validated
- ✅ No TypeScript compilation errors
- ✅ All Promise patterns updated correctly

### Feature Testing
- ✅ Condensed range details modal
- ✅ Backup browser and restore
- ✅ Changed chapters UI interactions
- ✅ Manual condensation modals
- ✅ Generation limit warnings
- ✅ Token budget notifications

---

## 📊 Technical Details

### Files Modified
- `Automatic_Chapter_Summaries_v1.5.5.ts` - Main script file

### Code Changes Summary
- **17 locations**: Added `await` before `api.v1.ui.modal.open()`
- **~25 locations**: Added `await` before `modal.close()` calls
- **~15 callbacks**: Made async to support `await` usage
- **3 Promise executors**: Made async for modal operations
- **~5 patterns**: Converted `.then()` to `await` style

### Pattern Examples

**Simple Modal:**
```diff
- const modal = api.v1.ui.modal.open({
+ const modal = await api.v1.ui.modal.open({
      title: "Example",
      content: [...]
  });
```

**Modal in Callback:**
```diff
  callback: () => {
-     modal.close();
-     modal.closed.then(() => {
-         showNext();
-     });
+     await modal.close();
+     await modal.closed;
+     showNext();
  }
```
*Note: Callback also needs `async` keyword*

**Promise Pattern:**
```diff
- return new Promise((resolve) => {
-     const modal = api.v1.ui.modal.open({
+ return new Promise(async (resolve) => {
+     const modal = await api.v1.ui.modal.open({
          title: "Confirm",
          content: [...]
      });
```

---

## ⚠️ Known Issues

### Duplicate Identifier Warnings
When both v1.5.4 and v1.5.5 are open in the editor, TypeScript may show duplicate identifier warnings. This is expected and can be ignored. The warnings disappear when only one version is open.

**Error Message:**
```
Definitions of the following identifiers conflict with those in another file:
DocumentSections, FailedChapter, CondensedRange, ...
```

**Solution:**
- Close v1.5.4 before editing v1.5.5
- Or ignore the warnings - they don't affect functionality

---

## 🔮 Future Compatibility

### NovelAI API Tracking
This release addresses the modal API changes announced on November 25, 2025. Future API changes will be tracked and addressed in subsequent releases.

### Related API Changes (Not Yet Implemented)
The NovelAI API changelog also mentioned:
- ✅ `buildContext` parameter renamed to `contextLimitReduction` - Not used by this script
- ✅ `update`/`close` methods removed from type declarations - Already using instance methods
- ✅ `createCancellationSignal` drain fix - Not used by this script
- ✅ `onBeforeContextBuild` hook added - Not currently needed
- ✅ `onTextAdventureInput` hook added - Not currently needed
- ✅ `getOrDefault` undefined handling fix - Not affected

---

## 📈 Version History Context

### Recent Versions
- **v1.5.5** (2025-11-25) - API compatibility update (this release)
- **v1.5.4** (2025-11-24) - Permissions system integration
- **v1.5.3** (2025-11-22) - Manual condensation controls
- **v1.5.2** (2025-11-22) - Fixed automatic processing bypass
- **v1.5.1** (2025-11) - Condensed ranges UI

### Upgrade Path
```
v1.5.4 → v1.5.5: Just update the script (no data changes)
v1.5.3 → v1.5.5: Update and benefit from permissions + API fixes
v1.5.x → v1.5.5: All data fully compatible
```

---

## 🎯 Impact Assessment

### User Impact
**Minimal** - Users will see no difference in functionality:
- All features work identically
- No UI changes
- No data format changes
- No configuration changes required

### Developer Impact  
**Low** - Simple pattern updates required:
- Straightforward async/await conversions
- No complex refactoring needed
- TypeScript catches all issues at compile time
- Clear error messages for missed patterns

---

## 🔍 Verification

### How to Verify the Update
1. **Check Version Number**
   ```typescript
   // In script header
   // Chapter Summarize v1.5.5: API compatibility update
   ```

2. **Check Changelog**
   ```typescript
   // CHANGELOG v1.5.5:
   // - [API COMPATIBILITY] Updated for NovelAI Script API breaking changes
   ```

3. **Test Modal Operations**
   - Open "View/Restore Backups" - should work smoothly
   - Open "Condense With Settings" - should work smoothly
   - Try any modal-based feature - all should function normally

---

## 📞 Support

### Issues or Questions?
- **GitHub Issues**: Report problems or ask questions
- **Documentation**: See main README.md for feature documentation
- **API Changes**: Refer to NovelAI's API changelog for details

### Reporting Problems
If you encounter issues after updating:

1. **Enable DEBUG_MODE** in the script
2. **Check browser console** for error messages
3. **Note which modal/feature** is affected
4. **Report on GitHub** with details

---

## ✅ Summary

**Version 1.5.5 is a compatibility update** that ensures the Automatic Chapter Summaries script works with the latest NovelAI Script API changes. All modal-based operations have been updated to use the new async patterns.

**Key Points:**
- ✅ All 17 modal operations updated
- ✅ Full async/await compliance
- ✅ No data format changes
- ✅ No feature changes
- ✅ No user action required
- ✅ Fully tested and validated

**Recommendation:**
All users on v1.5.4 should update to v1.5.5 to ensure continued compatibility with NovelAI's platform.

---

**Version**: 1.5.5  
**Release Date**: November 25, 2025  
**Type**: Maintenance / API Compatibility  
**Previous Version**: 1.5.4  
**Next Version**: TBD

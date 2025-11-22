// Chapter Summarize v1.4.1: Bug fixes and safety enhancements
// At scene breaks, or new chapters this script will use GLM to summarize the content of the previous chapter,
// add it as Lorebook entry and set it to always on.
// Includes automatic token management, condensation, automatic change detection, and auto-regeneration.

// CHANGELOG v1.4.1:
// - [BUG FIX] Full rebuild now respects 5-generation limit
//   * Added generation counter tracking to performFullRebuild()
//   * Counter increments for each regenerate/generate action
//   * Counter resets before and after rebuild completes
// - [BUG FIX] Retry failed chapters now respects 5-generation limit
//   * Added generation counter tracking to retryFailedChapters()
//   * Counter resets before retry operations and after completion
// - [BUG FIX] Stale UI status messages now auto-clear
//   * updateStatusPanel() clears retry-status and rebuild-progress when no active operations
//   * Prevents persistent "Retry complete" and similar messages
// - [BUG FIX] Token budget warning after manual generation
//   * New checkTokenBudgetAfterGeneration() function in onResponse hook
//   * Shows warning modal when approaching threshold
//   * Forces condensation when over hard limit
//   * State-tracked condensationWarningShown flag prevents modal spam
// - [BUG FIX] Editing condensed chapters now triggers proper regeneration
//   * Fixed expandCondensedRange() fingerprint preservation
//   * Changed chapters: Only mark isCondensed=false, preserve old hash
//   * Unchanged chapters: Update fingerprint with current text
//   * Allows proper detection and regeneration of edited condensed chapters
// - [CRITICAL BUG FIX] Regex pattern now supports plural "Chapters"
//   * Changed from /^Chapter (\d+)/ to /^Chapters? (\d+)/
//   * Affects getChapterSummaryEntries(), regenerateChapter(), findEntryByChapterNumber()
//   * Was causing: Wrong token counts, missing fingerprints, broken change detection
//   * System was silently failing to detect condensed entries ("Chapters 1-3")
// - [BUG FIX] Generation counter now tracks expansion operations
//   * expandCondensedRange() increments counter for each chapter regenerated
//   * Prevents hitting generation limit without modal during expansion
// - [BUG FIX] Generation counter now tracks condensation operations
//   * condenseSummaries() increments counter for condensation generation
//   * Ensures proper tracking across all generation operation types
// - [IMPROVEMENT] Enhanced debug logging for condensed chapters
//   * Logs condensed chapter count during detection
//   * Shows stored vs current hash comparisons
//   * Helps diagnose fingerprint and detection issues
// - [IMPROVEMENT] New "Refresh All Fingerprints" debug utility
//   * Rescans document and updates all fingerprints to current state
//   * Preserves isCondensed flag during update
//   * Allows recovery from bad fingerprint state
//   * Located in Testing & Debug section (DEBUG_MODE only)

// CHANGELOG v1.4.0:
// - [NEW FEATURE] Automatic change detection after each generation
//   * New config option: autoDetectOnGeneration (default: false)
//   * Hooks into onResponse to detect edited chapters after user generates text
//   * Respects NovelAI's 5-generation non-interactive limit
// - [NEW FEATURE] Automatic regeneration of changed chapters
//   * New config option: autoRegenerate (default: false)
//   * When enabled, automatically regenerates detected changed chapters
//   * When disabled, shows notifications for manual review
//   * Smart generation limit handling with user confirmation modal at 4/5 limit
// - [BUG FIX] Fixed summarizeAllBreaks config to actually work
//   * When true: All chapter breaks create summaries (previous behavior)
//   * When false: Only breaks followed by [ on next line create summaries
//   * Title extraction now handles incomplete brackets gracefully
// - [IMPROVEMENT] Enhanced UI notifications for auto-detection
//   * Shows "Auto-detected X changed chapters" with timestamp
//   * Notifications persist until dismissed or next auto-detection
//   * "Last auto-check" timestamp in status display
// - [IMPROVEMENT] Generation counter tracking
//   * Tracks non-interactive generations to respect 5-generation limit
//   * Resets automatically when user performs text generation or UI callback
//   * Shows warning modal at 4 generations with option to continue

// CHANGELOG v1.3.2:
// - [BUG FIX] Fixed duplicate lorebook entries after rebuild
//   * Added manual entry deletion loop in finalizeRebuildCategories() before calling removeCategory()
//   * NovelAI's removeCategory() does not cascade delete entries, causing orphaned entries
//   * Now explicitly deletes all entries in backup category before deleting the category itself
// - [BUG FIX] Added missing rebuild-progress UI element to panel
//   * Element was referenced in rebuild logic but never added to the UI panel
//   * Now displays real-time progress during rebuild operations (e.g., "Processing chapter 5/12...")
//   * Clear rebuild-progress element on initialization to prevent stale messages
// - [BUG FIX] Complete rewrite of showBackupModal() with restore functionality
//   * Old version only displayed backup list without any restore capability
//   * New version includes individual "Restore" button for each backup
//   * Added inline confirmation modal to prevent accidental restores
//   * Confirmation modal uses api.v1.ui.modal.open() to avoid z-index layering issues with Larry dialogs
// - [BUG FIX] Fixed restoreFromBackup() category ID assignment
//   * Restored entries were being assigned old backup category IDs instead of current category ID
//   * Now correctly assigns category: lorebookCategoryId to all restored entries
//   * Added debug logging to track category ID assignment during restore
// - [IMPROVEMENT] Updated panel title to "Chapter Summaries v1.3.2"
//   * Previously showed v1.3.2 in title but v1.3.1 in log messages (inconsistent)
// - [IMPROVEMENT] Wrapped Testing & Debug section behind DEBUG_MODE flag
//   * Clean production UI when DEBUG_MODE = false
//   * Testing section only visible during development (DEBUG_MODE = true)
//   * Built panel content as dynamic array with conditional push of debug UI elements
// - [IMPROVEMENT] Updated "View Backups" test button to use full showBackupModal()
//   * Now provides same restore functionality as the main "View/Restore Backups" button
//   * Consistent UX across testing and production interfaces
// - [IMPROVEMENT] Replaced Larry confirmation dialogs with inline modals
//   * Larry dialogs (api.v1.ui.larry.help()) appear behind modal windows due to z-index
//   * Converted to api.v1.ui.modal.open() for proper layering and better UX
//   * Affects restore confirmations and other critical user confirmations

// CHANGELOG v1.3.1:
// - Individual "Regenerate" button per changed chapter
// - Individual "Dismiss" button per changed chapter
// - Clean list layout with separators
// - "Regenerate All" bulk action (existing)
// - "Dismiss All" bulk action (new)
// - "Check for Changes" button in proper location
// - Dynamic UI that rebuilds when changes occur
// - Visual feedback for all actions

// CHANGELOG v1.3.0:
// - NEW: Chapter text fingerprinting with hash storage
// - NEW: Manual "Check for Changes" function to detect edited chapters
// - NEW: "Regenerate Chapter X" functionality for individual chapter updates
// - NEW: "Regenerate All Changed" batch processing
// - NEW: UI indicators showing which chapters have been modified
// - NEW: Dismiss changed chapter warnings
// - Stores text hash for each chapter when summary is created
// - Detects text changes by comparing current hash to stored hash
// - Handles condensed chapters specially (marks entire range as changed)

// CHANGELOG v1.2.2:
// - Fixed chapter break detection to only match when token is on its own line
// - Prevents false triggering when break token appears in middle of text (e.g., "Some text *** more text")
// - Improved title detection logic for summarizeAllBreaks=false mode
// - Added DEBUG_MODE logging for title pattern matching

// CHANGELOG v1.2.1:
// - Fixed race condition where editor unlocks before background summary generation completes
// - Added backgroundSummaryInProgress flag to track background work
// - Enhanced UI to show when background summarization is happening
// - Added extra editor ready check in scheduled generation

// TODO: Add ability to view archived summaries
// TODO: Phase 2-4 of retroactive updates (automatic detection, full rebuild, etc.)
// KNOWN LIMITATIONS: Phase 1 only detects changes in existing chapters. Adding/removing chapter breaks retroactively requires "Rebuild All" (Phase 3, not yet implemented).

// Typedefs
type DocumentSections = { sectionId: number; section: Section; index: number }[];
type FailedChapter = {
    chapterNumber: number;
    attempts: number;
    lastError: string;
    timestamp: number;
}

type CondensedRange = {
    id: string;
    startChapter: number;
    endChapter: number;
    lorebookEntryId: string;
    originalSummaries: ArchivedSummary[];
    condensedTokens: number;
    condensedAt: number;
}

type ArchivedSummary = {
    chapterNumber: number;
    title: string;
    text: string;
    originalEntryId: string;
    archivedAt: number;
}

type ChapterSummaryEntry = {
    entryId: string;
    chapterNumber: number;
    startChapter: number;  // For condensed entries
    endChapter: number;    // For condensed entries
    title: string;
    text: string;
    isCondensed: boolean;
    tokenCount: number;
}

type ChapterFingerprint = {
    chapterNumber: number;
    textHash: string;
    summaryCreatedAt: number;
    isCondensed: boolean;   // track if this chapter is part of a condensed summary
}

type ChangedChapter = {
    chapterNumber: number;
    detectedAt: number;
    currentHash: string;
    storedHash: string;
    title: string | null;   // For display in UI
}

type RebuildAction = {
    chapterNumber: number;
    title: string | null;
    action: "reuse" | "regenerate" | "generate";
    existingHash?: string;
    currentHash: string;
}

type RebuildAnalysis = {
    currentChapterCount: number;
    detectedChapterCount: number;
    actions: RebuildAction[];
    stats: {
        unchanged: number;
        changed: number;
        new: number;
    };
    estimatedTimeSeconds: number;
}

type RebuildBackup = {
    timestamp: number;
    reason: string;
    categoryName: string;
    entries: LorebookEntry[];
    fingerprints: ChapterFingerprint[];
    changedChapters: ChangedChapter[];
    condensedRanges: CondensedRange[];
    failedChapters: FailedChapter[];
    lastProcessedChapterCount: number;
    isFirstChapter: boolean;
    chapterCount: number;
}

// ============================================================================

// Internal Config Variables
const DEBUG_MODE: boolean = true;
const MAX_RETRIES: number = 5;
const RETRY_DELAYS: number[] = [1000, 2000, 3000, 4000, 5000]; // Progressive backoff
const EDITOR_READY_TIMEOUT: number = 15000; // 15 seconds max wait
const SCRIPT_VERSION: string = api.v1.script.version // Script version number

// Configuration Schema variables
let chapterBreakToken: string = "";
let lorebookCategoryName: string = "";
let lorebookCategoryId: string = "";
let summarizeAllBreaks: boolean = true;
let isFirstChapter: boolean = false;
let summaryMaxtokens: number;
let promptString: string;

// Token management config variables
let maxTotalSummaryTokens: number;
let condensationThreshold: number;
let recentChaptersToKeep: number;
let chaptersPerCondensedGroup: number;

// Rebuild config
let maxRebuildBackups: number;

// Auto-detection config (v1.4.0)
let autoDetectOnGeneration: boolean;
let autoRegenerate: boolean;

// Track background work
let backgroundSummaryInProgress: boolean = false;
let batchRegenerationInProgress: boolean = false;

// Auto-detection state (v1.4.0)
let generationCounter: number = 0;  // Track non-interactive generations (resets on user action)
let lastAutoCheckTimestamp: number = 0;  // Track when last auto-check happened
let autoDetectionNotification: string = "";  // Current auto-detection notification message
let autoRegenerationInProgress: boolean = false;  // Prevents hook loops during auto-regeneration

// Condensation warning state (v1.4.1)
let condensationWarningShown: boolean = false;  // Track if we've shown the warning modal this session

// ============================================================================
// HASHING FUNCTION
// ============================================================================

/**
 * Hash a string using djb2 algorithm for chapter fingerprinting
 * @param text string input text to hash
 * @returns string base-36 encoded for compact storage
 */
function hashString(text: string): string {
    let hash: number = 5381;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) + hash) + text.charCodeAt(i); // hash * 33 + c

        // Keep hash in 32-bit integer range
        hash = hash & hash;
    }

    // Convert to unsigned and base-36 for compactness
    return Math.abs(hash).toString(36);
}

// ============================================================================
// CHAPTER FINGERPRINT FUNCTIONS
// ============================================================================

/**
 * Store a fingerprint for a chapter when its summary is created
 * 
 * @param chapterNumber number Index of chapter we're storing
 * @param text string textual content of the chapter
 * @param isCondensed boolean whether the chapter is condensed
 */
async function storeChapterFingerprint(chapterNumber: number, text: string, isCondensed: boolean = true): Promise<void> {
    const fingerprints: ChapterFingerprint[] = await api.v1.storyStorage.get("chapterFingerprints") || [];
    const textHash = hashString(text);

    // Remove any existing fingerprint for this chapter
    const filtered = fingerprints.filter((f: ChapterFingerprint) => f.chapterNumber !== chapterNumber);

    // Add new fingerprint
    filtered.push({
        chapterNumber,
        textHash,
        summaryCreatedAt: Date.now(),
        isCondensed
    });

    await api.v1.storyStorage.set("chapterFingerprints", filtered);

    if (DEBUG_MODE) {
        api.v1.log(`Stored fingerprint for chapter ${chapterNumber}: hash=${textHash}`);
    }
}

/**
 * Retrieve all stored chapter fingerprints
 * @returns Promise<ChapterFingerprint[]> array of fingerprints
 */
async function getChapterFingerprints(): Promise<ChapterFingerprint[]> {
    return await api.v1.storyStorage.get("chapterFingerprints") || [];
}

/**
 * Get all changed chapters from storage
 * @returns Promise<ChangedChapter[]> array of changed chapters
 */
async function getChangedChapters(): Promise<ChangedChapter[]> {
    return await api.v1.storyStorage.get("changedChapters") || [];
}

/**
 * Store changed chapters list
 * @param changed ChangedChapter[] array or ChangedChapters to store
 */
async function setChangedChapters(changed: ChangedChapter[]): Promise<void> {
    await api.v1.storyStorage.set("changedChapters", changed);
}

/**
 * v1.4.1: Check if a chapter is part of a condensed range
 * @param chapterNumber number Chapter to check
 * @returns Promise<CondensedRange | null> The condensed range if found, null otherwise
 */
async function findCondensedRangeForChapter(chapterNumber: number): Promise<CondensedRange | null> {
    const condensedRanges: CondensedRange[] = await api.v1.storyStorage.get("condensedRanges") || [];
    
    for (const range of condensedRanges) {
        if (range.startChapter <= chapterNumber && chapterNumber <= range.endChapter) {
            if (DEBUG_MODE) {
                api.v1.log(`Chapter ${chapterNumber} is part of condensed range: ${range.startChapter}-${range.endChapter}`);
            }
            return range;
        }
    }
    
    return null;
}

/**
 * v1.4.1: Check if a chapter's fingerprint indicates it's condensed
 * @param chapterNumber number Chapter to check
 * @returns Promise<boolean> true if chapter is marked as condensed
 */
async function isChapterCondensed(chapterNumber: number): Promise<boolean> {
    const fingerprints: ChapterFingerprint[] = await getChapterFingerprints();
    const fp = fingerprints.find(f => f.chapterNumber === chapterNumber);
    return fp?.isCondensed || false;
}

/**
 * Scan all chapters and detect which ones have been edited
 * @returns Promise<ChangedChapter[]> array of changed chapters
 */
async function detectChangedChapters(): Promise<ChangedChapter[]> {
    if (DEBUG_MODE) {
        api.v1.log("=== Detecting changed chapters ===");
    }

    const sections: DocumentSections = await api.v1.document.scan();
    const fullText = sections.map(s => s.section.text).join('\n');

    // Get chapter breaks
    const escapedToken = chapterBreakToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const breakPattern = new RegExp(`(?:^|\\n)\\s*${escapedToken}\\s*(?=\\n|$)`, 'gm');
    const chapterBreakCount = (fullText.match(breakPattern) || []).length;

    if (DEBUG_MODE) {
        api.v1.log(`Found ${chapterBreakCount} chapter breaks`);
    }

    // Get all stored fingerprints
    const fingerprints = await getChapterFingerprints();

    if (fingerprints.length === 0) {
        if (DEBUG_MODE) {
            api.v1.log("No stored fingerprints found; nothing to compare.");
        }
        return [];
    }

    // v1.4.1: Log condensed chapter info
    const condensedCount = fingerprints.filter(fp => fp.isCondensed).length;
    if (DEBUG_MODE && condensedCount > 0) {
        api.v1.log(`Found ${condensedCount} condensed chapter fingerprints`);
    }

    // Split into chapters (respects summarizeAllBreaks config)
    const chapters: string[] = splitIntoChapters(fullText);
    const changed: ChangedChapter[] = [];

    // Check each stored fingerprint against current chapter text
    for (const fp of fingerprints) {
        // Get current chapter text
        let chapterText: string;
        if (fp.chapterNumber === 1) {
            chapterText = chapters[0] || "";
        } else {
            const chapterIndex = fp.chapterNumber - 1;
            chapterText = chapters[chapterIndex] || "";
        }

        // Skip if chapter doesn't exist (e.g., removed chapter)
        if (!chapterText) {
            if (DEBUG_MODE) {
                api.v1.log(`Chapter ${fp.chapterNumber} no longer exists; probably removed.`);
            }
            continue;
        }

        // Hash current chapter text
        const currentHash: string = hashString(chapterText);

        // v1.4.1: Enhanced debug logging for condensed chapters
        if (DEBUG_MODE && fp.isCondensed) {
            api.v1.log(`Checking condensed chapter ${fp.chapterNumber}:`);
            api.v1.log(`  Stored hash: ${fp.textHash}`);
            api.v1.log(`  Current hash: ${currentHash}`);
            api.v1.log(`  Match: ${currentHash === fp.textHash}`);
        }

        // Compare hashes
        if (currentHash !== fp.textHash) {
            const title: string | null = extractChapterTitle(chapterText);

            changed.push({
                chapterNumber: fp.chapterNumber,
                detectedAt: Date.now(),
                currentHash,
                storedHash: fp.textHash,
                title
            });

            if (DEBUG_MODE) {
                api.v1.log(`Chapter ${fp.chapterNumber} HAS changed`);
                api.v1.log(`  Stored hash: ${fp.textHash}`);
                api.v1.log(`  Current hash: ${currentHash}`);
            }
        } else {
            if (DEBUG_MODE) {
                api.v1.log(`Chapter ${fp.chapterNumber} unchanged (hash: ${currentHash})`);
            }
        }
    }

    if (DEBUG_MODE) {
        api.v1.log(`=== Detection complete: ${changed.length} changed chapter(s) found ===`);
    }

    // Store changed chapters
    await setChangedChapters(changed);

    return changed;
}

/**
 * v1.4.1: Expand a condensed range back into individual chapter summaries
 * Used when a chapter in a condensed range is edited and needs regeneration
 * 
 * @param range CondensedRange The condensed range to expand
 * @returns Promise<void>
 */
async function expandCondensedRange(range: CondensedRange): Promise<void> {
    if (DEBUG_MODE) {
        api.v1.log(`=== Expanding Condensed Range: Chapters ${range.startChapter}-${range.endChapter} ===`);
    }

    // Get changed chapters to know which ones need regeneration vs just expansion
    const changedChapters: ChangedChapter[] = await getChangedChapters();
    const changedChapterNumbers = new Set(changedChapters.map(c => c.chapterNumber));

    // Get current document text
    const sections: DocumentSections = await api.v1.document.scan();
    const fullText = sections.map(s => s.section.text).join('\n');
    const chapters: string[] = splitIntoChapters(fullText);

    // Delete the condensed lorebook entry
    if (DEBUG_MODE) {
        api.v1.log(`Deleting condensed lorebook entry: ${range.lorebookEntryId}`);
    }
    await api.v1.lorebook.removeEntry(range.lorebookEntryId);

    // Regenerate individual summaries for each chapter in the range
    for (let chapterNum = range.startChapter; chapterNum <= range.endChapter; chapterNum++) {
        if (DEBUG_MODE) {
            api.v1.log(`Expanding chapter ${chapterNum}...`);
        }

        // Get chapter text
        let chapterText: string;
        if (chapterNum === 1) {
            chapterText = chapters[0] || "";
        } else {
            const chapterIndex = chapterNum - 1;
            chapterText = chapters[chapterIndex] || "";
        }

        if (!chapterText || chapterText.trim().length === 0) {
            if (DEBUG_MODE) {
                api.v1.log(`⚠️ Chapter ${chapterNum} text is empty, skipping`);
            }
            continue;
        }

        const title: string | null = extractChapterTitle(chapterText);
        const chapterTitle: string = title || `Chapter ${chapterNum}`;

        // v1.4.1: Increment generation counter for expansion
        generationCounter++;
        if (DEBUG_MODE) {
            api.v1.log(`Expansion generation counter: ${generationCounter}/5 for chapter ${chapterNum}`);
        }

        // Generate summary
        const summaryPrompt: string = promptString.replace("{chapter_text}", chapterText).replace("{chapter_title}", chapterTitle);
        const messages: Message[] = [{
            role: "user",
            content: summaryPrompt
        }];

        const params: GenerationParams = await api.v1.generationParameters.get();
        params.max_tokens = summaryMaxtokens;

        try {
            const result: GenerationResponse = await retryableGenerate(messages, params, chapterNum);
            const summaryText: string = result.choices[0].text.trim();

            // Create formatted entry text
            const entryText: string = `Chapter ${chapterNum}: ${chapterTitle}\nType: chapter\nSummary: ${summaryText}`;

            // Create new lorebook entry
            const newEntryId = api.v1.uuid();
            await api.v1.lorebook.createEntry({
                id: newEntryId,
                displayName: chapterTitle,
                text: entryText,
                category: lorebookCategoryId,
                enabled: true,
                forceActivation: true,
                hidden: false,
                keys: undefined,
            });

            // v1.4.1 FIX: Only update fingerprint if this chapter wasn't changed
            // If it was changed, leave the OLD hash so detection still shows it as changed
            // and it will be regenerated by the auto-regeneration system
            if (changedChapterNumbers.has(chapterNum)) {
                if (DEBUG_MODE) {
                    api.v1.log(`⚠️ Chapter ${chapterNum} is in changed list - NOT updating fingerprint (will regenerate)`);
                }
                // Just mark as not condensed, but keep old hash
                const fingerprints: ChapterFingerprint[] = await getChapterFingerprints();
                const fp = fingerprints.find(f => f.chapterNumber === chapterNum);
                if (fp) {
                    fp.isCondensed = false;
                    await api.v1.storyStorage.set("chapterFingerprints", fingerprints);
                }
            } else {
                // Chapter unchanged - update fingerprint with current text
                await storeChapterFingerprint(chapterNum, chapterText, false);
            }

            if (DEBUG_MODE) {
                api.v1.log(`✓ Expanded chapter ${chapterNum} successfully`);
            }

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            api.v1.error(`Failed to expand chapter ${chapterNum}:`, errorMsg);
            // Continue with other chapters even if one fails
        }
    }

    // Remove the condensed range from storage
    const condensedRanges: CondensedRange[] = await api.v1.storyStorage.get("condensedRanges") || [];
    const updatedRanges = condensedRanges.filter(r => r.id !== range.id);
    await api.v1.storyStorage.set("condensedRanges", updatedRanges);

    if (DEBUG_MODE) {
        api.v1.log(`✓ Condensed range ${range.startChapter}-${range.endChapter} fully expanded`);
    }
}

/**
 * Regenerate summary for a specific changed chapter
 * MODIFIED in v1.4.1: Detects condensed chapters and expands entire range
 * 
 * TODO: Optimize to not scan entire document again
 * 
 * @param chapterNumber number Changed chapter to regenerate
 */
async function regenerateChapter(chapterNumber: number): Promise<void> {
    api.v1.log(`=== Regenerating chapter ${chapterNumber} summary ===`);

    // v1.4.1: Check if this chapter is part of a condensed range
    const condensedRange = await findCondensedRangeForChapter(chapterNumber);
    
    if (condensedRange) {
        api.v1.log(`⚠️ Chapter ${chapterNumber} is part of condensed range ${condensedRange.startChapter}-${condensedRange.endChapter}`);
        api.v1.log(`Expanding entire range to regenerate individual summaries...`);
        
        // Expand the entire condensed range
        await expandCondensedRange(condensedRange);
        
        // Remove all chapters in the range from changed chapters list
        const changedChapters: ChangedChapter[] = await getChangedChapters();
        const updatedChanged = changedChapters.filter(c => 
            c.chapterNumber < condensedRange.startChapter || c.chapterNumber > condensedRange.endChapter
        );
        await setChangedChapters(updatedChanged);
        
        api.v1.log(`✓ Condensed range expanded and regenerated`);
        
        // v1.4.1: Check if condensation is needed after expanding range
        if (DEBUG_MODE) {
            api.v1.log("Checking if condensation needed after range expansion...");
        }
        
        try {
            await checkAndCondenseIfNeeded();
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            api.v1.error("Error during post-expansion condensation check:", errorMsg);
            // Don't fail the entire operation, just log the error
        }
        
        await updateStatusPanel();
        return;
    }

    // Get current chapter text
    const sections: DocumentSections = await api.v1.document.scan();
    const fullText = sections.map(s => s.section.text).join('\n');
    const chapters: string[] = splitIntoChapters(fullText);

    let chapterText: string;
    if (chapterNumber === 1) {
        chapterText = chapters[0] || "";
    } else {
        const chapterIndex = chapterNumber - 1;
        chapterText = chapters[chapterIndex] || "";
    }

    if (!chapterText) {
        throw new Error(`Chapter ${chapterNumber} text not found for regeneration`);
    }

    const title: string | null = extractChapterTitle(chapterText);

    if (DEBUG_MODE) {
        api.v1.log(`Chapter ${chapterNumber} text length: ${chapterText.length} characters`);
        api.v1.log(`Extracted title: ${title || "(none)"}`);
    }

    // Find and delete existing lorebook entry for this chapter
    const entries: LorebookEntry[] = await api.v1.lorebook.entries(lorebookCategoryId);
    for (const entry of entries) {
        if (!entry.text) continue;

        // Check if this is the entry for this chapter
        // v1.4.1 FIX: Support both "Chapter" and "Chapters" for condensed entries
        const chapterMatch = entry.text.match(/^Chapters? (\d+)(?:-(\d+))?/);
        if (!chapterMatch) continue;

        const startChapter: number = parseInt(chapterMatch[1]);
        const endChapter: number = chapterMatch[2] ? parseInt(chapterMatch[2]) : startChapter;

        // If this entry covers our chapter
        if (startChapter <= chapterNumber && chapterNumber <= endChapter) {
            if (DEBUG_MODE) {
                api.v1.log(`Deleting existing lorebook entry for chapter ${chapterNumber}: ${entry.id}`);
            }
            await api.v1.lorebook.removeEntry(entry.id);
            break;
        }
    }

    // Generate new summary
    const chapterTitle: string = title || `Chapter ${chapterNumber}`;

    const summaryPrompt: string = promptString.replace("{chapter_text}", chapterText).replace("{chapter_title}", chapterTitle);
    const messages: Message[] = [{
        role: "user",
        content: summaryPrompt
    }];

    const params: GenerationParams = await api.v1.generationParameters.get();
    params.max_tokens = summaryMaxtokens;

    const result: GenerationResponse = await retryableGenerate(messages, params, chapterNumber);
    const summaryText: string = result.choices[0].text.trim();

    // Create formatted entry text
    const entryText: string = `Chapter ${chapterNumber}: ${chapterTitle}\nType: chapter\nSummary: ${summaryText}`;

    // Create new lorebook entry
    const newEntryId = api.v1.uuid();
    await api.v1.lorebook.createEntry({
        id: newEntryId,
        displayName: chapterTitle,
        text: entryText,
        category: lorebookCategoryId,
        enabled: true,
        forceActivation: true,
        hidden: false,
        keys: undefined,
    });

    // Store new fingerprint
    await storeChapterFingerprint(chapterNumber, chapterText, false);

    // Remove from changed chapters list
    const changedChapters: ChangedChapter[] = await getChangedChapters();
    const updatedChanged = changedChapters.filter(c => c.chapterNumber !== chapterNumber);
    await setChangedChapters(updatedChanged);

    api.v1.log(`✓ Chapter ${chapterNumber} summary regenerated successfully`);

    // Update status panel
    await updateStatusPanel();
}

/**
 * Dismiss a changed chapter warning without regenerating
 * @param chapterNumber number Chapter to dismiss the warning for.
 */
async function dismissChangedChapterWarning(chapterNumber: number): Promise<void> {
    const changedChapters: ChangedChapter[] = await getChangedChapters();
    const filtered: ChangedChapter[] = changedChapters.filter(c => c.chapterNumber !== chapterNumber);
    await setChangedChapters(filtered);

    if (DEBUG_MODE) {
        api.v1.log(`Dismissed changed chapter warning for chapter ${chapterNumber}`);
    }

    await updateStatusPanel();
}

/**
 * Regenerate a single chapter with UI feedback (wrapper for individual button)
 * @param chapterNumber number Chapter to regenerate update summary for
 */
async function regenerateIndividualChapter(chapterNumber: number): Promise<void> {
    if (DEBUG_MODE) {
        api.v1.log(`Individual regeneration requested for chapter ${chapterNumber}`);
    }

    try {
        await regenerateChapter(chapterNumber);
        
        // regenerateChapter() already calls updateStatusPanel(), but we call it again
        // to ensure the UI is fully refreshed and the regenerated chapter is removed from the list
        await updateStatusPanel();

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        api.v1.error(`Failed to regenerate chapter ${chapterNumber}:`, errorMsg);
        
        // Still update the panel to show current state even on error
        await updateStatusPanel();
    }
}

/**
 * Dismiss a single chapter warning with UI feedback (wrapper for individual button)
 * @param chapterNumber number Chapter warning button to dismiss
 */
async function dismissIndividualChapter(chapterNumber: number): Promise<void> {
    if (DEBUG_MODE) {
        api.v1.log(`Individual dismiss triggered for chapter ${chapterNumber}`);
    }

    await dismissChangedChapterWarning(chapterNumber);
    
    // Update panel immediately to refresh the changed chapters list
    await updateStatusPanel();
}

/**
 * Dismiss all changed chapter warnings
 */
async function dismissAllChangedChapters(): Promise<void> {
    const changed: ChangedChapter[] = await getChangedChapters();

    if (changed.length === 0) {
        api.v1.ui.larry.help({
            question: "No changed chapters to dismiss.",
            options: [
                { text: "OK", callback: () => { } }
            ]
        });
        return;
    }

    api.v1.ui.larry.help({
        question: `Dismiss ${changed.length} changed chapter warning(s)? You can always detect changes again later.`,
        options: [
            {
                text: "Yes, Dismiss All",
                callback: async () => {
                    await setChangedChapters([]);
                    api.v1.log(`Dismissed all ${changed.length} changed chapter warnings`);

                    await api.v1.ui.updateParts([{
                        id: "changed-chapters-status",
                        text: `✓ Dismissed all changed chapter warnings.`
                    }]);

                    await api.v1.timers.sleep(500);
                    await updateStatusPanel();
                }
            },
            {
                text: "Cancel",
                callback: () => {
                    api.v1.log("Dismiss all cancelled");
                }
            }
        ]
    });
}

// ===========================================================================
// Rebuild Backup Functions
// ============================================================================

/**
 * Analyze the current document structure and compare against existing summaries
 * Returns a detailed analysis of what would happen during a rebuild
 * @returns Promise<RebuildAnalysis> analysis of rebiuld actions needed
 */
async function analyzeRebuild(): Promise<RebuildAnalysis> {
    if (DEBUG_MODE) {
        api.v1.log("=== Starting Rebuild Analysis ===");
    }

    // Get current document structure
    const sections: DocumentSections = await api.v1.document.scan();
    const fullText = sections.map(s => s.section.text).join('\n');

    // Count chapter breaks
    const escapedToken = chapterBreakToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const breakPattern = new RegExp(`(?:^|\\n)\\s*${escapedToken}\\s*(?=\\n|$)`, 'gm');
    const chapterBreakCount = (fullText.match(breakPattern) || []).length;
    const detectedChapterCount = chapterBreakCount + 1; // Chapters = breaks + 1 for chapter 1

    if (DEBUG_MODE) {
        api.v1.log(`Detected ${detectedChapterCount} chapters in document`);
    }

    // Split into chapters (respects summarizeAllBreaks config in v1.4.0)
    const chapters: string[] = splitIntoChapters(fullText);

    // Get existing fingerprints
    const existingFingerprints: ChapterFingerprint[] = await getChapterFingerprints();
    const fingerprintMap: Map<string, ChapterFingerprint> = new Map<string, ChapterFingerprint>();

    for (const fp of existingFingerprints) {
        fingerprintMap.set(fp.textHash, fp);
    }

    if (DEBUG_MODE) {
        api.v1.log(`Found ${existingFingerprints.length} existing fingerprints`);
    }

    // Analyze each chapter
    const actions: RebuildAction[] = [];
    let unchangedCount: number = 0;
    let changedCount: number = 0;
    let newChaptersCount: number = 0;

    for (let i = 0; i < chapters.length; i++) {
        const chapterNumber: number = i + 1;
        const chapterText: string = chapters[i];

        if (!chapterText || chapterText.trim().length === 0) {
            if (DEBUG_MODE) {
                api.v1.log(`Chapter ${chapterNumber} is empty; skipping`);
            }
            continue;
        }

        const currentHash: string = hashString(chapterText);
        const title: string | null = extractChapterTitle(chapterText);

        // Check if we have this exact text fingerprint already
        const existingFingerprint = fingerprintMap.get(currentHash);

        if (existingFingerprint) {
            // Exact match - we can reuse existing summary
            actions.push({
                chapterNumber,
                title,
                action: "reuse",
                existingHash: currentHash,
                currentHash
            });
            unchangedCount++;

            if (DEBUG_MODE) {
                api.v1.log(`Chapter ${chapterNumber}: REUSE (hash match: ${currentHash})`);
            }
        } else {
            // Check if chapter number existed before with different text
            const oldFingerprint = existingFingerprints.find(fp => fp.chapterNumber === chapterNumber);

            if (oldFingerprint) {
                // Chapter existed but text changed
                actions.push({
                    chapterNumber,
                    title,
                    action: "regenerate",
                    existingHash: oldFingerprint.textHash,
                    currentHash
                });
                changedCount++;

                if (DEBUG_MODE) {
                    api.v1.log(`Chapter ${chapterNumber}: REGENERATE (old hash: ${oldFingerprint.textHash}, new hash: ${currentHash})`);
                }
            } else {
                // New chapter
                actions.push({
                    chapterNumber,
                    title,
                    action: "generate",
                    currentHash
                });
                newChaptersCount++;

                if (DEBUG_MODE) {
                    api.v1.log(`Chapter ${chapterNumber}: GENERATE (hash: ${currentHash} - new chapter)`);
                }
            }
        }
    }

    // Calculate estimated time
    // Reusing is fast (~1s), regenerating/generating takes longer (~10s) each
    const estimatedTimeSeconds: number = (unchangedCount * 1) + ((changedCount + newChaptersCount) * 10) + 10; // +10s for backup/finalize overhead

    const analysis: RebuildAnalysis = {
        currentChapterCount: existingFingerprints.length,
        detectedChapterCount,
        actions,
        stats: {
            unchanged: unchangedCount,
            changed: changedCount,
            new: newChaptersCount
        },
        estimatedTimeSeconds
    };

    if (DEBUG_MODE) {
        api.v1.log("=== Rebuild Analysis Complete ===");
        api.v1.log(`Stats: ${unchangedCount} unchanged, ${changedCount} changed, ${newChaptersCount} new`);
        api.v1.log(`Estimated time: ${estimatedTimeSeconds} seconds`);
    }

    return analysis;
}

/**
 * Show rebuild preview modal with analysis results
 * User can confirm or cancel the rebuild
 * @param analysis RebuildAnalysis Analysis results to show.
 * @returns Promise<any> The modal object for (await modal.closed)
 */
async function showRebuildPreview(analysis: RebuildAnalysis): Promise<any> {
    if (DEBUG_MODE) {
        api.v1.log("Showing rebuild preview dialog.");
    }

    // Build preview content
    let previewText: string = `**Current Stats:**\n`;
    previewText += `- Existing Summaries: ${analysis.currentChapterCount}\n`;
    previewText += `- Detected Chapters: ${analysis.detectedChapterCount}\n\n`;

    previewText += `**Rebuild Actions:**\n`;
    previewText += `✓ Reuse unchanged: ${analysis.stats.unchanged} chapter(s)\n`;
    previewText += `🔄 Regenerate changed: ${analysis.stats.changed} chapter(s)\n`;
    previewText += `➕ Generate new: ${analysis.stats.new} chapter(s)\n\n`;

    const totalGenerations: number = analysis.stats.changed + analysis.stats.new;
    previewText += `**Summary:**\n`;
    previewText += `${totalGenerations} summaries will be generated.\n`;
    previewText += `${analysis.stats.unchanged} summaries will be reused.\n`;
    previewText += `All condensed summaries will be expanded.\n\n`;

    // Format time estimate
    const minutes: number = Math.floor(analysis.estimatedTimeSeconds / 60);
    const seconds: number = analysis.estimatedTimeSeconds % 60;
    const timeStr: string = minutes > 0
        ? `${minutes}m ${seconds}s`
        : `${seconds}s`;

    previewText += `⏱️ **Estimated Time:** ${timeStr}\n\n`;

    // Show details if there are any changes
    if (analysis.stats.changed > 0 || analysis.stats.new > 0) {
        previewText += `**Details:**\n`;

        // Show changed chapters
        if (analysis.stats.changed > 0) {
            const changedActions = analysis.actions.filter(a => a.action === "regenerate");
            previewText += `\n🔄 **Changed Chapters:**\n`;
            changedActions.forEach(a => {
                const title: string = a.title || `Chapter ${a.chapterNumber}`;
                previewText += `- ${title}\n`;
            });
        }

        // Show new chapters
        if (analysis.stats.new > 0) {
            const newActions = analysis.actions.filter(a => a.action === "generate");
            previewText += `\n➕ **New Chapters:**\n`;
            newActions.forEach(a => {
                const title: string = a.title || `Chapter ${a.chapterNumber}`;
                previewText += `- ${title}\n`;
            });
        }
    }

    previewText += `\n⚠️ **Warning:** This action cannot easily be undone. A backup will be created in storage, but all lorebook entries will be replaced.\n`;

    // Create preview modal
    const modal = api.v1.ui.modal.open({
        title: "🔄 Rebuild All Chapters - Preview",
        size: "large",
        content: [
            {
                type: "text",
                text: previewText,
                markdown: true,
                style: {
                    maxHeight: "400px",
                    overflowY: "auto"
                }
            },
            {
                type: "row",
                spacing: "end",
                content: [
                    {
                        type: "button",
                        text: "Cancel",
                        iconId: "x",
                        callback: () => {
                            if (DEBUG_MODE) {
                                api.v1.log("Rebuild cancelled by user.");
                            }
                            modal.close();
                        },
                        style: { marginRight: "8px" }
                    },
                    {
                        type: "button",
                        text: "Continue With Rebuild",
                        iconId: "refresh",
                        callback: async () => {
                            modal.close();

                            if (DEBUG_MODE) {
                                api.v1.log("Rebuild confirmed by user, starting full rebuild");
                            }
                            // Start the rebuild process
                            try {
                                // v1.4.1: Reset generation counter before rebuild
                                generationCounter = 0;
                                if (DEBUG_MODE) {
                                    api.v1.log("Reset generation counter before rebuild");
                                }

                                await performFullRebuild(analysis);
                            } catch (error) {
                                // Error handling done inside performFullRebuild
                                if (DEBUG_MODE) {
                                    const errorMsg = error instanceof Error ? error.message : String(error);
                                    api.v1.log("Error during full rebuild:", errorMsg);
                                }
                            }
                        }
                    }
                ],
                style: { marginTop: "16px" }
            }
        ]
    });

    return modal;
}

/**
 * Trigger rebuild analysis and show preview
 * Entry point for "Rebuild All Chapters" button
 */
async function triggerRebuildPreview(): Promise<void> {
    if (DEBUG_MODE) {
        api.v1.log("=== Rebuild All Chapters triggered ===");
    }

    try {
        // Show analyzing message in the panel instead of Larry
        await api.v1.ui.updateParts([{
            id: "retry-status",
            text: "🔍 Analyzing document structure..."
        }]);

        // Perform analysis
        const analysis: RebuildAnalysis = await analyzeRebuild();

        // Show preview modal
        const modal = await showRebuildPreview(analysis);

        // Wait for modal to close, then clear the message
        await modal.closed;

        await api.v1.ui.updateParts([{
            id: "retry-status",
            text: ""
        }]);

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        api.v1.log("Error during rebuild analysis:", errorMsg);

        // Clear analyzing message and show error
        await api.v1.ui.updateParts([{
            id: "retry-status",
            text: ""
        }]);

        api.v1.ui.larry.help({
            question: `Failed to analyze document: ${errorMsg}`,
            options: [
                { text: "OK", callback: () => { } }
            ]
        });
    }
}

// ============================================================================
// Rebuild Backup Functions (Phase 3 - Step 2)
// ============================================================================

/**
 * Gets all rebuild backups from storage
 * @returns Promise<RebuildBackup[]> array of rebuild backups, sorted by newest first
 */
async function getRebuildBackups(): Promise<RebuildBackup[]> {
    const backups: RebuildBackup[] = await api.v1.storyStorage.get("rebuildBackups") || [];

    // Sort by timestamp, newest first
    backups.sort((a, b) => b.timestamp - a.timestamp);

    if (DEBUG_MODE) {
        api.v1.log(`Retrieved ${backups.length} rebuild backup(s) from storage`);
    }

    return backups;
}

/**
 * Prune old backups, keeping only the most recent N (maxRebuildBackups)
 * @param backups RebuildBackup[] Current backups array
 * @returns Promise<RebuildBackup[]> Pruned backups array
 */
async function pruneOldBackups(backups: RebuildBackup[]): Promise<RebuildBackup[]> {
    if (backups.length <= maxRebuildBackups) {
        // No pruning needed
        return backups;
    }

    // Sort by timestamp, newest first
    backups.sort((a, b) => b.timestamp - a.timestamp);

    // Keep only the most recent N
    const pruned = backups.slice(0, maxRebuildBackups);
    const removedCount = backups.length - pruned.length;

    if (DEBUG_MODE) {
        api.v1.log(`Pruned ${removedCount} old rebuild backup(s), keeping the most recent ${maxRebuildBackups}`);
    }

    return pruned;
}

/**
 * Creates a complete backup of current chapter summary state
 * This should be called before any destructive rebuild operation
 * 
 * @param reason string Why this backup is being created
 * @returns Promise<RebuildBackup> The created backup object.
 */
async function createRebuildBackup(reason: string): Promise<RebuildBackup> {
    if (DEBUG_MODE) {
        api.v1.log(`=== Creating Rebuild Backup: ${reason} ===`);
    }

    try {

        // Get all current lorebook entries from our category
        const entries: LorebookEntry[] = await api.v1.lorebook.entries(lorebookCategoryId);

        if (DEBUG_MODE) {
            api.v1.log(`Backing up ${entries.length} lorebook entries`);
        }

        // Get all current state from storage
        const fingerprints: ChapterFingerprint[] = await getChapterFingerprints();
        const changedChapters: ChangedChapter[] = await getChangedChapters();
        const condensedRanges: CondensedRange[] = await api.v1.storyStorage.get("condensedRanges") || [];
        const failedChapters: FailedChapter[] = await api.v1.storyStorage.get("failedChapters");
        const lastProcessedChapterCount: number = await api.v1.storyStorage.get("lastProcessedChapterCount") || 0;
        const isFirstChapterValue: boolean = await api.v1.storyStorage.get("isFirstChapter") || false;

        // Calculate current chapter count from document
        const sections: DocumentSections = await api.v1.document.scan();
        const fullText = sections.map(s => s.section.text).join('\n');
        const escapedToken = chapterBreakToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const breakPattern = new RegExp(`(?:^|\\n)\\s*${escapedToken}\\s*(?=\\n|$)`, 'gm');
        const chapterBreakCount = (fullText.match(breakPattern) || []).length;
        const chapterCount: number = chapterBreakCount + 1;

        // Create backup object
        const backup: RebuildBackup = {
            timestamp: Date.now(),
            reason,
            categoryName: lorebookCategoryName,
            entries,
            fingerprints,
            changedChapters,
            condensedRanges,
            failedChapters,
            lastProcessedChapterCount,
            isFirstChapter: isFirstChapterValue,
            chapterCount
        };

        // Get existing backups
        let backups: RebuildBackup[] = await getRebuildBackups();

        // Add new backup
        backups.push(backup);

        // Prune old backups
        backups = await pruneOldBackups(backups);

        // Store updated backups
        await api.v1.storyStorage.set("rebuildBackups", backups);

        if (DEBUG_MODE) {
            api.v1.log(`✓ Backup created successfully`);
            api.v1.log(`  Entries: ${entries.length}`);
            api.v1.log(`  Fingerprints: ${fingerprints.length}`);
            api.v1.log(`  Changed Chapters: ${changedChapters.length}`);
            api.v1.log(`  Condensed Ranges: ${condensedRanges.length}`);
            api.v1.log(`  Failed Chapters: ${failedChapters.length}`);
            api.v1.log(`  Total Backups Stored: ${backups.length}`);
        }

        return backup;
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        api.v1.error("Failed to create rebuild backup:", errorMsg);
        throw error;
    }
}

/**
 * Restore all chapter summary state from a given backup
 * WARNING: This is a destructive operation that replaces ALL current state
 * 
 * @param backup RebuildBackup The backup to restore from.
 * @returns Promise<void>
 */
async function restoreFromBackup(backup: RebuildBackup): Promise<void> {
    if (DEBUG_MODE) {
        api.v1.log(`=== Restoring from Backup ===`);
        api.v1.log(`   Backup Timestamp: ${new Date(backup.timestamp).toLocaleString()}`);
        api.v1.log(`   Backup Reason: ${backup.reason}`);
    }

    try {
        // Step 1: Delate all current lorebook entries in our category
        const currentEntries: LorebookEntry[] = await api.v1.lorebook.entries(lorebookCategoryId);

        if (DEBUG_MODE) {
            api.v1.log(`Deleting ${currentEntries.length} current lorebook entries...`);
        }

        for (const entry of currentEntries) {
            await api.v1.lorebook.removeEntry(entry.id);
        }

        // Step 2: Recreate all entries from backup
        if (DEBUG_MODE) {
            api.v1.log(`Restoring ${backup.entries.length} lorebook entries from backup...`);
        }

        for (const entry of backup.entries) {
            // Generate new ID to avoid conflicts and assign to current category
            const newEntry = { 
                ...entry, 
                id: api.v1.uuid(),
                category: lorebookCategoryId  // Use current category ID, not backup's old ID
            };

            await api.v1.lorebook.createEntry(newEntry);
            
            if (DEBUG_MODE) {
                api.v1.log(`  Restored entry: ${entry.displayName} to category ${lorebookCategoryId}`);
            }
        }

        // Step 3: Restore all storage values
        if (DEBUG_MODE) {
            api.v1.log(`Restoring storage values from backup...`);
        }

        await api.v1.storyStorage.set("chapterFingerprints", backup.fingerprints);
        await api.v1.storyStorage.set("changedChapters", backup.changedChapters);
        await api.v1.storyStorage.set("condensedRanges", backup.condensedRanges);
        await api.v1.storyStorage.set("failedChapters", backup.failedChapters);
        await api.v1.storyStorage.set("lastProcessedChapterCount", backup.lastProcessedChapterCount);
        await api.v1.storyStorage.set("isFirstChapter", backup.isFirstChapter);

        // Update global state
        isFirstChapter = backup.isFirstChapter;

        if (DEBUG_MODE) {
            api.v1.log(`✓ Restore from backup completed successfully`);
            api.v1.log(`  Restored Entries: ${backup.entries.length}`);
            api.v1.log(`  Restored Fingerprints: ${backup.fingerprints.length}`);
        }

        // Update the UI
        await updateStatusPanel();

        api.v1.log(`✓ Successfully restored from backup (${new Date(backup.timestamp).toLocaleString()})`);

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        api.v1.error("Failed to restore from rebuild backup:", errorMsg);
        throw error;
    }
}

// ============================================================================
// REBUILD CATEGORY MANAGEMENT FUNCTIONS (Phase 3 Step 3)
// ============================================================================

/**
 * Prepare for a rebuild by
 * 1. Renaming the existing lorebook category to a backup name
 * 2. Creating a new "rebuilding" category for the rebuild process
 * 3. Storing both category IDs for later use
 * 
 * @returns Promise<{ backupCategoryId: string; rebuildCategoryId: string; }> IDs of the backup and rebuild categories.
 */
async function prepareRebuildCategories(): Promise<{ backupCategoryId: string; rebuildCategoryId: string; }> {

    if (DEBUG_MODE) {
        api.v1.log("=== Preparing Rebuild Categories ===");
    }

    try {
        // Generate backup category name with timestamp
        const now: Date = new Date();
        const timestamp: string = now.toISOString().replace('T', ' ').substring(0, 19);
        const backupCategoryName: string = `${lorebookCategoryName} (Backup ${timestamp})`;

        if (DEBUG_MODE) {
            api.v1.log(`Current Category: "${lorebookCategoryName}" (ID: ${lorebookCategoryId})`);
            api.v1.log(`Backup Category Name: "${backupCategoryName}"`);
        }

        // Step 1: Rename existing category
        await api.v1.lorebook.updateCategory(lorebookCategoryId, {
            name: backupCategoryName
        });

        if (DEBUG_MODE) {
            api.v1.log(`Renamed existing category to "${backupCategoryName}"`);
        }
        // Step 2: Create new category for rebuilding
        const rebuildCategoryName: string = `${lorebookCategoryName} (Rebuilding)`;
        const rebuildCategory: LorebookCategory = {
            id: api.v1.uuid(),
            name: rebuildCategoryName,
            enabled: false,
            settings: {
                entryHeader: "----"
            }
        };

        const rebuildCategoryId: string = await api.v1.lorebook.createCategory(rebuildCategory);

        if (DEBUG_MODE) {
            api.v1.log(`✓ Created new rebuild category (ID: ${rebuildCategoryId})`);
        }

        // Step 3: Store category IDs temeporarily for rollback/finalization operations
        await api.v1.storyStorage.set("rebuildBackupCategoryId", lorebookCategoryId);
        await api.v1.storyStorage.set("rebuildNewCategoryId", rebuildCategoryId);

        if (DEBUG_MODE) {
            api.v1.log(`✓ Stored rebuild category IDs in story storage`);
        }

        return { backupCategoryId: lorebookCategoryId, rebuildCategoryId };

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        api.v1.error("Failed to prepare rebuild categories:", errorMsg);
        throw error;
    }
}

/**
 * Finalize successful rebuild by:
 * 1. Deleting the backup category
 * 2. Renaming the rebuild category to the original name
 * 3. Updating stored category ID
 * 4. Cleaning up temporary storage
 * 
 * @returns Promise<void>
 */
async function finalizeRebuildCategories(): Promise<void> {
    if (DEBUG_MODE) {
        api.v1.log("=== Finalizing Rebuild Categories ===");
    }

    try {
        // Retrieve stored category IDs
        const backupCategoryId: string | undefined = await api.v1.storyStorage.get("rebuildBackupCategoryId");
        const rebuildCategoryId: string | undefined = await api.v1.storyStorage.get("rebuildNewCategoryId");

        if (!backupCategoryId || !rebuildCategoryId) {
            throw new Error("Missing stored category IDs - rebuild state corrupted");
        }

        if (DEBUG_MODE) {
            api.v1.log(`Backup Category ID: ${backupCategoryId}`);
            api.v1.log(`Rebuild Category ID: ${rebuildCategoryId}`);
        }

        // Step 1: Delete all entries in backup category FIRST
        if (DEBUG_MODE) {
            api.v1.log("Deleting entries in backup category...");
        }

        const backupEntries = await api.v1.lorebook.entries(backupCategoryId);

        if (DEBUG_MODE) {
            api.v1.log(`Found ${backupEntries.length} entries in backup category to delete`);
        }

        for (const entry of backupEntries) {
            await api.v1.lorebook.removeEntry(entry.id);
        }

        if (DEBUG_MODE) {
            api.v1.log(`✓ Deleted ${backupEntries.length} entries from backup category`);
        }

        // Step 2: Delete backup category
        await api.v1.lorebook.removeCategory(backupCategoryId);

        if (DEBUG_MODE) {
            api.v1.log(`✓ Deleted backup category (ID: ${backupCategoryId})`);
        }

        // Step 3: Rename rebuild category to original name
        await api.v1.lorebook.updateCategory(rebuildCategoryId, {
            name: lorebookCategoryName
        });

        if (DEBUG_MODE) {
            api.v1.log(`✓ Renamed rebuild category to "${lorebookCategoryName}"`);
        }

        // Step 4: Update stored category ID
        lorebookCategoryId = rebuildCategoryId;
        await api.v1.storyStorage.set("chapterSummaryCategoryId", lorebookCategoryId);

        if (DEBUG_MODE) {
            api.v1.log(`✓ Updated stored lorebook category ID to new rebuild category ID`);
        }

        // Step 5: Clean up temporary storage
        await api.v1.storyStorage.remove("rebuildBackupCategoryId");
        await api.v1.storyStorage.remove("rebuildNewCategoryId");

        if (DEBUG_MODE) {
            api.v1.log(`✓ Cleaned up temporary rebuild storage keys`);
            api.v1.log("=== Rebuild Finalization Complete ===");
        }

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        api.v1.error("Failed to finalize rebuild categories:", errorMsg);
        throw error;
    }
}

/**
 * Rollback failed rebuild by:
 * 1. Deleting the rebuild category
 * 2. Renaming the backup category back to the original name
 * 3. Restoring category ID
 * 4. Cleaning up temporary storage
 * 
 * @returns Promise<void>
 */
async function rollbackRebuildCategories(): Promise<void> {
    if (DEBUG_MODE) {
        api.v1.log("=== Rolling Back Rebuild Categories ===");
    }

    try {
        // Retrieve stored category IDs
        const backupCategoryId: string | undefined = await api.v1.storyStorage.get("rebuildBackupCategoryId");
        const rebuildCategoryId: string | undefined = await api.v1.storyStorage.get("rebuildNewCategoryId");

        if (!backupCategoryId) {
            throw new Error("Missing stored backup category ID - cannot rollback");
        }

        if (DEBUG_MODE) {
            api.v1.log(`Backup Category ID: ${backupCategoryId}`);
            api.v1.log(`Rebuild Category ID: ${rebuildCategoryId || 'none'}`);
        }

        // Step 1: Delete rebuild category if it exists
        if (rebuildCategoryId) {
            try {
                await api.v1.lorebook.removeCategory(rebuildCategoryId);

                if (DEBUG_MODE) {
                    api.v1.log(`✓ Deleted rebuild category (ID: ${rebuildCategoryId})`);
                }
            } catch (error) {
                // Category might not exist if failure happened early
                if (DEBUG_MODE) {
                    api.v1.log(`Rebuild category (ID: ${rebuildCategoryId}) may not exist; skipping deletion.`);
                }
            }
        }

        // Step 2: Rename backup category back to original name
        await api.v1.lorebook.updateCategory(backupCategoryId, {
            name: lorebookCategoryName
        });

        if (DEBUG_MODE) {
            api.v1.log(`✓ Renamed backup category back to "${lorebookCategoryName}"`);
        }

        // Step 3: Restore stored category ID
        lorebookCategoryId = backupCategoryId;
        await api.v1.storyStorage.set("chapterSummaryCategoryId", lorebookCategoryId);

        if (DEBUG_MODE) {
            api.v1.log(`✓ Restored stored lorebook category ID to backup category ID`);
        }

        // Step 4: Clean up temporary storage
        await api.v1.storyStorage.remove("rebuildBackupCategoryId");
        await api.v1.storyStorage.remove("rebuildNewCategoryId");

        if (DEBUG_MODE) {
            api.v1.log(`✓ Cleaned up temporary rebuild storage keys`);
            api.v1.log("=== Rebuild Rollback Complete ===");
        }

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        api.v1.error("Failed to rollback rebuild categories:", errorMsg);
        throw error;
    }
}

// ============================================================================
// Rebuild Execution Functions (Phase 3 - Step 4)
// ============================================================================

/**
 * Helper: Find an existing lorebook entry by chapter number
 * Used wheb we beed to find an entry to reuse/copy
 * 
 * @param chapterNumber number Chapter we're looking for lorebook entry of.
 * @param categoryId string The category ID we're searching for the entry in.
 * @returns Promise<LorebookEntry | null> Returns a LorebookEntry if found, null otherwise.
 */
async function findEntryByChapterNumber(chapterNumber: number, categoryId: string): Promise<LorebookEntry | null> {
    const entries: LorebookEntry[] = await api.v1.lorebook.entries(categoryId);

    for (const entry of entries) {
        if (!entry.text) continue;

        // Parse chapter range from entry text
        // v1.4.1 FIX: Support both "Chapter" and "Chapters" for condensed entries
        const chapterMatch = entry.text.match(/^Chapters? (\d+)(?:-(\d+))?/);
        if (!chapterMatch) continue;

        const startChapter: number = parseInt(chapterMatch[1]);
        const endChapter: number = chapterMatch[2] ? parseInt(chapterMatch[2]) : startChapter;

        // Check if this entry covers the requested chapter
        if (startChapter <= chapterNumber && chapterNumber <= endChapter) {
            if (DEBUG_MODE) {
                api.v1.log(`Found existing lorebook entry for chapter ${chapterNumber} in category ID ${categoryId}: ${entry.id}`);
            }
            return entry;
        }
    }

    if (DEBUG_MODE) {
        api.v1.log(`No existing lorebook entry found for chapter ${chapterNumber} in category ID ${categoryId}`);
    }

    return null;
}

/**
 * Helper: Update chapter number refences in lorebook entry text
 * e.g. "Chapter 5: The Journey Begins" -> "Chapter 6: The Journey Begins"
 * 
 * @param text string The current chapter title text.
 * @param newChapterNumber number The new chapter number to update to.
 * @returns string The updated chapter title text. 
 */
function updateChapterNumberInText(text: string, newChapterNumber: number): string {
    // Replace "Chapter X:" or "Chapter X-Y:" at the start
    return text.replace(/^Chapter \d+(?:-\d+)?/, `Chapter ${newChapterNumber}`);
}

/**
 * Perform full rebuild of all chapter summaries
 * This is the main orchestration function for Phase 3
 * @param analysis RebuildAnalysis The analysis object with the details to carry out the rebuild
 */
async function performFullRebuild(analysis: RebuildAnalysis): Promise<void> {
    if (DEBUG_MODE) {
        api.v1.log("=== Starting Full Rebuild ===");
        api.v1.log(`Total Actions: ${analysis.actions.length}`);
        api.v1.log(`  Reuse: ${analysis.stats.unchanged}, Regenerate: ${analysis.stats.changed}, New: ${analysis.stats.new}`);
    }

    let backupCategoryId: string = "";
    let rebuildCategoryId: string = "";
    let progressCount: number = 0;
    let reuseCount: number = 0;
    let regenerateCount: number = 0;
    let generateCount: number = 0;
    let failCount: number = 0;

    try {
        // ====================================================================
        // PHASE 1: BACKUP
        // ====================================================================

        await api.v1.ui.updateParts([{
            id: "rebuild-progress",
            text: `📦 Creating backup...`
        }]);

        if (DEBUG_MODE) {
            api.v1.log("Creating storage backup...");
        }

        const backup: RebuildBackup = await createRebuildBackup("Pre-Rebuild safety Backup");

        if (DEBUG_MODE) {
            api.v1.log(`✓ Backup created with ${backup.entries.length} entries`);
        }

        // ====================================================================
        // PHASE 2: PREPARE CATEGORIES
        // ====================================================================

        await api.v1.ui.updateParts([{
            id: "rebuild-progress",
            text: `🔄 Preparing categories...`
        }]);

        if (DEBUG_MODE) {
            api.v1.log("Preparing rebuild categories...");
        }

        const categoryIds = await prepareRebuildCategories();
        backupCategoryId = categoryIds.backupCategoryId;
        rebuildCategoryId = categoryIds.rebuildCategoryId;

        if (DEBUG_MODE) {
            api.v1.log(`✓ Categories prepared - Backup: ${backupCategoryId}, Rebuilding: ${rebuildCategoryId}`);
        }

        // Store category IDs in storage for potential rollback
        await api.v1.storyStorage.set("tempBackupCategoryIds", categoryIds);

        // ====================================================================
        // PHASE 3: EXECTUION - Process each action
        // ====================================================================

        if (DEBUG_MODE) {
            api.v1.log("Starting rebuild execution...");
        }

        // Get existing fingerprints for reuse matching
        const existingFingerprints: ChapterFingerprint[] = await getChapterFingerprints();

        // Get document text once (for efficiency)
        const sections: DocumentSections = await api.v1.document.scan();
        const fullText = sections.map(s => s.section.text).join('\n');
        const chapters = splitIntoChapters(fullText);

        for (const action of analysis.actions) {
            progressCount++;
            const percentComplete: number = Math.round((progressCount / analysis.actions.length) * 100);

            const chapterTitle: string = action.title || `Chapter ${action.chapterNumber}`;

            await api.v1.ui.updateParts([{
                id: "rebuild-progress",
                text: `🔄 Processing ${chapterTitle} (${progressCount}/${analysis.actions.length}, ${percentComplete}%)\n` +
                    `Reused: ${reuseCount} | Regenerated: ${regenerateCount} | Generated: ${generateCount} | Failed: ${failCount}`
            }]);

            if (DEBUG_MODE) {
                api.v1.log(`\n--- Processing Chapter ${action.chapterNumber}: ${action.action} ---`);
            }

            // Get chapter text
            let chapterText: string = "";
            if (action.chapterNumber === 1) {
                chapterText = chapters[0] || "";
            } else {
                const chapterIndex: number = action.chapterNumber - 1;
                chapterText = chapters[chapterIndex] || "";
            }

            // Skip empty chapters
            if (!chapterText || chapterText.trim().length === 0) {
                if (DEBUG_MODE) {
                    api.v1.log(`Chapter ${action.chapterNumber} text is empty; skipping.`);
                }
                failCount++;
                continue;
            }

            try {
                if (action.action === "reuse") {
                    // ============================================================
                    // ACTION: REUSE - Copy existing summary with updated number
                    // ============================================================

                    if (DEBUG_MODE) {
                        api.v1.log(`Reusing summary for chapter ${action.chapterNumber} (hash: ${action.currentHash})`);
                    }

                    // Find the original entry by hash match
                    const matchingFp = existingFingerprints.find(fp => fp.textHash === action.currentHash);

                    if (!matchingFp) {
                        throw new Error(`No matching fingerprint found for reuse (hash: ${action.currentHash})`);
                    }

                    // Get the old entry from the backup category
                    const oldEntry = await findEntryByChapterNumber(matchingFp.chapterNumber, backupCategoryId);

                    if (!oldEntry || !oldEntry.text) {
                        // Entry was deleted or missing
                        if (DEBUG_MODE) {
                            api.v1.log(`⚠️  Entry for chapter ${matchingFp.chapterNumber} not found, regenerating instead`);
                        }
                        action.action = "regenerate"; // Fallback to regenerate
                    } else {
                        // Copy the entry with updated chapter number
                        const newDisplayName: string = updateChapterNumberInText(oldEntry.displayName || chapterTitle, action.chapterNumber);
                        const newText: string = updateChapterNumberInText(oldEntry.text, action.chapterNumber);

                        const newEntry: LorebookEntry = {
                            id: api.v1.uuid(),
                            displayName: newDisplayName,
                            text: newText,
                            category: rebuildCategoryId, // Important: use rebuild category
                            enabled: true,
                            forceActivation: true,
                            hidden: false,
                            keys: undefined,
                            advancedConditions: undefined
                        };

                        await api.v1.lorebook.createEntry(newEntry);

                        // Store fingerprint for new chapter number
                        await storeChapterFingerprint(action.chapterNumber, action.currentHash, false);

                        reuseCount++;

                        if (DEBUG_MODE) {
                            api.v1.log(`✓ Reused entry for chapter ${action.chapterNumber}`);
                        }

                        // Small delay before next chapter
                        await api.v1.timers.sleep(500);
                        continue; // Move to next action
                    }
                }

                if (action.action === "regenerate" || action.action === "generate") {
                    // ============================================================
                    // ACTION: REGENERATE or GENERATE - Create new summary
                    // ============================================================

                    const actionVerb: string = action.action === "regenerate" ? "Regenerating" : "Generating";

                    if (DEBUG_MODE) {
                        api.v1.log(`${actionVerb} summary for chapter ${action.chapterNumber}`);
                    }

                    // v1.4.1: Increment generation counter for rebuild operations
                    generationCounter++;
                    if (DEBUG_MODE) {
                        api.v1.log(`Generation counter: ${generationCounter}/5 for chapter ${action.chapterNumber}`);
                    }

                    // Extract Title
                    const title: string | null = extractChapterTitle(chapterText);
                    const displayTitle: string = title || `Chapter ${action.chapterNumber}`;

                    // Generate summary
                    const summaryPrompt: string = promptString
                        .replace("{chapter_text}", chapterText)
                        .replace("{chapter_title}", displayTitle);

                    const messages: Message[] = [{
                        role: "user",
                        content: summaryPrompt
                    }];

                    const params: GenerationParams = await api.v1.generationParameters.get();
                    params.max_tokens = summaryMaxtokens;

                    const result: GenerationResponse = await retryableGenerate(messages, params, action.chapterNumber);
                    const summaryText: string = result.choices[0].text.trim();

                    // Create formatted lorebook entry text
                    const entryText: string = `Chapter ${action.chapterNumber}: ${displayTitle}\nType: chapter\nSummary: ${summaryText}`;

                    // Create new lorebook entry in REBUILDING category
                    const newEntryId: string = api.v1.uuid();
                    await api.v1.lorebook.createEntry({
                        id: newEntryId,
                        displayName: displayTitle,
                        text: entryText,
                        category: rebuildCategoryId, // Important: use rebuild category
                        enabled: true,
                        forceActivation: true,
                        hidden: false,
                        keys: undefined,
                        advancedConditions: undefined
                    });

                    // Store fingerprint for new chapter
                    await storeChapterFingerprint(action.chapterNumber, chapterText, false);

                    if (action.action === "regenerate") {
                        regenerateCount++;
                    } else {
                        generateCount++;
                    }

                    if (DEBUG_MODE) {
                        api.v1.log(`✓ ${action.action === "regenerate" ? "Regenerated" : "Generated"} summary for chapter ${action.chapterNumber}`);
                    }

                    // Delay between generations
                    await api.v1.timers.sleep(1000);
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                api.v1.error(`Failed to process chapter ${action.chapterNumber}:`, errorMsg);
                failCount++;

                // Record failed chapter
                await recordFailedChapter(action.chapterNumber, errorMsg);

                // Continue with next chapter
                continue;
            }
        }

        // ====================================================================
        // PHASE 4: FINALIZATION
        // ====================================================================

        if (DEBUG_MODE) {
            api.v1.log("Finalizing rebuild...");
        }

        await api.v1.ui.updateParts([{
            id: "rebuild-progress",
            text: `✨ Finalizing...`
        }]);

        // Clear all condensation state (we have fresh individual summaries)
        if (DEBUG_MODE) {
            api.v1.log("Clearing condensation state...");
        }

        await api.v1.storyStorage.set("condensedRanges", []);

        // Update all fingerprints to isCondensed = false
        const fingerprints: ChapterFingerprint[] = await getChapterFingerprints();
        fingerprints.forEach(fp => fp.isCondensed = false);
        await api.v1.storyStorage.set("chapterFingerprints", fingerprints);

        // Update lastProcessedChapterCount
        await api.v1.storyStorage.set("lastProcessedChapterCount", analysis.detectedChapterCount);

        // Clear changed chapters list (we just regenerated everything that needed it)
        await setChangedChapters([]);

        // Finalize categories (delete backup, rename rebuild -> main)
        if (DEBUG_MODE) {
            api.v1.log("Finalizing categories...");
        }

        await finalizeRebuildCategories();

        // Clean up temporary storage
        await api.v1.storyStorage.remove("tempBackupCategoryIds");

        // ====================================================================
        // SUCCESS
        // ====================================================================

        const successMsg = `✅ Rebuild complete!\n` +
            `Reused: ${reuseCount} | Regenerated: ${regenerateCount} | Generated: ${generateCount}` +
            (failCount > 0 ? `\n⚠️  Failed: ${failCount} (check Failed Chapters section)` : ``);
        
        await api.v1.ui.updateParts([{
            id: "rebuild-progress",
            text: successMsg
        }]);

        if (DEBUG_MODE) {
            api.v1.log("=== Rebuild Completed Successfully ===");
            api.v1.log(`Final counts - Reused: ${reuseCount}, Regenerated: ${regenerateCount}, Generated: ${generateCount}, Failed: ${failCount}`);
        }

        // Update status panel
        await updateStatusPanel();

        // v1.4.1: Check if condensation is needed after rebuild
        try {
            if (DEBUG_MODE) {
                api.v1.log("Checking if condensation is needed after rebuild...");
            }
            await checkAndCondenseIfNeeded();
        } catch (condenseError) {
            const condenseErrorMsg = condenseError instanceof Error ? condenseError.message : String(condenseError);
            api.v1.error("Error during post-rebuild condensation check:", condenseErrorMsg);
            // Don't fail the rebuild for condensation errors
        }

        // v1.4.1: Reset generation counter after rebuild
        generationCounter = 0;
        if (DEBUG_MODE) {
            api.v1.log("Reset generation counter after rebuild");
        }

        // Show success message
        api.v1.ui.larry.help({
            question: successMsg,
            options: [
                { text: "OK", callback: () => { } }
            ]
        });

    } catch (error) {
        // ====================================================================
        // ERROR - Trigger rollback
        // ====================================================================

        const errorMsg = error instanceof Error ? error.message : String(error);
        api.v1.error("Rebuild failed:", errorMsg);

        await api.v1.ui.updateParts([{
            id: "rebuild-progress",
            text: `❌ Rebuild failed: ${errorMsg}\nRolling back...`
        }]);

        // Attempt rollback
        await handleRebuildFailure(error as Error, "execution", backupCategoryId, rebuildCategoryId);
    }
}

// ============================================================================
// Rebuild Error Handling (Phase 3 - Step 5)
// ============================================================================

/**
 * Handle rebuild failure with comprehensive rollback
 * @param error The error that occurred
 * @param stage What stage of rebuild failed (backup/execution/finalization)
 * @param backupCategoryId Optional backup category ID if categories were prepared
 * @param rebuildCategoryId Optional rebuild category ID if categories were prepared
 */
async function handleRebuildFailure(
    error: Error,
    stage: string,
    backupCategoryId?: string,
    rebuildCategoryId?: string
): Promise<void> {
    if (DEBUG_MODE) {
        api.v1.log(`=== Handling Rebuild Failure (stage: ${stage}) ===`);
    }

    const errorMsg = error instanceof Error ? error.message : String(error);

    try {
        // Determining if we need to rollback categories
        const categgoriesWerePrepared = backupCategoryId && rebuildCategoryId;

        if (categgoriesWerePrepared) {
            if (DEBUG_MODE) {
                api.v1.log("Categories were prepared; rolling back categories...");
            }

            await api.v1.ui.updateParts([{
                id: "rebuild-progress",
                text: `🔄 Rolling back categories...`
            }]);

            // Rollback categories (deletes rebuilding, restores backup)
            await rollbackRebuildCategories();

            // Clear temporary storage
            await api.v1.storyStorage.remove("tempRebuildCategoryIds");

            if (DEBUG_MODE) {
                api.v1.log(`✓ Categories rolled back successfully`);
            }
        } else {
            if (DEBUG_MODE) {
                api.v1.log("Categories were not prepared; skipping category rollback.");
            }
        }

        // Update UI with final status
        const rollbackMsg = categgoriesWerePrepared
            ? "Categories have been rolled back to their original state."
            : "No rollback needed (rebuild hadn't started yet).";

        await api.v1.ui.updateParts([{
            id: "rebuild-progress",
            text: `❌ Rebuild failed at ${stage} stage.\n${rollbackMsg}`
        }]);

        // Show error to user with options
        api.v1.ui.larry.help({
            question: `Rebuild failed at ${stage} stage: ${errorMsg}\n\n${rollbackMsg}\n\nA storage backup was created before the rebuild started. You can view and restore it from the panel if needed.`,
            options: [
                {
                    text: "View Backups",
                    callback: async () => {
                        await showBackupModal();
                    }
                },
                { text: "OK", callback: () => { } }
            ]
        });

        if (DEBUG_MODE) {
            api.v1.log("=== Rollback Complete ===");
        }

    } catch (rollbackError) {
        const rollbackErrorMsg = rollbackError instanceof Error ? rollbackError.message : String(rollbackError);    
        api.v1.error("Failed during rebuild rollback:", rollbackErrorMsg);

        // Show critical error to user
        api.v1.ui.larry.help({
            question: `Critical error: Rebuild failed AND rollback failed!\n\nOriginal error: ${errorMsg}\n\nRollback error: ${rollbackErrorMsg}\n\\nYou may need to manually restore from a storage backup.`,
            options: [
                {
                    text: "View Backups",
                    callback: async () => {
                        await showBackupModal();
                    }
                },
                { text: "OK", callback: () => { } }
            ]
        });
    }
}

/**
 * Show a modal with list of available backups and restore options
 */
async function showBackupModal(): Promise<void> {
    if (DEBUG_MODE) {
        api.v1.log("Showing backup modal...");
    }
    try {
        const backups: RebuildBackup[] = await getRebuildBackups();

        if (backups.length === 0) {
            api.v1.ui.larry.help({
                question: "No rebuild backups available.",
                options: [
                    { text: "OK", callback: () => { } }
                ]
            });
            return;
        }

        // Build modal content with restore buttons
        const modalContent: UIPart[] = [];
        
        // Header text
        modalContent.push({
            type: "text",
            text: `**Available Backups (${backups.length}):**\n\nSelect a backup to restore. This will replace ALL current summaries with the backup state.`,
            markdown: true,
            style: { marginBottom: "16px" }
        });

        // Individual backup entries with restore buttons
        backups.forEach((backup, index) => {
            const date = new Date(backup.timestamp).toLocaleString();
            
            // Separator
            if (index > 0) {
                modalContent.push({
                    type: "container",
                    style: {
                        borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                        marginTop: "12px",
                        marginBottom: "12px"
                    },
                    content: []
                });
            }
            
            // Backup info
            modalContent.push({
                type: "text",
                text: `**Backup ${index + 1}**\n` +
                      `📅 ${date}\n` +
                      `📝 Reason: ${backup.reason}\n` +
                      `📊 Chapters: ${backup.chapterCount}\n` +
                      `📦 Entries: ${backup.entries.length}`,
                markdown: true,
                style: { marginBottom: "8px" }
            });
            
            // Restore button - opens confirmation modal
            modalContent.push({
                type: "button",
                text: `Restore Backup ${index + 1}`,
                iconId: "refresh",
                callback: async () => {
                    // Close current modal
                    modal.close();
                    
                    // Open confirmation modal
                    const confirmModal = api.v1.ui.modal.open({
                        title: "⚠️ Confirm Restore",
                        size: "medium",
                        content: [
                            {
                                type: "text",
                                text: `**Restore backup from ${date}?**\n\nThis will:\n- Delete ALL current summaries\n- Restore ${backup.entries.length} entries\n- Restore all state from backup\n\n⚠️ **This action cannot be undone!**`,
                                markdown: true,
                                style: { marginBottom: "16px" }
                            },
                            {
                                type: "row",
                                spacing: "end",
                                content: [
                                    {
                                        type: "button",
                                        text: "Cancel",
                                        iconId: "x",
                                        callback: () => {
                                            if (DEBUG_MODE) {
                                                api.v1.log("Restore cancelled by user");
                                            }
                                            confirmModal.close();
                                            // Reopen backup list modal
                                            showBackupModal();
                                        },
                                        style: { marginRight: "8px" }
                                    },
                                    {
                                        type: "button",
                                        text: "Yes, Restore",
                                        iconId: "check",
                                        callback: async () => {
                                            try {
                                                confirmModal.close();
                                                
                                                // Show restoring message
                                                await api.v1.ui.updateParts([{
                                                    id: "retry-status",
                                                    text: "🔄 Restoring backup..."
                                                }]);
                                                
                                                // Perform restore
                                                await restoreFromBackup(backup);
                                                
                                                // Success message
                                                await api.v1.ui.updateParts([{
                                                    id: "retry-status",
                                                    text: `✅ Backup restored successfully! Restored ${backup.entries.length} entries.`
                                                }]);
                                                
                                                // Clear message after delay
                                                await api.v1.timers.sleep(4000);
                                                await api.v1.ui.updateParts([{
                                                    id: "retry-status",
                                                    text: ""
                                                }]);
                                                
                                            } catch (error) {
                                                const errorMsg = error instanceof Error ? error.message : String(error);
                                                api.v1.error("Failed to restore backup:", errorMsg);
                                                
                                                await api.v1.ui.updateParts([{
                                                    id: "retry-status",
                                                    text: `❌ Restore failed: ${errorMsg}`
                                                }]);
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    });
                },
                style: { marginBottom: "12px" }
            });
        });

        // Close button at bottom
        modalContent.push({
            type: "container",
            style: {
                borderTop: "2px solid rgba(255, 255, 255, 0.3)",
                marginTop: "16px",
                paddingTop: "16px"
            },
            content: [
                {
                    type: "row",
                    spacing: "end",
                    content: [
                        {
                            type: "button",
                            text: "Close",
                            iconId: "x",
                            callback: () => modal.close()
                        }
                    ]
                }
            ]
        });

        // Create modal
        const modal = api.v1.ui.modal.open({
            title: "📦 Storage Backups",
            size: "large",
            content: modalContent
        });

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        api.v1.error("Failed to show backup modal:", errorMsg);
    }
}

/**
 * Test helper: Move all entries from one category to another
 */
async function moveEntriesToCategory(fromCategoryId: string, toCategoryId: string): Promise<void> {
    const entries = await api.v1.lorebook.entries(fromCategoryId);

    if (DEBUG_MODE) {
        api.v1.log(`Moving ${entries.length} entries from ${fromCategoryId} to ${toCategoryId}`);
    }

    for (const entry of entries) {
        await api.v1.lorebook.updateEntry(entry.id, {
            category: toCategoryId
        });
    }
}

/**
 * Regenerate all changed chapters
 */
async function regenerateAllChangedChapters(): Promise<void> {
    const changed: ChangedChapter[] = await getChangedChapters();

    if (changed.length === 0) {
        api.v1.ui.larry.help({
            question: "No changed chapters to regenerate.",
            options: [
                { text: "OK", callback: () => { } }
            ]
        });
        return;
    }

    api.v1.ui.larry.help({
        question: `Regenerate summaries for ${changed.length} changed chapter(s)? This may take some time.`,
        options: [
            {
                text: "Yes, Regenerate All",
                callback: async () => {
                    // Set flag before starting
                    batchRegenerationInProgress = true;

                    await api.v1.ui.updateParts([{
                        id: "changed-chapters-status",
                        text: `🔄 Regenerating ${changed.length} chapter(s)...`
                    }]);

                    // Also upate main status panel to show work in progress
                    await updateStatusPanel();

                    let successCount: number = 0;
                    let failCount: number = 0;

                    for (const ch of changed) {
                        try {
                            api.v1.log(`Regenerating changed chapter ${ch.chapterNumber}...`);
                            await regenerateChapter(ch.chapterNumber);
                            successCount++;

                            // Small delay between regenerations
                            await api.v1.timers.sleep(1000);

                        } catch (error) {
                            const errorMsg = error instanceof Error ? error.message : String(error);
                            api.v1.error(`Failed to regenerate chapter ${ch.chapterNumber}:`, errorMsg);
                            failCount++;
                        }
                    }

                    const statusMessage = `✅ Regeneration complete: ${successCount} succeeded, ${failCount} failed.`;
                    api.v1.log(statusMessage);

                    await api.v1.ui.updateParts([{
                        id: "changed-chapters-status",
                        text: statusMessage
                    }]);

                    // Clear flag after completion
                    batchRegenerationInProgress = false;
                    await updateStatusPanel();
                }
            },
            {
                text: "Cancel",
                callback: () => {
                    api.v1.log("Regenerate all cancelled");
                }
            }
        ]
    });
}

/**
 * Wrapper function to detect and show changes in UI
 */
async function detectAndShowChanges(): Promise<void> {
    try {
        await api.v1.ui.updateParts([{
            id: "changed-chapters-status",
            content: [{
                type: "text",
                text: "🔍 Detecting changed chapters...",
                markdown: true
            }]
        }]);
    } catch (error) {
        // Panel might not be open
        const errorMsg = error instanceof Error ? error.message : String(error);
        api.v1.log("Error updating UI for change detection:", errorMsg);
    }

    try {
        const changed: ChangedChapter[] = await detectChangedChapters();
        await updateStatusPanel();

        if (changed.length === 0) {
            await api.v1.ui.updateParts([{
                id: "changed-chapters-status",
                text: "✅ No changed chapters detected."
            }]);
        }
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        api.v1.error("Error during change detection:", errorMsg);

        try {
            await api.v1.ui.updateParts([{
                id: "changed-chapters-status",
                content: [{
                    type: "text",
                    text: "❌ Error detecting changed chapters.",
                    markdown: true
                }]
            }]);
        } catch (uiError) {
            const uiErrorMsg = uiError instanceof Error ? uiError.message : String(uiError);
            api.v1.log("Error updating UI after detection error:", uiErrorMsg);
        }
    }
}

// ============================================================================
// AUTO-DETECTION & AUTO-REGENERATION FUNCTIONS (NEW IN v1.4.0)
// ============================================================================

/**
 * v1.4.0: Automatically detect changed chapters after user generation
 * Called from onResponse hook when user performs a generation
 */
async function autoDetectChanges(): Promise<void> {
    if (!autoDetectOnGeneration) {
        if (DEBUG_MODE) {
            api.v1.log("Auto-detection disabled by config");
        }
        return;
    }

    if (DEBUG_MODE) {
        api.v1.log("=== Auto-Detecting Changed Chapters ===");
    }

    try {
        // Detect changed chapters
        const changedChapters: ChangedChapter[] = await detectChangedChapters();
        
        // Update timestamp for UI display
        lastAutoCheckTimestamp = Date.now();
        
        if (changedChapters.length === 0) {
            if (DEBUG_MODE) {
                api.v1.log("No changed chapters detected");
            }
            
            // Clear notification
            autoDetectionNotification = "";
            await updateStatusPanel();
            return;
        }

        // Build notification message
        const chaptersList = changedChapters.map(ch => 
            ch.title || `Chapter ${ch.chapterNumber}`
        ).join(", ");
        
        autoDetectionNotification = `🔔 ${changedChapters.length} changed chapter(s) detected: ${chaptersList}`;
        
        if (DEBUG_MODE) {
            api.v1.log(`Detected ${changedChapters.length} changed chapters`);
        }

        // If auto-regenerate is enabled, start regenerating
        if (autoRegenerate) {
            await autoRegenerateChanges(changedChapters);
        } else {
            // Just show notification
            await updateStatusPanel();
        }

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        api.v1.error("Error during auto-detection:", errorMsg);
        
        autoDetectionNotification = `❌ Auto-detection failed: ${errorMsg}`;
        await updateStatusPanel();
    }
}

/**
 * v1.4.1: Check if auto-regeneration would exceed token budget
 * Shows modal to user if budget would be exceeded
 * 
 * @param changedChapters Array of chapters to be regenerated
 * @returns Promise<boolean> true if user wants to proceed, false if cancelled
 */
async function checkTokenBudgetForAutoRegeneration(changedChapters: ChangedChapter[]): Promise<boolean> {
    if (DEBUG_MODE) {
        api.v1.log("=== Checking Token Budget for Auto-Regeneration ===");
    }

    // Get current token count
    const currentTokens = await getTotalSummaryTokens();
    
    // v1.4.1 FIX: Re-read config values to handle runtime config changes
    const currentMaxTokens = await api.v1.config.get("max_total_summary_tokens") || maxTotalSummaryTokens;
    const currentThresholdPercent = await api.v1.config.get("condensation_threshold") || condensationThreshold;
    
    // Estimate tokens after regeneration
    // Assumption: Average chapter summary is ~200 tokens (conservative estimate)
    const averageChapterTokens: number = 200;
    const estimatedNewTokens: number = changedChapters.length * averageChapterTokens;
    const estimatedTotalTokens: number = currentTokens + estimatedNewTokens;

    if (DEBUG_MODE) {
        api.v1.log(`Current tokens: ${currentTokens}`);
        api.v1.log(`Estimated new tokens: ${estimatedNewTokens} (${changedChapters.length} × ${averageChapterTokens})`);
        api.v1.log(`Estimated total: ${estimatedTotalTokens}/${currentMaxTokens}`);
    }

    // Calculate threshold (same as condensation threshold)
    const threshold = currentMaxTokens * (currentThresholdPercent / 100);

    // If we're safely under threshold, proceed without prompt
    if (estimatedTotalTokens <= threshold) {
        if (DEBUG_MODE) {
            api.v1.log("✓ Token budget OK, proceeding with auto-regeneration");
        }
        return true;
    }

    // We might exceed threshold - show warning modal
    if (DEBUG_MODE) {
        api.v1.log(`⚠️ Estimated tokens (${estimatedTotalTokens}) would exceed threshold (${threshold})`);
    }

    const percentOfLimit = Math.round((estimatedTotalTokens / currentMaxTokens) * 100);
    const wouldExceedHardLimit = estimatedTotalTokens > currentMaxTokens;

    let modalContent = `**Token Budget Warning**\n\n`;
    modalContent += `Auto-regenerating ${changedChapters.length} chapter(s) may exceed your token budget:\n\n`;
    modalContent += `- **Current:** ${currentTokens} tokens\n`;
    modalContent += `- **Estimated After:** ${estimatedTotalTokens} tokens (${percentOfLimit}% of limit)\n`;
    modalContent += `- **Your Limit:** ${currentMaxTokens} tokens\n`;
    modalContent += `- **Threshold:** ${threshold} tokens (${currentThresholdPercent}%)\n\n`;

    if (wouldExceedHardLimit) {
        modalContent += `⚠️ **This would exceed your hard limit!** Automatic condensation will trigger to reduce token usage.\n\n`;
    } else {
        modalContent += `⚠️ **This would exceed your condensation threshold.** Older chapters may be automatically condensed.\n\n`;
    }

    modalContent += `**Your Options:**\n`;
    modalContent += `- **Proceed Anyway:** Auto-regenerate all chapters. Condensation will handle token management automatically.\n`;
    modalContent += `- **Cancel:** Keep chapters in changed list. Regenerate manually later (recommended if you want to review first).\n\n`;
    modalContent += `_This is just an estimate. Actual token usage may vary._`;

    return new Promise((resolve) => {
        const modal = api.v1.ui.modal.open({
            title: wouldExceedHardLimit ? "⚠️ Token Limit Would Be Exceeded" : "⚠️ Token Budget Warning",
            size: "medium",
            content: [
                {
                    type: "text",
                    text: modalContent,
                    markdown: true,
                    style: { marginBottom: "16px" }
                },
                {
                    type: "row",
                    spacing: "end",
                    content: [
                        {
                            type: "button",
                            text: "Cancel",
                            iconId: "x",
                            callback: () => {
                                if (DEBUG_MODE) {
                                    api.v1.log("User cancelled auto-regeneration due to token budget");
                                }
                                modal.close();
                                resolve(false);
                            },
                            style: { marginRight: "8px" }
                        },
                        {
                            type: "button",
                            text: "Proceed Anyway",
                            iconId: "check",
                            callback: () => {
                                if (DEBUG_MODE) {
                                    api.v1.log("User chose to proceed with auto-regeneration despite token budget warning");
                                }
                                modal.close();
                                resolve(true);
                            }
                        }
                    ]
                }
            ]
        });
    });
}

/**
 * v1.4.1: Check token budget after any generation
 * Shows warning modal when approaching threshold, forces condensation when over limit
 */
async function checkTokenBudgetAfterGeneration(): Promise<void> {
    if (DEBUG_MODE) {
        api.v1.log("=== Checking Token Budget After Generation ===");
    }

    // Get current token count
    const currentTokens = await getTotalSummaryTokens();
    
    // Re-read config values to handle runtime config changes
    const currentMaxTokens = await api.v1.config.get("max_total_summary_tokens") || maxTotalSummaryTokens;
    const currentThresholdPercent = await api.v1.config.get("condensation_threshold") || condensationThreshold;
    
    const threshold = currentMaxTokens * (currentThresholdPercent / 100);
    const percentUsed = Math.round((currentTokens / currentMaxTokens) * 100);

    if (DEBUG_MODE) {
        api.v1.log(`Current tokens: ${currentTokens}/${currentMaxTokens} (${percentUsed}%)`);
        api.v1.log(`Threshold: ${threshold} (${currentThresholdPercent}%)`);
        api.v1.log(`Over threshold: ${currentTokens > threshold}`);
        api.v1.log(`Over max: ${currentTokens > currentMaxTokens}`);
    }

    // Case 1: Over the hard limit - FORCE condensation immediately
    if (currentTokens > currentMaxTokens) {
        if (DEBUG_MODE) {
            api.v1.log("🚨 OVER MAX TOKEN LIMIT - Forcing condensation");
        }

        // Clear the warning flag (will show again next time if still approaching)
        condensationWarningShown = false;

        // Show forcing modal
        api.v1.ui.larry.help({
            question: `🚨 **Token Limit Exceeded!**\n\nYour summaries are now using **${currentTokens} tokens** (${percentUsed}% of your ${currentMaxTokens} token limit).\n\n**Automatic condensation will now run** to reduce token usage.`,
            options: [
                { text: "OK", callback: () => {} }
            ]
        });

        // Force condensation
        await checkAndCondenseIfNeeded();
        await updateStatusPanel();
        return;
    }

    // Case 2: Over threshold but under max - show warning modal (once per session)
    if (currentTokens > threshold && !condensationWarningShown) {
        if (DEBUG_MODE) {
            api.v1.log(`⚠️ Over threshold (${currentThresholdPercent}%) - showing warning modal`);
        }

        condensationWarningShown = true; // Don't show again until next time we're under threshold

        const modal = api.v1.ui.modal.open({
            title: "⚠️ Token Budget Warning",
            size: "medium",
            content: [
                {
                    type: "text",
                    text: `**You're approaching your token limit!**\n\n` +
                        `- **Current Usage:** ${currentTokens} tokens (${percentUsed}%)\n` +
                        `- **Your Limit:** ${currentMaxTokens} tokens\n` +
                        `- **Threshold:** ${threshold} tokens (${currentThresholdPercent}%)\n\n` +
                        `**What happens next:**\n` +
                        `- If you continue generating, older chapter summaries will be automatically condensed to free up tokens.\n` +
                        `- If you exceed the hard limit (${currentMaxTokens} tokens), condensation will be forced immediately.\n\n` +
                        `**Your options:**\n` +
                        `- **Condense Now:** Manually trigger condensation to reduce token usage.\n` +
                        `- **Continue:** Keep generating. Auto-condensation will handle it when needed.\n` +
                        `- **Review Settings:** Adjust your token limits in the script config.`,
                    markdown: true,
                    style: { marginBottom: "16px" }
                },
                {
                    type: "row",
                    spacing: "end",
                    content: [
                        {
                            type: "button",
                            text: "Continue",
                            iconId: "check",
                            callback: () => {
                                if (DEBUG_MODE) {
                                    api.v1.log("User chose to continue without condensing");
                                }
                                modal.close();
                            },
                            style: { marginRight: "8px" }
                        },
                        {
                            type: "button",
                            text: "Condense Now",
                            iconId: "zap",
                            callback: async () => {
                                if (DEBUG_MODE) {
                                    api.v1.log("User chose to condense now");
                                }
                                modal.close();
                                await manualCondense();
                            }
                        }
                    ]
                }
            ]
        });

        return;
    }

    // Case 3: Under threshold - clear warning flag so it can show again
    if (currentTokens <= threshold && condensationWarningShown) {
        if (DEBUG_MODE) {
            api.v1.log("✓ Back under threshold - clearing warning flag");
        }
        condensationWarningShown = false;
    }

    if (DEBUG_MODE) {
        api.v1.log("✓ Token budget OK");
    }
}

/**
 * v1.4.0: Automatically regenerate changed chapters
 * Respects the 5-generation limit enforced by NovelAI
 * MODIFIED in v1.4.1: Added token budget check before regeneration
 * 
 * @param changedChapters Array of detected changed chapters
 */
async function autoRegenerateChanges(changedChapters: ChangedChapter[]): Promise<void> {
    if (DEBUG_MODE) {
        api.v1.log(`=== Auto-Regenerating ${changedChapters.length} Changed Chapters ===`);
        api.v1.log(`Current generation counter: ${generationCounter}`);
    }

    // v1.4.1: Check token budget before regenerating
    const shouldProceed = await checkTokenBudgetForAutoRegeneration(changedChapters);
    if (!shouldProceed) {
        if (DEBUG_MODE) {
            api.v1.log("User cancelled auto-regeneration due to token budget concerns");
        }
        autoDetectionNotification = `⚠️ Auto-regeneration cancelled (token budget). ${changedChapters.length} chapters pending.`;
        await updateStatusPanel();
        return;
    }

    // Set flag to prevent onResponse hook from interfering
    autoRegenerationInProgress = true;

    try {
        for (const ch of changedChapters) {
        // Check generation limit BEFORE attempting regeneration
        if (generationCounter >= 4) {
            // At 4 generations - show modal asking if user wants to continue
            if (DEBUG_MODE) {
                api.v1.log(`Generation counter at ${generationCounter} - showing limit modal`);
            }
            
            const shouldContinue = await showGenerationLimitModal(changedChapters, ch.chapterNumber);
            
            if (!shouldContinue) {
                // User chose "Skip for Now" - leave remaining chapters in changed list
                if (DEBUG_MODE) {
                    api.v1.log("User skipped remaining auto-regenerations");
                }
                
                autoDetectionNotification = `⚠️ Generation limit reached. ${changedChapters.length} chapters still pending.`;
                await updateStatusPanel();
                return;
            }
            
            // User chose "Continue" - reset counter and proceed
            generationCounter = 0;
        }

        try {
            if (DEBUG_MODE) {
                api.v1.log(`Auto-regenerating chapter ${ch.chapterNumber} (${generationCounter + 1}/5)`);
            }
            
            // Increment generation counter BEFORE regenerating
            generationCounter++;
            
            // Update notification to show progress
            autoDetectionNotification = `🔄 Auto-regenerating: Chapter ${ch.chapterNumber}... (${generationCounter}/5)`;
            await updateStatusPanel();
            
            // Perform regeneration
            await regenerateChapter(ch.chapterNumber);
            
            if (DEBUG_MODE) {
                api.v1.log(`✓ Successfully auto-regenerated chapter ${ch.chapterNumber}`);
            }

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            api.v1.error(`Failed to auto-regenerate chapter ${ch.chapterNumber}:`, errorMsg);
            
            // Continue with next chapter even if this one failed
            continue;
        }
    }

        // All done
        autoDetectionNotification = `✅ Auto-regeneration complete! Processed ${changedChapters.length} chapter(s).`;
        await updateStatusPanel();
        
        if (DEBUG_MODE) {
            api.v1.log("=== Auto-Regeneration Complete ===");
        }

        // v1.4.1: Check if condensation is needed after regenerating multiple chapters
        if (DEBUG_MODE) {
            api.v1.log("Checking if condensation needed after auto-regeneration...");
        }
        
        try {
            await checkAndCondenseIfNeeded();
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            api.v1.error("Error during post-regeneration condensation check:", errorMsg);
            // Don't fail the entire operation, just log the error
        }
        
    } finally {
        // Always clear flag when done
        autoRegenerationInProgress = false;
    }
}

/**
 * v1.4.0: Show modal when generation limit (4/5) is reached
 * Allows user to either continue or skip remaining regenerations
 * 
 * @param remainingChapters All chapters that still need regeneration
 * @param currentChapter The chapter we're about to regenerate
 * @returns Promise<boolean> true if user wants to continue, false if skipping
 */
async function showGenerationLimitModal(
    remainingChapters: ChangedChapter[],
    currentChapter: number
): Promise<boolean> {
    if (DEBUG_MODE) {
        api.v1.log("Showing generation limit modal");
    }

    // Calculate how many chapters are left (including current)
    const currentIndex = remainingChapters.findIndex(ch => ch.chapterNumber === currentChapter);
    const chaptersRemaining = remainingChapters.length - currentIndex;

    let modalContent = `**Generation Limit Warning**\n\n`;
    modalContent += `We've used 4 out of 5 non-interactive generations allowed by NovelAI.\n\n`;
    modalContent += `**Remaining Chapters to Regenerate:** ${chaptersRemaining}\n\n`;
    modalContent += `**Your Options:**\n`;
    modalContent += `- **Continue:** Reset the counter and auto-regenerate the remaining chapter(s)\n`;
    modalContent += `- **Skip for Now:** Stop auto-regeneration. You can manually regenerate later from the panel.\n\n`;
    modalContent += `_The generation counter resets automatically when you generate text in the editor or interact with the UI._`;

    return new Promise((resolve) => {
        const modal = api.v1.ui.modal.open({
            title: "⚠️ Generation Limit Reached",
            size: "medium",
            content: [
                {
                    type: "text",
                    text: modalContent,
                    markdown: true,
                    style: { marginBottom: "16px" }
                },
                {
                    type: "row",
                    spacing: "end",
                    content: [
                        {
                            type: "button",
                            text: "Skip for Now",
                            iconId: "x",
                            callback: () => {
                                if (DEBUG_MODE) {
                                    api.v1.log("User chose to skip remaining auto-regenerations");
                                }
                                modal.close();
                                resolve(false);
                            },
                            style: { marginRight: "8px" }
                        },
                        {
                            type: "button",
                            text: "Continue",
                            iconId: "refresh",
                            callback: () => {
                                if (DEBUG_MODE) {
                                    api.v1.log("User chose to continue auto-regenerations");
                                }
                                modal.close();
                                resolve(true);
                            }
                        }
                    ]
                }
            ]
        });
    });
}

/**
 * v1.4.0: Dismiss the current auto-detection notification
 * Called when user clicks dismiss button in UI
 */
async function dismissAutoDetectionNotification(): Promise<void> {
    if (DEBUG_MODE) {
        api.v1.log("Dismissing auto-detection notification");
    }
    
    autoDetectionNotification = "";
    await updateStatusPanel();
}


/**
 * Wait for the editor to be ready for background generation
 */
async function waitForEditorReady(maxWaitMs: number = EDITOR_READY_TIMEOUT): Promise<boolean> {
    const startTime: number = Date.now();
    const checkInterval: number = 100;

    if (DEBUG_MODE) {
        api.v1.log("Waiting for editor to be ready...");
    }

    while (Date.now() - startTime < maxWaitMs) {
        if (!(await api.v1.editor.isBlocked())) {
            // Editor is unblocked, add safety buffer
            await api.v1.timers.sleep(500);

            // Double check it's still unblocked
            if (!(await api.v1.editor.isBlocked())) {
                if (DEBUG_MODE) {
                    api.v1.log("✓ Editor is ready");
                }
                return true;
            }
        }

        await api.v1.timers.sleep(checkInterval);
    }

    api.v1.error("✗ Editor did not become ready within timeout");
    return false;
}

/**
 * Attempt to generate summary with retry logic
 *  
 */
async function retryableGenerate(messages: Message[], params: GenerationParams, chapterNumber: number): Promise<GenerationResponse> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            api.v1.log(`Generation attempt ${attempt + 1}/${MAX_RETRIES} for chapter ${chapterNumber}`);

            // wait for editor to be completely ready
            const isReady = await waitForEditorReady();
            if (!isReady) {
                throw new Error("Editor is not ready for generation");
            }

            // Attempt Generation
            const result = await api.v1.generate(messages, params, undefined, "blocking");

            if (DEBUG_MODE) {
                api.v1.log(`✓ Generation successful on attempt ${attempt + 1}`);
            }

            return result;

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            api.v1.error(`Generation attempt ${attempt + 1} failed:`, errorMsg);

            // Check if we should retry
            if (attempt < MAX_RETRIES - 1) {
                const delay = RETRY_DELAYS[attempt] || 5000;
                api.v1.log(`Waiting ${delay}ms before retry...`);
                await api.v1.timers.sleep(delay);

                // For concurrent generation errors, wait extra time
                if (errorMsg.toLowerCase().includes("concurrent")) {
                    api.v1.log("Concurrent generation detected, adding extra delay...");
                    await api.v1.timers.sleep(2000);
                }
            } else {
                // max retries reached
                throw new Error(`Max retries (${MAX_RETRIES}) exceeded. Last error: ${errorMsg}`);
            }
        }
    }
    throw new Error("Unexpected error in retry loop");
}

/**
 * Get all failed chapters from storage
 */
async function getFailedChapters(): Promise<FailedChapter[]> {
    const failed = await api.v1.storyStorage.get("failedChapters") || [];
    return failed;
}

/**
 * Add a failed chapter to storage
 */
async function recordFailedChapter(chapterNumber: number, error: string): Promise<void> {
    const failed = await getFailedChapters();

    // Check if this chapter already exists in failed list
    const existingIndex = failed.findIndex(f => f.chapterNumber === chapterNumber);

    if (existingIndex >= 0) {
        // Update Existing Entry
        failed[existingIndex].attempts += 1;
        failed[existingIndex].lastError = error;
        failed[existingIndex].timestamp = Date.now();
    } else {
        // Add new entry
        failed.push({
            chapterNumber,
            attempts: 1,
            lastError: error,
            timestamp: Date.now()
        });
    }

    await api.v1.storyStorage.set("failedChapters", failed);
    api.v1.log(`Recorded failed chapter ${chapterNumber}`);
}

/**
 * Remove a chapter from failed list (after successful retry)
 */
async function clearFailedChapter(chapterNumber: number): Promise<void> {
    const failed = await getFailedChapters();
    const filtered = failed.filter(f => f.chapterNumber !== chapterNumber);
    await api.v1.storyStorage.set("failedChapters", filtered);
}

// ============================================================================
// TOKEN MANAGEMENT FUNCTIONS (NEW IN v1.2.0)
// ============================================================================

/**
 * Get all chapter summary entries from lorebook
 */
async function getChapterSummaryEntries(): Promise<ChapterSummaryEntry[]> {
    const entries = await api.v1.lorebook.entries(lorebookCategoryId);
    const chapterEntries: ChapterSummaryEntry[] = [];

    for (const entry of entries) {
        if (!entry.text) continue;

        // Parse the entry to extract chapter info
        // v1.4.1 FIX: Support both "Chapter" and "Chapters" for condensed entries
        const chapterMatch = entry.text.match(/^Chapters? (\d+)(?:-(\d+))?/);
        if (!chapterMatch) continue;

        const startChapter = parseInt(chapterMatch[1]);
        const endChapter = chapterMatch[2] ? parseInt(chapterMatch[2]) : startChapter;
        const isCondensed = startChapter !== endChapter;

        // Count tokens in the text
        const model = "glm-4-6";
        const tokens = await api.v1.tokenizer.encode(entry.text || "", model);
        const tokenCount = tokens.length;

        chapterEntries.push({
            entryId: entry.id,
            chapterNumber: startChapter,
            startChapter,
            endChapter,
            title: entry.displayName || `Chapter ${startChapter}`,
            text: entry.text,
            isCondensed,
            tokenCount
        });
    }

    // Sort by chapter number
    chapterEntries.sort((a, b) => a.chapterNumber - b.chapterNumber);

    if (DEBUG_MODE) {
        api.v1.log(`Found ${chapterEntries.length} chapter entries in lorebook`);
    }

    return chapterEntries;
}

/**
 * Calculate total tokens across all chapter summaries
 */
async function getTotalSummaryTokens(): Promise<number> {
    const entries = await getChapterSummaryEntries();
    const total = entries.reduce((sum, entry) => sum + entry.tokenCount, 0);

    if (DEBUG_MODE) {
        api.v1.log(`Total summary tokens: ${total}`);
    }

    return total;
}

/**
 * Archive summaries before condensing them
 */
async function archiveSummaries(entries: ChapterSummaryEntry[]): Promise<void> {
    const archived = await api.v1.storyStorage.get("archivedSummaries") || [];

    for (const entry of entries) {
        archived.push({
            chapterNumber: entry.chapterNumber,
            title: entry.title,
            text: entry.text,
            originalEntryId: entry.entryId,
            archivedAt: Date.now()
        });
    }

    await api.v1.storyStorage.set("archivedSummaries", archived);
    api.v1.log(`Archived ${entries.length} summaries`);
}

/**
 * Condense multiple summaries into one
 */
async function condenseSummaries(entriesToCondense: ChapterSummaryEntry[], condensedTitle: string): Promise<string> {
    api.v1.log(`Condensing ${entriesToCondense.length} summaries: ${condensedTitle}`);

    // Archive the originals
    await archiveSummaries(entriesToCondense);

    // Build the condensation prompt
    const summaryTexts = entriesToCondense.map(e => {
        return `${e.title}:\n${e.text}\n`;
    }).join("\n");

    const condensationPrompt = `You are condensing multiple chapter summaries into a single coherent summary.

Original Chapters: ${condensedTitle}

Chapter Summaries:
${summaryTexts}

Provide a concise narrative summary that captures the key plot points, character developments, and important events across these chapters. Maximum length: 3-4 sentences.`;

    const messages: Message[] = [{
        role: "user",
        content: condensationPrompt
    }];

    let generatedSummaryParams = await api.v1.generationParameters.get();
    generatedSummaryParams.max_tokens = summaryMaxtokens;

    // v1.4.1: Increment generation counter for condensation
    generationCounter++;
    if (DEBUG_MODE) {
        api.v1.log(`Condensation generation counter: ${generationCounter}/5`);
    }

    // Generate the condensed summary
    const generatedSummary = await retryableGenerate(messages, generatedSummaryParams, entriesToCondense[0].chapterNumber);
    const summaryText = generatedSummary.choices[0].text.trim();

    // Format the lorebook entry text
    const formattedText = `${condensedTitle}\nType: chapters\nSummary: ${summaryText}`;

    // Create new condensed lorebook entry
    const chapterLorebookEntry: LorebookEntry = {
        id: api.v1.uuid(),
        displayName: condensedTitle,
        category: lorebookCategoryId,
        text: formattedText,
        keys: undefined,
        hidden: false,
        enabled: true,
        advancedConditions: undefined,
        forceActivation: true
    };

    const entryId = await api.v1.lorebook.createEntry(chapterLorebookEntry);

    // Delete the original entries
    for (const entry of entriesToCondense) {
        await api.v1.lorebook.removeEntry(entry.entryId);
    }

    // Store condensed range info
    const condensedRanges = await api.v1.storyStorage.get("condensedRanges") || [];
    const model = "glm-4-6";
    const tokens = await api.v1.tokenizer.encode(formattedText, model);

    condensedRanges.push({
        id: api.v1.uuid(),
        startChapter: entriesToCondense[0].startChapter,
        endChapter: entriesToCondense[entriesToCondense.length - 1].endChapter,
        lorebookEntryId: entryId,
        originalSummaries: entriesToCondense.map(e => ({
            chapterNumber: e.chapterNumber,
            title: e.title,
            text: e.text,
            originalEntryId: e.entryId,
            archivedAt: Date.now()
        })),
        condensedTokens: tokens.length,
        condensedAt: Date.now()
    });

    await api.v1.storyStorage.set("condensedRanges", condensedRanges);


    // v1.4.1: Mark chapters as condensed in fingerprints with enhanced tracking
    const fingerprints: ChapterFingerprint[] = await getChapterFingerprints();
    const startChapterNum = entriesToCondense[0].startChapter;
    const endChapterNum = entriesToCondense[entriesToCondense.length - 1].endChapter;
    
    for (const entry of entriesToCondense) {
        const fp = fingerprints.find(f => f.chapterNumber === entry.chapterNumber);
        if (fp) {
            fp.isCondensed = true;
        }
    }
    await api.v1.storyStorage.set("chapterFingerprints", fingerprints);

    if (DEBUG_MODE) {
        api.v1.log(`✓ Marked chapters ${startChapterNum}-${endChapterNum} as condensed in fingerprints`);
    }

    api.v1.log(`✓ Created condensed entry: ${condensedTitle} (${tokens.length} tokens)`);
    return entryId;
}

/**
 * Level 1: Normal condensation (respects recent_chapters_to_keep)
 */
async function performNormalCondensation(): Promise<void> {
    api.v1.log("=== Performing Normal Condensation (Level 1) ===");

    const entries = await getChapterSummaryEntries();
    const totalChapters = entries.length;

    if (totalChapters <= recentChaptersToKeep) {
        api.v1.log("Not enough chapters to condense while respecting recent chapters target");
        return;
    }

    // Find uncondensed entries that are old enough
    const protectedStartIndex = Math.max(0, totalChapters - recentChaptersToKeep);
    const oldEntries = entries.slice(0, protectedStartIndex);
    const uncondensedOldEntries = oldEntries.filter(e => !e.isCondensed);

    if (uncondensedOldEntries.length === 0) {
        api.v1.log("No uncondensed old entries to condense");
        return;
    }

    // Group entries for condensation
    const groupSize = Math.min(chaptersPerCondensedGroup, uncondensedOldEntries.length);
    const groupToCondense = uncondensedOldEntries.slice(0, groupSize);

    const startChapter = groupToCondense[0].chapterNumber;
    const endChapter = groupToCondense[groupToCondense.length - 1].chapterNumber;
    const condensedTitle = `Chapters ${startChapter}-${endChapter}`;

    await condenseSummaries(groupToCondense, condensedTitle);
}

/**
 * Level 2: Aggressive condensation (condense everything except last 2 chapters)
 */
async function performAggressiveCondensation(): Promise<void> {
    api.v1.log("=== Performing Aggressive Condensation (Level 2) ===");

    const entries = await getChapterSummaryEntries();
    const totalChapters = entries.length;

    if (totalChapters <= 2) {
        api.v1.log("Not enough chapters for aggressive condensation");
        return;
    }

    const chaptersToCondense = entries.slice(0, totalChapters - 2);
    const startChapter = chaptersToCondense[0].startChapter;
    const endChapter = chaptersToCondense[chaptersToCondense.length - 1].endChapter;
    const condensedTitle = `Chapters ${startChapter}-${endChapter}`;

    await condenseSummaries(chaptersToCondense, condensedTitle);
}

/**
 * Level 3: Emergency condensation (condense everything except last chapter)
 */
async function performEmergencyCondensation(): Promise<void> {
    api.v1.log("=== Performing Emergency Condensation (Level 3) ===");

    const entries = await getChapterSummaryEntries();
    const totalChapters = entries.length;

    if (totalChapters <= 1) {
        api.v1.log("Cannot condense - only one chapter remains");
        return;
    }

    const chaptersToCondense = entries.slice(0, totalChapters - 1);
    const startChapter = chaptersToCondense[0].startChapter;
    const endChapter = chaptersToCondense[chaptersToCondense.length - 1].endChapter;
    const condensedTitle = `Chapters ${startChapter}-${endChapter}`;

    await condenseSummaries(chaptersToCondense, condensedTitle);
}

/**
 * Main orchestration function: Check token count and condense if needed
 */
async function checkAndCondenseIfNeeded(): Promise<void> {
    const currentTokens = await getTotalSummaryTokens();
    
    // v1.4.1 FIX: Re-read config values to handle runtime config changes
    const currentMaxTokens = await api.v1.config.get("max_total_summary_tokens") || maxTotalSummaryTokens;
    const currentThresholdPercent = await api.v1.config.get("condensation_threshold") || condensationThreshold;
    
    const threshold = currentMaxTokens * (currentThresholdPercent / 100);

    if (currentTokens <= threshold) {
        if (DEBUG_MODE) {
            api.v1.log(`Token count OK: ${currentTokens}/${currentMaxTokens} (threshold: ${threshold})`);
        }
        return;
    }

    api.v1.log(`⚠️ Token limit reached: ${currentTokens}/${currentMaxTokens} tokens (threshold: ${threshold})`);

    try {
        // Try Level 1: Normal condensation
        await performNormalCondensation();

        const tokensAfterLevel1 = await getTotalSummaryTokens();
        if (tokensAfterLevel1 <= currentMaxTokens) {
            api.v1.log("✓ Normal condensation resolved token pressure");
            await updateStatusPanel();
            return;
        }

        // Try Level 2: Aggressive condensation
        api.v1.log("⚠️ Still over budget, attempting aggressive condensation...");
        await performAggressiveCondensation();

        const tokensAfterLevel2 = await getTotalSummaryTokens();
        if (tokensAfterLevel2 <= currentMaxTokens) {
            api.v1.log("✓ Aggressive condensation resolved token pressure");
            await updateStatusPanel();
            return;
        }

        // Try Level 3: Emergency condensation
        api.v1.log("⚠️⚠️ Still over budget, attempting emergency condensation...");
        await performEmergencyCondensation();

        const tokensAfterLevel3 = await getTotalSummaryTokens();
        if (tokensAfterLevel3 <= currentMaxTokens) {
            api.v1.log("✓ Emergency condensation resolved token pressure");
            await updateStatusPanel();
            return;
        }

        // Level 4: This shouldn't happen
        api.v1.error("❌ Unable to reduce token usage below limit even after emergency condensation!");
        api.v1.ui.larry.help({
            question: "Unable to condense summaries below token limit. Consider increasing 'Max Total Summary Tokens' in script config.",
            options: [{ text: "OK", callback: () => { } }]
        });

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        api.v1.error("Error during condensation:", errorMsg);

        // Record as a special failed "condensation" task
        api.v1.ui.larry.help({
            question: `Failed to condense summaries: ${errorMsg}. You can try manually from the panel.`,
            options: [
                {
                    text: "Open Panel",
                    callback: () => api.v1.ui.openPanel("chapter-summaries-panel")
                },
                {
                    text: "OK",
                    callback: () => { }
                }
            ]
        });
    }
}

/**
 * Manual condensation trigger
 */
async function manualCondense(): Promise<void> {
    api.v1.log("Manual condensation triggered");

    await api.v1.ui.updateParts([{
        id: "condensation-status",
        text: "Checking token usage..."
    }]);

    try {
        await checkAndCondenseIfNeeded();

        await api.v1.ui.updateParts([{
            id: "condensation-status",
            text: "✓ Condensation complete!"
        }]);
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        await api.v1.ui.updateParts([{
            id: "condensation-status",
            text: `✗ Condensation failed: ${errorMsg}`
        }]);
    }
}

/**
 * Build the dynamic changed chapters UI content
 * @returns UIPart[] Array of UI parts for changed chapters
 */
async function buildChangedChaptersUI(): Promise<UIPart[]> {
    const changedChapters: ChangedChapter[] = await getChangedChapters();

    if (changedChapters.length === 0) {
        return [{
            type: "text",
            text: "✓ No changed chapters detected.",
            markdown: true,
        }];
    }

    const content: UIPart[] = [];

    // Header
    content.push({
        type: "text",
        text: `⚠️ **${changedChapters.length} Changed Chapter(s) Detected:**`,
        markdown: true,
        style: { marginBottom: "12px" }
    });

    // Individual chapter entries
    for (const ch of changedChapters) {
        const timeAgo: number = Math.round((Date.now() - ch.detectedAt) / 1000 / 60);
        const chapterTitle: string = ch.title || `Chapter ${ch.chapterNumber}`;

        // Seperator line
        content.push({
            type: "container",
            style: {
                borderTop: "1px solid rgba(255, 165, 0, 0.3)",
                marginTop: "12px",
                marginBottom: "12px"
            },
            content: []
        });

        // Chapter info
        content.push({
            type: "text",
            text: `**${chapterTitle}**\nDetected ${timeAgo}m ago`,
            markdown: true,
            style: { marginBottom: "8px" }
        });

        // Action buttons for this chapter
        content.push({
            type: "row",
            spacing: "start",
            content: [
                {
                    type: "button",
                    text: "Regenerate",
                    iconId: "refresh",
                    callback: () => regenerateIndividualChapter(ch.chapterNumber),
                    style: { marginRight: "8px" }
                },
                {
                    type: "button",
                    text: "Dismiss",
                    iconId: "x",
                    callback: () => dismissIndividualChapter(ch.chapterNumber)
                }
            ],
            style: { marginBottom: "12px" }
        });
    }

    // Separator before bulk actions
    content.push({
        type: "container",
        style: {
            borderTop: "2px solid rgba(255, 165, 0, 0.5)",
            marginTop: "16px",
            marginBottom: "12px"
        },
        content: []
    });

    // Bulk actions
    content.push({
        type: "text",
        text: "**Bulk Actions:**",
        markdown: true,
        style: { marginBottom: "8px" }
    });

    content.push({
        type: "row",
        spacing: "start",
        content: [
            {
                type: "button",
                text: "Regenerate All",
                iconId: "refresh",
                callback: () => regenerateAllChangedChapters(),
                style: { marginRight: "8px" }
            },
            {
                type: "button",
                text: "Dismiss All",
                iconId: "x",
                callback: () => dismissAllChangedChapters()
            }
        ]
    });

    return content;
}

/**
 * Update the UI panel with current status
 * MODIFIED in v1.2.0: Added token usage display
 * MODIFIED in v1.2.1: Added background work indicator
 * MODIFIED in v1.3.0: Dynamic changed chapters UI
 */
async function updateStatusPanel(): Promise<void> {
    if (DEBUG_MODE) {
        api.v1.log("Updating status panel...");
    }

    const failed = await getFailedChapters();
    const lastProcessed = await api.v1.storyStorage.get("lastProcessedChapterCount") || 0;

    // Get token usage
    const currentTokens = await getTotalSummaryTokens();
    
    // v1.4.1 FIX: Re-read config values to handle runtime config changes
    const currentMaxTokens = await api.v1.config.get("max_total_summary_tokens") || maxTotalSummaryTokens;
    const currentThresholdPercent = await api.v1.config.get("condensation_threshold") || condensationThreshold;
    
    const threshold = currentMaxTokens * (currentThresholdPercent / 100);
    const percentUsed = Math.round((currentTokens / currentMaxTokens) * 100);

    let tokenStatus = "✓";
    if (currentTokens > currentMaxTokens) {
        tokenStatus = "❌";
    } else if (currentTokens > threshold) {
        tokenStatus = "⚠️";
    }

    // Get summary breakdown
    const entries = await getChapterSummaryEntries();
    const detailedEntries = entries.filter(e => !e.isCondensed);
    const condensedEntries = entries.filter(e => e.isCondensed);

    let statusText = `**Token Usage:**\n`;
    statusText += `${tokenStatus} ${currentTokens} / ${currentMaxTokens} tokens (${percentUsed}%)\n`;
    if (currentTokens > threshold) {
        statusText += `⚠️ Over ${currentThresholdPercent}% threshold\n`;
    }

    // NEW in v1.2.1: Show background work indicator
    if (backgroundSummaryInProgress) {
        statusText += `🔄 Background summary generation in progress...\n`;
        statusText += `   (Please wait before starting new generation)\n`;
    }

    // Show if batch regeneration is in progress
    if (batchRegenerationInProgress) {
        statusText += `🔄 Batch regeneration of changed chapters in progress...\n`;
        statusText += `   (Please wait before starting new generation)\n`;
    }

    statusText += `\n`;

    // NEW in v1.4.0: Show auto-detection notification
    if (autoDetectionNotification) {
        statusText += `**Auto-Detection:**\n`;
        statusText += `${autoDetectionNotification}\n`;
        
        if (lastAutoCheckTimestamp > 0) {
            const minutesAgo = Math.round((Date.now() - lastAutoCheckTimestamp) / 1000 / 60);
            statusText += `Last check: ${minutesAgo}m ago\n`;
        }
        
        statusText += `\n`;
    }

    statusText += `**Summary Breakdown:**\n`;
    if (detailedEntries.length > 0) {
        const detailedChapters = detailedEntries.map(e => e.chapterNumber).join(", ");
        statusText += `✓ Detailed: ${detailedEntries.length} chapter(s) - [${detailedChapters}]\n`;
    }
    if (condensedEntries.length > 0) {
        statusText += `📦 Condensed: ${condensedEntries.length} entry(s)\n`;
    }
    statusText += `\n`;

    statusText += `**Status:**\n`;
    statusText += `✓ Successfully summarized: ${lastProcessed} chapter(s)\n`;
    statusText += `✗ Failed summaries: ${failed.length}\n\n`;

    if (failed.length > 0) {
        statusText += `**Failed Chapters:**\n`;
        failed.forEach(f => {
            const timeAgo = Math.round((Date.now() - f.timestamp) / 1000 / 60);
            statusText += `- Chapter ${f.chapterNumber}: ${f.attempts} attempt(s), ${timeAgo}m ago\n`;
            statusText += `  Error: ${f.lastError.substring(0, 100)}...\n`;
        });
    }

    // Build dynamic changed chapters UI
    const changedChaptersContent = await buildChangedChaptersUI();

    try {
        // Update status display
        await api.v1.ui.updateParts([{
            id: "status-display",
            text: statusText
        }]);

        // Rebuild the entire changed chapters box with new content
        await api.v1.ui.updateParts([{
            id: "changed-chapters-box",
            content: changedChaptersContent
        }]);

        // v1.4.1: Clear temporary status messages to prevent stale UI
        // Only clear if they're not currently showing active operations
        if (!backgroundSummaryInProgress && !batchRegenerationInProgress) {
            await api.v1.ui.updateParts([
                {
                    id: "retry-status",
                    text: ""
                },
                {
                    id: "rebuild-progress",
                    text: ""
                }
            ]);
        }
    } catch (error) {
        // Panel might not be open that's okay
        if (DEBUG_MODE) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            api.v1.log("Could not update status panel:", errorMsg);
        }
    }
}

/**
 * Manually retry all failed chapters
 */
async function retryFailedChapters(): Promise<void> {
    const failed = await getFailedChapters();

    if (failed.length === 0) {
        api.v1.log("No failed chapters to retry");
        await api.v1.ui.updateParts([{
            id: "retry-status",
            text: "No failed chapters found."
        }]);
        return;
    }

    // v1.4.1: Reset generation counter before retry
    generationCounter = 0;
    if (DEBUG_MODE) {
        api.v1.log("Reset generation counter before retry");
    }

    api.v1.log(`Attempting to retry ${failed.length} failed chapter(s)...`);

    await api.v1.ui.updateParts([{
        id: "retry-status",
        text: `Retrying ${failed.length} chapter(s)...`
    }]);

    const sections: DocumentSections = await api.v1.document.scan();
    const fullText = sections.map(s => s.section.text).join('\n');
    const chapters = splitIntoChapters(fullText);

    let successCount = 0;
    let failCount = 0;

    for (const failedChapter of failed) {
        try {
            // v1.4.1: Increment generation counter for each retry
            generationCounter++;
            if (DEBUG_MODE) {
                api.v1.log(`Generation counter: ${generationCounter}/5 for chapter ${failedChapter.chapterNumber}`);
            }

            api.v1.log(`Retrying chapter ${failedChapter.chapterNumber}...`);

            // Get the chapter text
            let chapterText: string;
            if (failedChapter.chapterNumber === 1) {
                chapterText = chapters[0];
            } else {
                const chapterIndex = failedChapter.chapterNumber - 1;
                chapterText = chapters[chapterIndex] || "";
            }

            if (!chapterText) {
                api.v1.error(`Could not find text for chapter ${failedChapter.chapterNumber}`);
                failCount++;
                continue;
            }

            const title: string | null = extractChapterTitle(chapterText);

            // Set as pending
            await api.v1.storyStorage.set("pendingChapter", failedChapter.chapterNumber);

            // Try to generate
            await generateChapterSummary({ text: chapterText, title });
            successCount++;

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            api.v1.error(`Failed to retry chapter ${failedChapter.chapterNumber}:`, errorMsg);
            failCount++;
        }

        // Small delay between retries
        await api.v1.timers.sleep(1000);
    }

    const statusMsg = `Retry complete: ${successCount} succeeded, ${failCount} failed.`;
    api.v1.log(statusMsg);

    await api.v1.ui.updateParts([{
        id: "retry-status",
        text: statusMsg
    }]);

    // v1.4.1: Reset generation counter after retry
    generationCounter = 0;
    if (DEBUG_MODE) {
        api.v1.log("Reset generation counter after retry");
    }

    await updateStatusPanel();
}

/**
 * Clear all failed chapter records
 */
async function clearAllFailures(): Promise<void> {
    api.v1.ui.larry.help({
        question: "Are you sure you want to clear all failed chapter records? This action cannot be undone.",
        options: [
            {
                text: "Yes, Clear All",
                callback: async () => {
                    await api.v1.storyStorage.set("failedChapters", []);
                    api.v1.log("Cleared all failed chapter records");
                    await updateStatusPanel();

                    await api.v1.ui.updateParts([{
                        id: "retry-status",
                        text: "Failed chapter records cleared."
                    }]);
                }
            },
            {
                text: "Cancel",
                callback: () => {
                    api.v1.log("Clear failed records cancelled");
                }
            }
        ]
    });
}

/**
 * Check if lorebook category exists
 */
async function checkLorebookCategoryExists(category: string): Promise<boolean> {
    if (category.length === 0) {
        api.v1.error("Lorebook Category config option cannot be empty.");
        return false;
    }

    // Get all categories
    const lorebookCategories: LorebookCategory[] = await api.v1.lorebook.categories();

    // Check if category exists by searching for the name
    const categoryExists = lorebookCategories.some(cat => cat.name === category);

    if (!categoryExists) {
        if (DEBUG_MODE) {
            api.v1.log(`Lorebook category "${category}" not found.`);
        }
        return false;
    }

    return true;
}

/**
 * Create chapter summaries lorebook category
 */
async function createChapterSummariesLorebookCategory(categoryName: string) {
    let chapterSummariesCat: LorebookCategory = {
        id: api.v1.uuid(),
        name: categoryName,
        enabled: true,
        settings: {
            entryHeader: "----"
        }
    };

    lorebookCategoryId = await api.v1.lorebook.createCategory(chapterSummariesCat);

    // Store the ID in storage so it persists
    await api.v1.storyStorage.set("chapterSummaryCategoryId", lorebookCategoryId);

    api.v1.log(`Created category "${lorebookCategoryId}"`);
}

async function checkIfSummaryNeeded(recentText: string): Promise<boolean> {

    const sections: DocumentSections = await api.v1.document.scan();
    const fullText = sections.map(s => s.section.text).join('\n');

    const escapedToken = chapterBreakToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Match token ONLY when it's on its own line (with optional surrounding whitespace)
    // This prevents matching tokens that appear in the middle of text
    const breakPattern = new RegExp(`(?:^|\\n)\\s*${escapedToken}\\s*(?=\\n|$)`, 'gm');
    const chapterBreakCount = (fullText.match(breakPattern) || []).length;

    if (DEBUG_MODE) {
        api.v1.log(`Chapter break count: ${chapterBreakCount}`);
    }

    // If there are NO chapter breaks yet, we're still writing chapter 1 - don't summarize
    if (chapterBreakCount === 0) {
        if (DEBUG_MODE) {
            api.v1.log("No chapter breaks found; still writing chapter 1; skipping.");
        }
        return false;
    }

    // The chapter to summarize is the one BEFORE the most recent break
    // (We just finished it by adding a break, now we need to summarize it)
    const chapterToSummarize = chapterBreakCount;

    // Check if we're currently processing this chapter
    const pendingChapter = await api.v1.storyStorage.get("pendingChapter") || 0;

    if (pendingChapter === chapterToSummarize) {
        if (DEBUG_MODE) {
            api.v1.log(`Chapter ${chapterToSummarize} currently pending; skipping.`);
        }
        return false;
    }

    // Check if this specific chapter already has a fingerprint (meaning it was already summarized)
    const fingerprints: ChapterFingerprint[] = await getChapterFingerprints();
    const hasFingerprint = fingerprints.some(fp => fp.chapterNumber === chapterToSummarize);
    
    if (hasFingerprint) {
        if (DEBUG_MODE) {
            api.v1.log(`Chapter ${chapterToSummarize} already has fingerprint; skipping.`);
        }
        return false;
    }

    // Check if we should summarize based on the config
    let summaryNeeded = false;

    if (summarizeAllBreaks === true) {
        // Any valid chapter break (token on its own line) triggers a summary
        summaryNeeded = true;
    } else {
        let summaryString = chapterBreakToken + "\n\n" + "[";
        summaryNeeded = recentText.includes(summaryString);
    }

    if (summaryNeeded) {
        // Mark this chapter as pending
        await api.v1.storyStorage.set("pendingChapter", chapterToSummarize);
    }

    return summaryNeeded;
}

/**
 * Extract chapter title from chapter text
 * v1.4.0: Now respects summarizeAllBreaks config
 * 
 * @param chapterText The full text of the chapter
 * @returns The extracted title, or null if none found
 */
function extractChapterTitle(chapterText: string): string | null {
    // Look for title pattern: text after opening bracket [
    // Can have closing bracket ] or not
    const bracketMatch = chapterText.match(/^\s*\[(.*?)(?:\]|$)/m);
    
    if (bracketMatch && bracketMatch[1]) {
        const title = bracketMatch[1].trim();
        if (title.length > 0) {
            if (DEBUG_MODE) {
                api.v1.log(`Extracted title from brackets: "${title}"`);
            }
            return title;
        }
    }

    return null;
}

/**
 * Check if text after a chapter break token is a valid chapter start
 * v1.4.0: Implements summarizeAllBreaks logic
 * 
 * @param textAfterBreak Text immediately following a chapter break token
 * @returns true if this is a valid chapter break
 */
function isValidChapterBreak(textAfterBreak: string): boolean {
    if (summarizeAllBreaks) {
        // All breaks are valid chapter breaks
        return true;
    }
    
    // Only valid if followed by opening bracket [
    const trimmed = textAfterBreak.trimStart();
    const hasOpeningBracket = trimmed.startsWith('[');
    
    if (DEBUG_MODE && !hasOpeningBracket) {
        api.v1.log(`Skipping break - no opening bracket found (summarizeAllBreaks=false)`);
    }
    
    return hasOpeningBracket;
}

/**
 * Split document text into chapters, respecting summarizeAllBreaks config
 * v1.4.0: New function to properly handle chapter splitting
 * 
 * @param fullText The complete document text
 * @returns Array of chapter texts
 */
function splitIntoChapters(fullText: string): string[] {
    if (summarizeAllBreaks) {
        // Simple split - all breaks are chapters
        return fullText.split(chapterBreakToken);
    }
    
    // Complex split - only breaks followed by [ are chapters
    const escapedToken = chapterBreakToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const breakPattern = new RegExp(`(?:^|\\n)\\s*${escapedToken}\\s*(?=\\n|$)`, 'gm');
    
    const chapters: string[] = [];
    let lastIndex = 0;
    let currentChapter = "";
    
    // Find all break positions
    let match;
    while ((match = breakPattern.exec(fullText)) !== null) {
        const breakPos = match.index;
        const textBeforeBreak = fullText.substring(lastIndex, breakPos);
        const textAfterBreak = fullText.substring(breakPos + match[0].length);
        
        // Check if this is a valid chapter break
        if (isValidChapterBreak(textAfterBreak)) {
            // Save accumulated text as a chapter
            currentChapter += textBeforeBreak;
            if (currentChapter.trim().length > 0 || chapters.length === 0) {
                chapters.push(currentChapter);
            }
            currentChapter = "";
            lastIndex = breakPos + match[0].length;
        } else {
            // Not a valid break - include the break token in the current chapter
            currentChapter += textBeforeBreak + match[0];
            lastIndex = breakPos + match[0].length;
        }
    }
    
    // Add remaining text as final chapter
    currentChapter += fullText.substring(lastIndex);
    if (currentChapter.trim().length > 0 || chapters.length === 0) {
        chapters.push(currentChapter);
    }
    
    if (DEBUG_MODE) {
        api.v1.log(`splitIntoChapters: Found ${chapters.length} valid chapters (summarizeAllBreaks=${summarizeAllBreaks})`);
    }
    
    return chapters;
}

async function scanForPreviousChapter(sections: DocumentSections): Promise<{ text: string; title: string | null }> {
    const fullText = sections.map(s => s.section.text).join('\n');
    const chapters = splitIntoChapters(fullText);

    let chapterText: string;

    if (isFirstChapter) {
        if (DEBUG_MODE) {
            api.v1.log("Scanning from beginning of text (first chapter)");
        }
        chapterText = chapters[0];
    } else {
        chapterText = chapters.length > 1 ? chapters[chapters.length - 2] : "";
    }

    const title: string | null = extractChapterTitle(chapterText);

    if (DEBUG_MODE) {
        api.v1.log(`Chapter text length: ${chapterText.length} characters`);
        api.v1.log(`Extracted title: ${title || "(none)"}`);
    }

    return { text: chapterText, title };
}

/**
 * MODIFIED in v1.2.0: Added checkAndCondenseIfNeeded() call at the end
 */
async function generateChapterSummary(chapterData: { text: string; title: string | null }) {
    const pendingChapter = await api.v1.storyStorage.get("pendingChapter") || 1;

    try {
        api.v1.log(`=== Starting summary generation for chapter ${pendingChapter} ===`);

        if (isFirstChapter) {
            isFirstChapter = false;
            await api.v1.storyStorage.set("isFirstChapter", false);
            if (DEBUG_MODE)
                api.v1.log("Generated first chapter entry, setting isFirstChapter false");
        }

        // Use the extracted title or generate a default
        let chapterTitle = chapterData.title || `Chapter ${pendingChapter}`;
        api.v1.log(`Using title: ${chapterTitle}`);

        const message: Message[] = [{
            role: "user",
            content: `${promptString}${chapterData.text}`
        }];

        if (DEBUG_MODE) {
            api.v1.log(`Prompt length: ${promptString.length} chars`);
            api.v1.log(`Chapter text length: ${chapterData.text.length} chars`);
        }

        let generatedSummaryParams = await api.v1.generationParameters.get();
        generatedSummaryParams.max_tokens = summaryMaxtokens;

        api.v1.log(`Generation params: ${JSON.stringify(generatedSummaryParams)}`);

        // Attempt generation with retries
        const generatedSummary = await retryableGenerate(message, generatedSummaryParams, pendingChapter);
        const summaryText = generatedSummary.choices[0].text.trim();

        // Format the lorebook entry text
        const formattedText = `Chapter ${pendingChapter}\nType: chapter\nTitle: ${chapterTitle}\nSummary: ${summaryText}`;

        api.v1.log(`Generated summary (${summaryText.length} chars)`);

        // Validate category ID
        if (!lorebookCategoryId) {
            throw new Error("Lorebook category ID not set");
        }

        // Create the lorebook entry
        const chapterLorebookEntry: LorebookEntry = {
            id: api.v1.uuid(),
            displayName: chapterTitle,
            category: lorebookCategoryId,
            text: formattedText,
            keys: undefined,
            hidden: false,
            enabled: true,
            advancedConditions: undefined,
            forceActivation: true
        };

        const entryId = await api.v1.lorebook.createEntry(chapterLorebookEntry);

        if (!entryId) {
            throw new Error("Failed to create lorebook entry - empty ID returned");
        }

        api.v1.log(`✓ Successfully created Chapter Summary for ${chapterTitle} (ID: ${entryId})`);

        // Mark as successfully processed
        await api.v1.storyStorage.set("lastProcessedChapterCount", pendingChapter);
        await api.v1.storyStorage.remove("pendingChapter");

        // Clear from failed list if it was there
        await clearFailedChapter(pendingChapter);

        // Store fingerprint for change detection
        await storeChapterFingerprint(pendingChapter, chapterData.text, false);

        // Update UI
        await updateStatusPanel();

        // Check if we need to condense summaries
        api.v1.log("Checking if condensation is needed...");
        await checkAndCondenseIfNeeded();

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        api.v1.error(`✗ Failed to generate summary for chapter ${pendingChapter}:`, errorMsg);

        // Record the failure
        await recordFailedChapter(pendingChapter, errorMsg);

        // Clear pending so it can be retried
        await api.v1.storyStorage.remove("pendingChapter");

        // Update the UI
        await updateStatusPanel();

        // Notify the user if max retries was hit
        if (errorMsg.includes("Max retries")) {
            api.v1.ui.larry.help({
                question: `Failed to generate summary for Chapter ${pendingChapter} after ${MAX_RETRIES} attempts. You can manually retry from the "Chapter Summaries" panel below the editor.`,
                options: [
                    {
                        text: "Open Panel",
                        callback: () => api.v1.ui.openPanel("chapter-summaries-panel")
                    },
                    {
                        text: "OK",
                        callback: () => { }
                    }
                ]
            });
        }

        throw error;
    }
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook: Called when generation completes
 * MODIFIED in v1.4.0: Resets generation counter and triggers auto-detection
 * Checks if a chapter summary is needed and schedules generation
 */
const onResponseHook: OnResponse = async (params) => {
    if (params.final) {
        // v1.4.0: Skip if this is an auto-regeneration generation (prevents loops)
        if (autoRegenerationInProgress) {
            if (DEBUG_MODE) {
                api.v1.log("Skipping onResponse hook - auto-regeneration in progress");
            }
            return;
        }

        if (DEBUG_MODE) {
            api.v1.log("Generation complete, checking if summary needed...");
        }

        // v1.4.0: Reset generation counter when user does a generation
        if (DEBUG_MODE && generationCounter > 0) {
            api.v1.log(`Resetting generation counter (was ${generationCounter})`);
        }
        generationCounter = 0;

        const sections: DocumentSections = await api.v1.document.scan();
        const fullText = sections.map(s => s.section.text).join('\n');

        const needsSummary = await checkIfSummaryNeeded(fullText);

        if (needsSummary) {
            api.v1.log("Summary needed - scheduling generation to run after hook completes...");

            // NEW in v1.2.1: Set flag and update UI
            backgroundSummaryInProgress = true;
            await updateStatusPanel(); // Show "background work" indicator

            // Schedule work to happen AFTER this hook completes
            // This allows the editor to unblock first
            await api.v1.timers.setTimeout(async () => {
                try {
                    if (DEBUG_MODE) {
                        api.v1.log("Scheduled summary generation starting...");
                        api.v1.log(`   Editor isBlocked: ${await api.v1.editor.isBlocked()}`);
                    }

                    // NEW in v1.2.1: Extra check - if editor is blocked, wait for it
                    const isReady = await waitForEditorReady(5000); // 5 second timeout
                    if (!isReady) {
                        api.v1.log("⚠️ Editor still blocked after timeout, summary generation deferred");
                        return;
                    }

                    const freshSections = await api.v1.document.scan();
                    const previousChapter = await scanForPreviousChapter(freshSections);
                    await generateChapterSummary(previousChapter);

                } catch (error) {
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    api.v1.error("Error in scheduled summary generation:", errorMsg);
                } finally {
                    // NEW in v1.2.1: Always clear flag when done
                    backgroundSummaryInProgress = false;
                    await updateStatusPanel();
                }
            }, 1000); // 1 second delay - editor should unblock immediately after hook completes

            api.v1.log("Summary generation scheduled for 1s from now");
        } else {
            if (DEBUG_MODE)
                api.v1.log("Summary not needed (onResponse)");

            // Update status panel anyway
            await updateStatusPanel();
        }

        // v1.4.1: Check token budget after generation completes and handle condensation
        await api.v1.timers.setTimeout(async () => {
            try {
                await checkTokenBudgetAfterGeneration();
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                api.v1.error("Error checking token budget after generation:", errorMsg);
            }
        }, needsSummary ? 2000 : 500); // Wait for potential summary generation

        // v1.4.0: Trigger auto-detection whenever there are chapters with summaries
        // This catches changes to existing chapters even when continuing past the last chapter
        const chapters = fullText.split(new RegExp(`(?:^|\\n)\\s*${chapterBreakToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(?=\\n|$)`, 'gm'));
        const chapterBreakCount = chapters.length - 1;

        // Only run auto-detection if:
        // 1. There are existing chapters (breaks > 0)
        // 2. Auto-detect on generation is enabled
        // 3. At least one chapter has a fingerprint (something to compare against)
        if (chapterBreakCount > 0 && autoDetectOnGeneration) {
            const fingerprints: ChapterFingerprint[] = await api.v1.storyStorage.get("chapterFingerprints") || [];
            if (fingerprints.length > 0) {
                // Schedule auto-detection after hook completes
                const delay = needsSummary ? 3000 : 2000; // Longer delay if summary is generating
                await api.v1.timers.setTimeout(async () => {
                    if (DEBUG_MODE) {
                        api.v1.log(needsSummary ? "Running auto-detection after new chapter summary..." : "Running auto-detection after generation...");
                    }
                    await autoDetectChanges();
                }, delay);
            }
        }
    }
};

/**
 * Hook: Called when context is built
 * Logs chapter break detection for debugging
 */
const onContextBuiltHook: OnContextBuilt = async (params) => {
    const sections = await api.v1.document.scan();

    const recentSections = sections.slice(-3);
    const recentText = recentSections.map(s => s.section.text).join('\n');

    if (recentText.includes(chapterBreakToken)) {
        if (DEBUG_MODE)
            api.v1.log("Chapter break detected in user input - will process after generation completes");
    } else {
        if (DEBUG_MODE)
            api.v1.log("No chapter break in recent user input (onContextBuilt)");
    }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

(async () => {
    chapterBreakToken = await api.v1.config.get("chapter_break_token");
    lorebookCategoryName = await api.v1.config.get("lorebook_category");
    summarizeAllBreaks = await api.v1.config.get("summarize_scene_breaks");
    summaryMaxtokens = await api.v1.config.get("summary_max_tokens");
    promptString = await api.v1.config.get("summary_prompt_string");

    // Load token management config
    maxTotalSummaryTokens = await api.v1.config.get("max_total_summary_tokens");
    condensationThreshold = await api.v1.config.get("condensation_threshold");
    recentChaptersToKeep = await api.v1.config.get("recent_chapters_to_keep");
    chaptersPerCondensedGroup = await api.v1.config.get("chapters_per_condensed_group");

    maxRebuildBackups = await api.v1.config.get("max_rebuild_backups") || 3;

    // Load auto-detection config (v1.4.0)
    autoDetectOnGeneration = await api.v1.config.get("auto_detect_on_generation") || false;
    autoRegenerate = await api.v1.config.get("auto_regenerate") || false;

    // Load isFirstChapter from storage
    const storedFirstChapter = await api.v1.storyStorage.get("isFirstChapter");
    if (storedFirstChapter !== undefined) {
        isFirstChapter = storedFirstChapter;
    } else {
        // First time running in this story
        isFirstChapter = true;
        await api.v1.storyStorage.set("isFirstChapter", true);
    }

    if (DEBUG_MODE) {
        api.v1.log(`Config - Break Token: ${chapterBreakToken}`);
        api.v1.log(`Config - Lorebook Category: ${lorebookCategoryName}`);
        api.v1.log(`Config - Summarize All Breaks: ${summarizeAllBreaks}`);
        api.v1.log(`Config - Max Tokens: ${summaryMaxtokens}`);
        api.v1.log(`Config - Prompt: ${promptString.substring(0, 50)}...`);
        api.v1.log(`Config - Max Total Summary Tokens: ${maxTotalSummaryTokens}`);
        api.v1.log(`Config - Condensation Threshold: ${condensationThreshold}%`);
        api.v1.log(`Config - Recent Chapters To Keep: ${recentChaptersToKeep}`);
        api.v1.log(`Config - Chapters Per Group: ${chaptersPerCondensedGroup}`);
        api.v1.log(`Config - Auto-Detect On Generation: ${autoDetectOnGeneration}`);
        api.v1.log(`Config - Auto-Regenerate: ${autoRegenerate}`);
        api.v1.log(`State - isFirstChapter: ${isFirstChapter}`);
    }

    api.v1.log(`Automatic Chapter Summaries v${SCRIPT_VERSION} Initialized at: ${new Date().toLocaleString()}`);

    // Try to load category ID from storage first
    lorebookCategoryId = await api.v1.storyStorage.get("chapterSummaryCategoryId") || "";

    if (lorebookCategoryId) {
        if (DEBUG_MODE) {
            api.v1.log(`Loaded category ID from storage: ${lorebookCategoryId}`);
        }
    } else {
        // See if Lorebook category exists
        let catExists = await checkLorebookCategoryExists(lorebookCategoryName);

        if (!catExists) {
            api.v1.log("Category doesn't exist. Creating it.");
            await createChapterSummariesLorebookCategory(lorebookCategoryName);
        } else {
            // Category exists, find and store its ID
            const categories = await api.v1.lorebook.categories();
            const category = categories.find(cat => cat.name === lorebookCategoryName);
            if (category) {
                lorebookCategoryId = category.id;
                await api.v1.storyStorage.set("chapterSummaryCategoryId", lorebookCategoryId);
                if (DEBUG_MODE) {
                    api.v1.log(`Found and stored category ID: ${lorebookCategoryId}`);
                }
            }
        }
    }

    // Register UI Panel
    // Build panel content dynamically based on DEBUG_MODE
    const panelContent: UIPart[] = [
            {
                type: "text",
                id: "panel-title",
                text: `### Automatic Chapter Summaries v${SCRIPT_VERSION}\n\nManage chapter summary generation, token usage, condensation, and retroactive edits.`,
                markdown: true
            },
            {
                type: "box",
                content: [
                    {
                        type: "text",
                        id: "status-display",
                        text: "Loading status...",
                        markdown: true
                    }
                ],
                style: {
                    padding: "12px",
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    borderRadius: "4px",
                    marginBottom: "12px"
                }
            },
            // Changed chapters status box (dynamic content)
            {
                type: "box",
                id: "changed-chapters-box",
                content: [
                    {
                        type: "text",
                        text: "Loading...",
                        markdown: true
                    }
                ],
                style: {
                    padding: "12px",
                    backgroundColor: "rgba(64, 32, 0, 0.3)",
                    borderRadius: "4px",
                    marginBottom: "12px",
                    border: "1px solid rgba(255, 165, 0, 0.3)"
                }
            },
            // Changed chapters action buttons
            {
                type: "row",
                spacing: "start",
                content: [
                    {
                        type: "button",
                        text: "Check for Changed Chapters",
                        iconId: "search",
                        callback: async () => {
                            // v1.4.0: Reset generation counter when UI callback triggered
                            generationCounter = 0;
                            await detectAndShowChanges();
                        },
                        style: { marginRight: "8px" }
                    },
                    {
                        type: "button",
                        text: "Dismiss Notification",
                        iconId: "x",
                        callback: async () => {
                            // v1.4.0: Reset generation counter when UI callback triggered
                            generationCounter = 0;
                            await dismissAutoDetectionNotification();
                        },
                        style: { marginRight: "8px" }
                    }
                ]
            },
            {
                type: "row",
                spacing: "start",
                content: [
                    {
                        type: "button",
                        text: "Retry Failed Chapters",
                        iconId: "refresh",
                        callback: async () => {
                            // v1.4.0: Reset generation counter when UI callback triggered
                            generationCounter = 0;
                            await retryFailedChapters();
                        },
                        style: { marginRight: "8px" }
                    },
                    {
                        type: "button",
                        text: "Clear Failed Records",
                        iconId: "trash",
                        callback: async () => {
                            // v1.4.0: Reset generation counter when UI callback triggered
                            generationCounter = 0;
                            await clearAllFailures();
                        },
                        style: { marginRight: "8px" }
                    },
                    {
                        type: "button",
                        text: "Condense Now",
                        iconId: "zap",
                        callback: async () => {
                            // v1.4.0: Reset generation counter when UI callback triggered
                            generationCounter = 0;
                            await manualCondense();
                        }
                    }
                ]
            },
            {
                type: "container",
                style: {
                    borderTop: "2px solid rgba(255, 100, 100, 0.3)",
                    marginTop: "16px",
                    marginBottom: "12px"
                },
                content: [
                    {
                        type: "text",
                        text: "⚠️ **Advanced Operations:**",
                        markdown: true,
                        style: { marginBottom: "8px", fontSize: "1.1em" }
                    },
                    {
                        type: "button",
                        text: "Rebuild All Summaries",
                        iconId: "refresh",
                        callback: async () => {
                            // v1.4.0: Reset generation counter when UI callback triggered
                            generationCounter = 0;
                            await triggerRebuildPreview();
                        },
                        style: { marginBottom: "4px" }
                    },
                    {
                        type: "text",
                        text: "_Complete rescan of all chapter summaries. Use when chapter structure has changed (breaks added/removed)._",
                        markdown: true,
                        style: {
                            fontSize: "0.8em",
                            fontStyle: "italic",
                            color: "rgba(255, 255, 255, 0.6)"
                        }
                    }
                ]
            }
    ];

    // Add Testing & Debug section only if DEBUG_MODE is enabled
    if (DEBUG_MODE) {
        panelContent.push(
            {
                type: "container",
                style: {
                    borderTop: "2px solid rgba(100, 100, 255, 0.3)",
                    marginTop: "16px",
                    marginBottom: "12px"
                },
                content: [
                    {
                        type: "text",
                        text: "🧪 **Testing & Debug:**",
                        markdown: true,
                        style: { marginBottom: "8px", fontSize: "1.1em" }
                    },
                    {
                        type: "text",
                        text: "**Fingerprint Functions:**",
                        markdown: true,
                        style: { marginBottom: "4px", fontSize: "0.9em" }
                    },
                    {
                        type: "row",
                        spacing: "start",
                        content: [
                            {
                                type: "button",
                                text: "Refresh All Fingerprints",
                                iconId: "refresh",
                                callback: async () => {
                                    try {
                                        await api.v1.ui.updateParts([{
                                            id: "test-status",
                                            text: "Refreshing fingerprints..."
                                        }]);

                                        // Get current document
                                        const sections: DocumentSections = await api.v1.document.scan();
                                        const fullText = sections.map(s => s.section.text).join('\\n');
                                        const chapters: string[] = splitIntoChapters(fullText);

                                        // Get existing fingerprints to preserve chapter numbers
                                        const existingFps: ChapterFingerprint[] = await getChapterFingerprints();
                                        let updatedCount = 0;

                                        for (const fp of existingFps) {
                                            // Get current chapter text
                                            let chapterText: string;
                                            if (fp.chapterNumber === 1) {
                                                chapterText = chapters[0] || "";
                                            } else {
                                                const chapterIndex = fp.chapterNumber - 1;
                                                chapterText = chapters[chapterIndex] || "";
                                            }

                                            if (chapterText) {
                                                const newHash = hashString(chapterText);
                                                fp.textHash = newHash;
                                                fp.summaryCreatedAt = Date.now();
                                                // Preserve isCondensed flag
                                                updatedCount++;
                                            }
                                        }

                                        await api.v1.storyStorage.set("chapterFingerprints", existingFps);

                                        await api.v1.ui.updateParts([{
                                            id: "test-status",
                                            text: `✓ Refreshed ${updatedCount} fingerprints with current chapter hashes.\\n\\n⚠️ This resets detection - all chapters will appear unchanged until you edit them again.`
                                        }]);

                                        api.v1.log(`Refreshed ${updatedCount} fingerprints`);
                                    } catch (error) {
                                        const errorMsg = error instanceof Error ? error.message : String(error);
                                        await api.v1.ui.updateParts([{
                                            id: "test-status",
                                            text: `✗ Refresh failed: ${errorMsg}`
                                        }]);
                                    }
                                },
                                style: { marginRight: "8px" }
                            }
                        ]
                    },
                    {
                        type: "text",
                        text: "**Backup Functions:**",
                        markdown: true,
                        style: { marginBottom: "4px", marginTop: "12px", fontSize: "0.9em" }
                    },
                    {
                        type: "row",
                        spacing: "start",
                        content: [
                            {
                                type: "button",
                                text: "Create Test Backup",
                                iconId: "save",
                                callback: async () => {
                                    try {
                                        await api.v1.ui.updateParts([{
                                            id: "test-status",
                                            text: "Creating test backup..."
                                        }]);

                                        const backup = await createRebuildBackup("Manual test backup");

                                        await api.v1.ui.updateParts([{
                                            id: "test-status",
                                            text: `✓ Backup created!\n- Entries: ${backup.entries.length}\n- Fingerprints: ${backup.fingerprints.length}\n- Chapters: ${backup.chapterCount}`
                                        }]);

                                        api.v1.log("Test backup created:", backup);
                                    } catch (error) {
                                        const errorMsg = error instanceof Error ? error.message : String(error);
                                        await api.v1.ui.updateParts([{
                                            id: "test-status",
                                            text: `✗ Backup failed: ${errorMsg}`
                                        }]);
                                    }
                                },
                                style: { marginRight: "8px" }
                            },
                            {
                                type: "button",
                                text: "View Backups",
                                iconId: "list",
                                callback: async () => {
                                    try {
                                        // Call the full modal with restore functionality
                                        await showBackupModal();
                                    } catch (error) {
                                        const errorMsg = error instanceof Error ? error.message : String(error);
                                        await api.v1.ui.updateParts([{
                                            id: "test-status",
                                            text: `✗ Failed to show backups: ${errorMsg}`
                                        }]);
                                    }
                                }
                            }
                        ]
                    },
                    {
                        type: "text",
                        text: "**Category Management:**",
                        markdown: true,
                        style: { marginBottom: "4px", marginTop: "12px", fontSize: "0.9em" }
                    },
                    {
                        type: "row",
                        spacing: "start",
                        content: [
                            {
                                type: "button",
                                text: "Test Prepare",
                                iconId: "folder-plus",
                                callback: async () => {
                                    try {
                                        await api.v1.ui.updateParts([{
                                            id: "test-status",
                                            text: "Preparing categories..."
                                        }]);

                                        const result = await prepareRebuildCategories();

                                        await api.v1.ui.updateParts([{
                                            id: "test-status",
                                            text: `✓ Categories prepared!\n- Backup ID: ${result.backupCategoryId}\n- Rebuild ID: ${result.rebuildCategoryId}\n\n⚠️ Check your lorebook - you should see:\n- "${lorebookCategoryName} (Backup ...)"\n- "${lorebookCategoryName} (Rebuilding)"`
                                        }]);

                                        api.v1.log("Prepare result:", result);
                                    } catch (error) {
                                        const errorMsg = error instanceof Error ? error.message : String(error);
                                        await api.v1.ui.updateParts([{
                                            id: "test-status",
                                            text: `✗ Prepare failed: ${errorMsg}`
                                        }]);
                                    }
                                },
                                style: { marginRight: "8px" }
                            },
                            {
                                type: "button",
                                text: "Test Finalize",
                                iconId: "check",
                                callback: async () => {
                                    try {
                                        await api.v1.ui.updateParts([{
                                            id: "test-status",
                                            text: "Finalizing rebuild..."
                                        }]);

                                        // Get stored IDs
                                        const backupCategoryId = await api.v1.storyStorage.get("rebuildBackupCategoryId");
                                        const rebuildCategoryId = await api.v1.storyStorage.get("rebuildNewCategoryId");

                                        // Move entries from backup to rebuilding (for test purposes)
                                        if (backupCategoryId && rebuildCategoryId) {
                                            await moveEntriesToCategory(backupCategoryId, rebuildCategoryId);
                                        }

                                        await finalizeRebuildCategories();

                                        await api.v1.ui.updateParts([{
                                            id: "test-status",
                                            text: `✓ Finalize complete!\n\n⚠️ Check your lorebook:\n- Backup category should be DELETED\n- "${lorebookCategoryName}" should exist\n- It was the "Rebuilding" category`
                                        }]);

                                        api.v1.log("Finalize successful");
                                    } catch (error) {
                                        const errorMsg = error instanceof Error ? error.message : String(error);
                                        await api.v1.ui.updateParts([{
                                            id: "test-status",
                                            text: `✗ Finalize failed: ${errorMsg}`
                                        }]);
                                    }
                                },
                                style: { marginRight: "8px" }
                            },
                            {
                                type: "button",
                                text: "Test Rollback",
                                iconId: "x",
                                callback: async () => {
                                    try {
                                        await api.v1.ui.updateParts([{
                                            id: "test-status",
                                            text: "Rolling back..."
                                        }]);

                                        await rollbackRebuildCategories();

                                        await api.v1.ui.updateParts([{
                                            id: "test-status",
                                            text: `✓ Rollback complete!\n\n⚠️ Check your lorebook:\n- Rebuilding category should be DELETED\n- "${lorebookCategoryName}" should exist\n- It was the backup category`
                                        }]);

                                        api.v1.log("Rollback successful");
                                    } catch (error) {
                                        const errorMsg = error instanceof Error ? error.message : String(error);
                                        await api.v1.ui.updateParts([{
                                            id: "test-status",
                                            text: `✗ Rollback failed: ${errorMsg}`
                                        }]);
                                    }
                                }
                            }
                        ]
                    },
                    {
                        type: "text",
                        text: "_⚠️ Test Prepare first, then test either Finalize OR Rollback_",
                        markdown: true,
                        style: {
                            fontSize: "0.75em",
                            fontStyle: "italic",
                            color: "rgba(255, 200, 100, 0.8)",
                            marginTop: "4px"
                        }
                    }
                ]
            },
            {
                type: "text",
                id: "test-status",
                text: "",
                markdown: true,
                style: {
                    marginTop: "8px",
                    fontSize: "0.9em",
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap"
                }
            },
            {
                type: "text",
                text: "_Debug section - test backup and category management_",
                markdown: true,
                style: {
                    fontSize: "0.8em",
                    fontStyle: "italic",
                    color: "rgba(255, 255, 255, 0.6)",
                    marginTop: "4px"
                }
            },
            {
                type: "text",
                id: "test-status",
                text: "",
                markdown: true,
                style: {
                    marginTop: "8px",
                    fontSize: "0.9em",
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap"
                }
            }
        );
    }

    // Status messages (always visible)
    panelContent.push(
        {
            type: "text",
            id: "retry-status",
            text: "",
            style: {
                marginTop: "12px",
                fontStyle: "italic",
                color: "rgba(255, 255, 255, 0.7)"
            }
        },
        {
            type: "text",
            id: "condensation-status",
            text: "",
            style: {
                marginTop: "8px",
                fontStyle: "italic",
                color: "rgba(255, 255, 255, 0.7)"
            }
        },
        // Rebuild progress display
        {
            type: "text",
            id: "rebuild-progress",
            text: "",
            markdown: true,
            style: {
                marginTop: "12px",
                padding: "12px",
                backgroundColor: "rgba(0, 64, 128, 0.2)",
                borderRadius: "4px",
                borderLeft: "3px solid rgba(0, 128, 255, 0.6)",
                fontFamily: "monospace",
                fontSize: "0.9em",
                whiteSpace: "pre-wrap"
            }
        }
    );

    // Register UI Panel
    await api.v1.ui.register([{
        type: "scriptPanel",
        id: "chapter-summaries-panel",
        name: `Chapter Summaries v${SCRIPT_VERSION}`,
        iconId: "file-text",
        content: panelContent
    }]);

    // Update the status panel
    await updateStatusPanel();

    // Clear any leftover rebuild progress
    await api.v1.ui.updateParts([{
        id: "rebuild-progress",
        text: ""
    }]);

    // Register hooks
    api.v1.hooks.register('onResponse', onResponseHook);
    api.v1.hooks.register('onContextBuilt', onContextBuiltHook);
})();
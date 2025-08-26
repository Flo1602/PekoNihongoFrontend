export type SimilarityOptions = {
    /** Compare with case-sensitivity (default: false) */
    caseSensitive?: boolean;
    /** Ignore accents/diacritics like é → e (default: true) */
    ignoreAccents?: boolean;
    /** Trim leading/trailing whitespace (default: true) */
    trim?: boolean;
    /** Collapse internal whitespace runs to a single space (default: true) */
    collapseWhitespace?: boolean;
};

/**
 * Returns similarity between two strings as a percentage (0–100).
 * Similarity = (1 - LevenshteinDistance / maxLength) * 100
 */
export function stringSimilarityPercent(
    a: string,
    b: string,
    options: SimilarityOptions = {}
): number {
    const s1 = normalize(a, options);
    const s2 = normalize(b, options);

    if (s1 === s2) return 100;
    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 100;

    const dist = levenshtein(s1, s2);
    const pct = (1 - dist / maxLen) * 100;

    // Clamp and round to 2 decimals
    return Math.max(0, Math.min(100, Number(pct.toFixed(2))));
}

/** Space-optimized Levenshtein distance (O(min(m,n)) memory). */
function levenshtein(a: string, b: string): number {
    // Ensure b is the shorter string to minimize memory
    if (a.length < b.length) [a, b] = [b, a];

    const n = b.length;
    if (n === 0) return a.length;

    const dp = new Array<number>(n + 1);
    for (let j = 0; j <= n; j++) dp[j] = j;

    for (let i = 1; i <= a.length; i++) {
        let prev = dp[0];      // value from previous row, previous column
        dp[0] = i;
        for (let j = 1; j <= n; j++) {
            const temp = dp[j];  // keep old dp[j] before overwriting
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[j] = Math.min(
                dp[j] + 1,        // deletion
                dp[j - 1] + 1,    // insertion
                prev + cost       // substitution
            );
            prev = temp;
        }
    }
    return dp[n];
}

function normalize(s: string, opts: SimilarityOptions): string {
    const {
        caseSensitive = false,
        ignoreAccents = true,
        trim = true,
        collapseWhitespace = true,
    } = opts;

    let out = s ?? "";

    if (trim) out = out.trim();
    if (collapseWhitespace) out = out.replace(/\s+/g, " ");

    if (ignoreAccents) {
        // Strip combining diacritics
        out = out.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
    if (!caseSensitive) out = out.toLowerCase();

    return out;
}
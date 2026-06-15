//! Prompt Compressor and output-budget helpers.
//!
//! Compression is **local and deterministic** by default — no model call, no
//! data leaves the machine. It removes filler and repetition while preserving
//! the things that change an agent's behaviour: commands, file names,
//! constraints, acceptance criteria, must-not-do rules, and formatting
//! instructions. It never rewrites intent into something vaguer.

use serde::{Deserialize, Serialize};

/// Result of compressing a prompt. Token counts are local estimates and must be
/// labelled as estimates in any UI.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CompressionResult {
    pub original: String,
    pub compressed: String,
    pub original_tokens: usize,
    pub compressed_tokens: usize,
    /// Percentage reduction in estimated tokens (0–100).
    pub reduction_pct: f64,
    /// Estimates only; not exact tokenizer output.
    pub estimated: bool,
}

/// Rough local token estimate. Without a provider tokenizer we approximate using
/// the common ~4-characters-per-token heuristic, with a word-count floor so
/// short prompts are not under-counted. Always treated as an estimate.
pub fn estimate_tokens(text: &str) -> usize {
    let chars = text.chars().count();
    let words = text.split_whitespace().count();
    let by_chars = (chars as f64 / 4.0).ceil() as usize;
    by_chars.max(words)
}

/// Phrases that add no instruction value. Matched case-insensitively as whole
/// fragments and stripped. Order matters: longer phrases first.
const FILLER_PHRASES: &[&str] = &[
    "i would like you to",
    "i would like for you to",
    "i want you to please",
    "i was wondering if you could",
    "if you don't mind",
    "if you wouldn't mind",
    "as you may know",
    "as you know",
    "needless to say",
    "for what it's worth",
    "at the end of the day",
    "i think that",
    "i think",
    "i believe",
    "basically",
    "essentially",
    "literally",
    "honestly",
    "actually",
    "really",
    "very",
    "just",
    "kind of",
    "sort of",
    "please",
    "kindly",
    "thanks in advance",
    "thank you",
];

/// Words/markers that signal a line MUST be preserved verbatim.
const CONSTRAINT_MARKERS: &[&str] = &[
    "must",
    "must not",
    "do not",
    "don't",
    "never",
    "always",
    "only",
    "ensure",
    "require",
    "required",
    "acceptance",
    "constraint",
    "should not",
    "shall",
    "make sure",
    "keep",
    "preserve",
    "limit",
    "under",
    "at most",
    "no more than",
];

fn looks_like_command(line: &str) -> bool {
    let t = line.trim();
    t.starts_with('$')
        || t.starts_with("```")
        || t.contains("npm ")
        || t.contains("cargo ")
        || t.contains("git ")
        || t.contains("yarn ")
        || t.contains("pnpm ")
        || t.contains("pip ")
        || t.contains("python ")
        || t.contains("node ")
        || t.contains("./")
}

fn looks_like_path(token: &str) -> bool {
    // crude: contains a slash, or has a dotted file extension.
    token.contains('/')
        || (token.contains('.')
            && token
                .rsplit('.')
                .next()
                .map(|ext| {
                    (1..=5).contains(&ext.len()) && ext.chars().all(|c| c.is_ascii_alphanumeric())
                })
                .unwrap_or(false))
}

fn is_constraint_line(line: &str) -> bool {
    let lower = line.to_lowercase();
    CONSTRAINT_MARKERS.iter().any(|m| lower.contains(m))
}

/// Whether a line must be preserved verbatim (not filler-stripped).
fn must_preserve(line: &str) -> bool {
    looks_like_command(line)
        || is_constraint_line(line)
        || line.split_whitespace().any(looks_like_path)
}

/// Strip filler phrases from a fragment, collapsing the resulting whitespace.
fn strip_filler(text: &str) -> String {
    let mut lower = text.to_lowercase();
    let mut out = text.to_string();
    // Replace each filler phrase (case-insensitive) by matching on the lowercase
    // mirror and editing the original at the same byte offsets.
    for phrase in FILLER_PHRASES {
        while let Some(pos) = lower.find(phrase) {
            // Only strip on word boundaries to avoid butchering real words.
            let before_ok = pos == 0 || !lower.as_bytes()[pos - 1].is_ascii_alphanumeric();
            let after = pos + phrase.len();
            let after_ok = after >= lower.len() || !lower.as_bytes()[after].is_ascii_alphanumeric();
            if before_ok && after_ok {
                out.replace_range(pos..after, " ");
                lower.replace_range(pos..after, " ");
            } else {
                // Skip past this occurrence to avoid an infinite loop.
                let skip = pos + phrase.len();
                if skip >= lower.len() {
                    break;
                }
                lower.replace_range(pos..pos + 1, "\u{0}");
            }
        }
        lower = lower.replace('\u{0}', " ");
    }
    collapse_ws(&out)
}

/// Split a line into sentences on `.`, `!`, `?` followed by whitespace, keeping
/// the terminator. Avoids splitting inside obvious file paths/extensions.
fn split_sentences(line: &str) -> Vec<String> {
    let mut sentences: Vec<String> = Vec::new();
    let mut current = String::new();
    let chars: Vec<char> = line.chars().collect();
    for i in 0..chars.len() {
        let c = chars[i];
        current.push(c);
        if matches!(c, '.' | '!' | '?') {
            let next = chars.get(i + 1).copied();
            let prev = if i > 0 {
                chars.get(i - 1).copied()
            } else {
                None
            };
            // Sentence break only when followed by whitespace and not a decimal
            // or a file extension boundary (prev alphanumeric, next space).
            let is_break = matches!(next, Some(n) if n.is_whitespace())
                && prev.map(|p| !p.is_ascii_digit()).unwrap_or(true);
            if is_break {
                sentences.push(current.trim().to_string());
                current.clear();
            }
        }
    }
    if !current.trim().is_empty() {
        sentences.push(current.trim().to_string());
    }
    sentences.retain(|s| !s.is_empty());
    sentences
}

/// Normalized key for de-duplication: lowercase, trailing punctuation removed.
fn normalize_key(s: &str) -> String {
    s.to_lowercase()
        .trim_matches(|c: char| matches!(c, '.' | '!' | '?' | ',' | ' '))
        .to_string()
}

fn collapse_ws(text: &str) -> String {
    let collapsed = text.split_whitespace().collect::<Vec<_>>().join(" ");
    collapsed
        .replace(" ,", ",")
        .replace(" .", ".")
        .replace(" ;", ";")
        .replace("  ", " ")
        .trim()
        .to_string()
}

/// Compress a prompt deterministically.
pub fn compress(prompt: &str) -> CompressionResult {
    let original = prompt.to_string();
    let original_tokens = estimate_tokens(&original);

    // Work line by line so we can preserve structure (lists, code blocks).
    let mut seen_lines: Vec<String> = Vec::new();
    let mut seen_units: std::collections::HashSet<String> = std::collections::HashSet::new();
    let mut in_code_block = false;

    for raw_line in original.lines() {
        let line = raw_line.trim_end();
        let trimmed = line.trim();

        // Preserve fenced code blocks verbatim.
        if trimmed.starts_with("```") {
            in_code_block = !in_code_block;
            seen_lines.push(line.to_string());
            continue;
        }
        if in_code_block {
            seen_lines.push(line.to_string());
            continue;
        }

        if trimmed.is_empty() {
            // Collapse multiple blank lines into at most one.
            if seen_lines.last().map(|l| !l.is_empty()).unwrap_or(false) {
                seen_lines.push(String::new());
            }
            continue;
        }

        // List items and short lines are processed as a single unit; longer
        // prose lines are split into sentences so filler and duplicate
        // sentences can be removed while preserving constraint sentences.
        let is_list_item = trimmed.starts_with('-')
            || trimmed.starts_with('*')
            || trimmed
                .split_once(['.', ')'])
                .map(|(h, _)| !h.is_empty() && h.chars().all(|c| c.is_ascii_digit()))
                .unwrap_or(false);

        let units: Vec<String> = if is_list_item || split_sentences(line).len() <= 1 {
            vec![line.to_string()]
        } else {
            split_sentences(line)
        };

        let mut rebuilt: Vec<String> = Vec::new();
        for unit in units {
            let processed = if must_preserve(&unit) {
                unit.trim().to_string()
            } else {
                strip_filler(&unit)
            };
            if processed.is_empty() {
                continue;
            }
            // De-duplicate identical sentences/lines (common in pasted prompts).
            let key = normalize_key(&processed);
            if seen_units.contains(&key) {
                continue;
            }
            seen_units.insert(key);
            rebuilt.push(processed);
        }

        if !rebuilt.is_empty() {
            seen_lines.push(rebuilt.join(" "));
        }
    }

    // Trim trailing blank line.
    while seen_lines.last().map(|l| l.is_empty()).unwrap_or(false) {
        seen_lines.pop();
    }

    let compressed = seen_lines.join("\n").trim().to_string();
    let compressed_tokens = estimate_tokens(&compressed);
    let reduction_pct = if original_tokens == 0 {
        0.0
    } else {
        ((original_tokens.saturating_sub(compressed_tokens)) as f64 / original_tokens as f64
            * 100.0)
            .max(0.0)
    };

    CompressionResult {
        original,
        compressed,
        original_tokens,
        compressed_tokens,
        reduction_pct,
        estimated: true,
    }
}

/// Options for generating an output-budget instruction block.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default)]
pub struct OutputBudget {
    pub concise: bool,
    pub no_repeat_unchanged_code: bool,
    pub summarize_in_bullets: bool,
    pub only_show_changed_files: bool,
    pub no_full_files_unless_necessary: bool,
    pub ask_before_large_rewrites: bool,
    /// Optional soft target for output size, in tokens.
    pub target_tokens: Option<usize>,
}

impl OutputBudget {
    /// Render a prompt-guidance block. This is guidance, not enforcement — only
    /// providers/tools with hard output limits enforce a real cap.
    pub fn to_instruction_block(&self) -> String {
        let mut lines: Vec<String> = Vec::new();
        if self.concise {
            lines.push("- Be concise.".into());
        }
        if self.no_repeat_unchanged_code {
            lines.push("- Do not repeat code unless it changed.".into());
        }
        if self.summarize_in_bullets {
            lines.push("- Summarize changes in bullet points.".into());
        }
        if self.only_show_changed_files {
            lines.push("- Only show files that changed.".into());
        }
        if self.no_full_files_unless_necessary {
            lines.push("- Do not paste full files unless necessary.".into());
        }
        if self.ask_before_large_rewrites {
            lines.push("- Ask before doing large rewrites.".into());
        }
        if let Some(t) = self.target_tokens {
            lines.push(format!(
                "- Keep output under roughly {t} tokens (soft target)."
            ));
        }
        if lines.is_empty() {
            return String::new();
        }
        format!("Output requirements:\n{}", lines.join("\n"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn estimates_are_monotonic() {
        assert!(estimate_tokens("a much longer piece of text here") > estimate_tokens("short"));
    }

    #[test]
    fn removes_filler_but_keeps_intent() {
        let p = "I would like you to please basically just fix the bug.";
        let r = compress(p);
        assert!(r.compressed.to_lowercase().contains("fix the bug"));
        assert!(!r.compressed.to_lowercase().contains("basically"));
        assert!(!r.compressed.to_lowercase().contains("please"));
        assert!(r.compressed_tokens <= r.original_tokens);
    }

    #[test]
    fn preserves_constraints_and_commands_and_paths() {
        let p = "Please refactor.\nDo NOT rewrite the whole app.\nRun npm test.\nEdit src/auth/login.ts only.";
        let r = compress(p);
        assert!(r.compressed.contains("Do NOT rewrite the whole app."));
        assert!(r.compressed.contains("npm test"));
        assert!(r.compressed.contains("src/auth/login.ts"));
    }

    #[test]
    fn dedupes_repeated_lines() {
        let p = "fix the login bug\nfix the login bug\nfix the login bug";
        let r = compress(p);
        assert_eq!(r.compressed.lines().count(), 1);
    }

    #[test]
    fn output_budget_block_renders() {
        let b = OutputBudget {
            concise: true,
            summarize_in_bullets: true,
            target_tokens: Some(800),
            ..Default::default()
        };
        let block = b.to_instruction_block();
        assert!(block.contains("Be concise"));
        assert!(block.contains("800"));
    }

    #[test]
    fn empty_budget_is_empty() {
        assert!(OutputBudget::default().to_instruction_block().is_empty());
    }
}

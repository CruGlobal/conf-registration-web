  <!--
  USAGE: /review 

  You can also specify if the review is for a Senior or an Experienced engineer.
  /review senior
  /review experienced
  
  -->

## Step 1: Clarify Developer Experience Level

Before beginning the review, if the user hasn't specified $ARGUMENTS, ask:

"What experience level should I tailor this review for?

- **Senior**: Concise feedback, focus on
  architecture/performance
- **Experienced**: Detailed explanations with mentoring
  notes

## Step 2: Conduct Review

Dev experience level: $ARGUMENTS

Before the review, print exactly: Operating in review-only mode (with .ai-review.json exception).

MODE

- REVIEW ONLY of the current PR diff; do NOT modify existing files or stage/commit.
- Single exception: you MAY create ONE untracked file at repo root: `.ai-review.json`. Do not modify other files; do not stage/commit.

=== Stage 0 — Setup knowledge ===
First, read the .CLAUDE/CLAUDE.md file to understand project conventions, architecture, and coding standards.

Then use search tools to build context for reuse analysis:

- `Glob "app/scripts/hooks/*.ts"` - List custom hooks
- `Glob "app/scripts/services/**/*.js"` - Find services components
- `Glob "app/scripts/directives/**/*.js"` - Find directives components
- `Glob "app/scripts/controllers/**/*.js"` - Find controllers components
- `Read` key files that show up frequently in imports
- `Glob "app/scripts/utils/**/*.js"`
  - Find utility functions (especially couple/registration logic)
- `Grep "defaultTypeKey" --type js` - Find registration type logic
- `Grep "registrantTypes" --type js` - Find registration type usage
- Look for payment processing patterns in services

Note common patterns for later reuse identification in Stages 2-3.

Read .CLAUDE/CLAUDE.md to gather context for this repo.

Key business logic to validate:

- Couple/spouse relationship integrity (couples must have spouses, etc.)
- Registration type constraints and validation
- Payment flow correctness
- Conference/event state management

=== Stage 1 — File index (completeness gate) ===
First, determine the base branch and get the actual PR changes:

- `git branch --show-current` - Get current branch name
- `git merge-base HEAD main || git merge-base HEAD master` - Find base commit
- `git diff $(git merge-base HEAD main)..HEAD --name-only` - Get files changed in this branch
- `git diff $(git merge-base HEAD main)..HEAD` - Get the actual diff content

List EVERY file changed in this PR (relative path). For each file, include:

- Kind: {component | hook | util | helper | styled | test | other}
- Risk: {low|med|high}
- Why (1 sentence)

Do not skip any file. If any file can’t be read, state it and continue.

=== Stage 2 — Deep review (file-by-file) ===
IMPORTANT: Only review files that appear in the git diff from Stage 1. Do not review files that are not part of this PR.

**Issue Severity Guidelines:**

- **Must-fix**: Bugs, security issues, breaking changes, type errors, performance problems
- **Nice-to-have**: Style improvements, minor refactoring, better naming, documentation

For EACH changed file from Stage 1, in order:

- Must-fix: file:line → issue → fix (unified diff if trivial)
- Evidence (file:line-range quote)
- Impact (correctness/perf/clarity)
- Nice-to-have (same format)
- Suggested tests (anchor to this file’s code)
- Inline mentoring notes (only for Dev experience level: experienced)
- Quick patches (tiny unified diffs only; do not apply)

RULE: If no issues found for a file, state: “No issues found after deep check” AND explain the checks you ran.

=== Stage 3 — Reuse Sweep (repo-wide) ===
Search for reuse opportunities in the PR changes:

**Local Context Analysis:**
For each changed .js/.ts/.tsx file, search:

- Sibling files in the same directory for similar functions/components
- Parent directory files for shared utilities
- Nearby test files for common mock patterns or test utilities

**Duplication Detection:**

- Look for similar code patterns across changed files that could be consolidated
- Identify repeated logic that could be extracted to a shared location

For each reuse candidate found:

- Evidence: existing function/component location + where it applies in PR (file:line)
- Impact: consistency/maintainability/perf/bundle size
- Patch: minimal unified diff to adopt existing solution or create shared utility
- Consolidation opportunity: if creating new shared code, suggest location (src/lib/, src/hooks/, etc.)

=== Stage 4 — Pattern Sweep (regex-guided) ===
Search ONLY the files changed in this PR (from Stage 1 git diff) for these patterns; for each hit, either propose a fix or mark “N/A” with reason. Cite exact lines.

- Direct DOM manipulation instead of Angular directives
- Hardcoded registration type keys instead of constants
- Missing validation for couple/spouse relationships
- Unhandled payment states or error conditions
- Missing internationalization for user-facing strings

=== Human-readable review (print to chat) ===

**Summary** (3–7 bullets covering key findings)
**Architecture & Performance** (high-level concerns for senior devs)
**Must-Fix Issues** (critical problems that must be addressed)
**Reuse Opportunities** (existing utilities/components that could be used)
**Code Quality** (style, patterns, best practices)
**Testing Suggestions** (missing tests, test improvements)

=== Machine task: create `.ai-review.json` ===
Create a single new untracked file at repo root named `.ai-review.json`. Valid JSON only (no code fences). Include ALL findings as line-anchored comments (single- or multi-line). Anchor tests/mentoring/reuse items to the most relevant changed line.

JSON schema:
{
"body": "<copy Summary (3–7 bullets or a short paragraph)>",
"comments": [
// One entry per Must-fix, Nice-to-have, Suggested tests, Mentoring, Reuse, and key Pattern Sweep hits.
// Single-line:
{ "path": "<rel/path>", "line": <HEAD line>, "side": "RIGHT", "body": "[Must-fix] <Issue>. Evidence: <frag>. Impact: <why>. Fix: <one-liner>. [Category: <File | Reuse | Pattern>]" },

    // Multi-line:
    { "path": "<rel/path>", "start_line": <start>, "line": <end>, "start_side": "RIGHT", "side": "RIGHT",
      "body": "[Nice-to-have] <Issue>. Evidence: <frag(s)>. Impact: <why>. Suggestion: <concise change>. [Category: <File | Reuse | Pattern>]" }

]
}

JSON rules:

- Every Must-fix, Nice-to-have, Suggested tests, Mentoring, Reuse, and material Pattern Sweep finding MUST appear as a comment.
- Only use files and lines changed in this PR; pick a stable anchor line (e.g., function/const declaration).
- Prefer line/side (and start_line/start_side for ranges). Include a tiny diff in body when trivial.
- Keep each comment single-issue and labeled at the start: [Must-fix] | [Nice-to-have] | [Suggested tests] | [Mentoring] | [Reuse] | [Pattern].
- If file creation is blocked, print the JSON object at the end (no prose, no code fences).
- One issue per comment. 1–2 sentences. ≤ 220 characters.
- Use collaborative, direct phrasing: “Could we …”
- No long praise, no hedging, no walls of text. Be specific, actionable, kind.
- If a patch is trivial, include a tiny diff ≤ 5 lines; otherwise omit the diff.

Final step

- After creating `.ai-review.json`, print exactly: Created .ai-review.json (untracked).

=== Validation Step ===

After creating the `.ai-review.json`, validate that all line-anchored comments reference lines that actually exist in the PR changes:

1. Review each comment in the JSON that has a `line` field
2. Cross-reference with the actual git diff to ensure the line number corresponds to changed code
3. If any comment references a line that wasn't changed in this PR:
   - Remove the `line` and `side` fields to make it a file-level comment
   - Update the `body` to include the line number in the text (e.g., "Line 42: Issue description")
4. Ensure all comments have the required fields for GitHub's API:
   - `path` and `body` are always required
   - For line-specific comments: `line` and `side`
   - For file-level comments: only `path` and `body`

The goal is to ensure all review comments are properly anchored to actual changes in the PR diff.

# Global User Rules

- **Clean Code:** Always follow clean code and modularization principles.
- **Persistence:** Always save my ideas and pending plans in a file for later consultation and reminder (e.g., `PLANOS_PENDENTES.md`).
- **Optimization:** Save as much of the subscription plan quota as possible.
- **Environment Awareness:** Always consider development and production environments. Adjust configurations (routes, env variables, etc.) to work correctly in both.
- **Proactive Reporting:** Immediately report bugs that are hindering progress so I am aware of potential delays while you continue working.

---

# GEMINI.md - Antigravity Kit (Technical Protocol)

> This file defines how the AI behaves in this workspace.

---

## CRITICAL: AGENT & SKILL PROTOCOL

> **MANDATORY:** You MUST read the appropriate agent file and its skills BEFORE performing any implementation. This is the highest priority rule.

### 1. Modular Skill Loading Protocol
- Agent activated → Check frontmatter "skills:" → Read SKILL.md (INDEX) → Read specific sections.
- **Rule Priority:** P0 (GEMINI.md) > P1 (Agent .md) > P2 (SKILL.md). All rules are binding.

### 2. Enforcement Protocol
1. **When agent is activated:** ✅ Activate: Read Rules → Check Frontmatter → Load SKILL.md → Apply All.
2. **Forbidden:** Never skip reading agent rules or skill instructions. "Read → Understand → Apply" is mandatory.

---

## 📥 REQUEST CLASSIFIER

| Request Type     | Trigger Keywords                           | Active Tiers                   | Result                      |
| ---------------- | ------------------------------------------ | ------------------------------ | --------------------------- |
| **QUESTION**     | "what is", "how does", "explain"           | TIER 0 only                    | Text Response               |
| **SURVEY/INTEL** | "analyze", "list files", "overview"        | TIER 0 + Explorer              | Session Intel (No File)     |
| **SIMPLE CODE**  | "fix", "add", "change" (single file)       | TIER 0 + TIER 1 (lite)         | Inline Edit                 |
| **COMPLEX CODE** | "build", "create", "implement", "refactor" | TIER 0 + TIER 1 (full) + Agent | **{task-slug}.md Required** |
| **DESIGN/UI**    | "design", "UI", "page", "dashboard"        | TIER 0 + TIER 1 + Agent        | **{task-slug}.md Required** |

---

## 🛑 GLOBAL SOCRATIC GATE (TIER 0)

**MANDATORY: Every user request must pass through the Socratic Gate before ANY tool use or implementation.**

1. **Never Assume:** If even 1% is unclear, ASK.
2. **Handle Spec-heavy Requests:** Even if answers are given, ask about **Trade-offs** or **Edge Cases**.
3. **Wait:** Do NOT write code until the user clears the Gate.

---

## TIER 0: UNIVERSAL RULES

### 🧹 Clean Code (Global Mandatory)
- **Code:** Concise, direct, no over-engineering. Self-documenting.
- **Testing:** Mandatory. Pyramid (Unit > Int > E2E) + AAA Pattern.
- **Infra/Safety:** 5-Phase Deployment. Verify secrets security.

### 📁 File Dependency Awareness
**Before modifying ANY file:**
1. Check `CODEBASE.md` → File Dependencies.
2. Identify dependent files and update ALL affected files together.

---

## TIER 1: CODE RULES

### 📱 Project Type Routing
- **MOBILE:** `mobile-developer`
- **WEB:** `frontend-specialist`
- **BACKEND:** `backend-specialist`

### 🏁 Final Checklist Protocol
**Trigger:** "final checks", "çalıştır tüm testleri", etc.
**Order:** 1. Security → 2. Lint → 3. Schema → 4. Tests → 5. UX → 6. Seo → 7. Lighthouse/E2E.

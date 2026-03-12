---
trigger: always_on
---

# GEMINI.md - Antigravity Kit

> This file defines how the AI behaves in this workspace.

---

## CRITICAL: AGENT & SKILL PROTOCOL (START HERE)

> **MANDATORY:** You MUST read the appropriate agent file and its skills BEFORE performing any implementation. This is the highest priority rule.

### 1. Modular Skill Loading Protocol

Agent activated → Check frontmatter "skills:" → Read SKILL.md (INDEX) → Read specific sections.

- **Selective Reading:** DO NOT read ALL files in a skill folder. Read `SKILL.md` first, then only read sections matching the user's request.
- **Rule Priority:** P0 (GEMINI.md) > P1 (Agent .md) > P2 (SKILL.md). All rules are binding.

### 2. Enforcement Protocol

1. **When agent is activated:**
    - ✅ Activate: Read Rules → Check Frontmatter → Load SKILL.md → Apply All.
2. **Forbidden:** Never skip reading agent rules or skill instructions. "Read → Understand → Apply" is mandatory.

---

## 📥 REQUEST CLASSIFIER (STEP 1)

**Before ANY action, classify the request:**

| Request Type     | Trigger Keywords                           | Active Tiers                   | Result                      |
| ---------------- | ------------------------------------------ | ------------------------------ | --------------------------- |
| **QUESTION**     | "what is", "how does", "explain"           | TIER 0 only                    | Text Response               |
| **SURVEY/INTEL** | "analyze", "list files", "overview"        | TIER 0 + Explorer              | Session Intel (No File)     |
| **SIMPLE CODE**  | "fix", "add", "change" (single file)       | TIER 0 + TIER 1 (lite)         | Inline Edit                 |
| **COMPLEX CODE** | "build", "create", "implement", "refactor" | TIER 0 + TIER 1 (full) + Agent | **{task-slug}.md Required** |
| **DESIGN/UI**    | "design", "UI", "page", "dashboard"        | TIER 0 + TIER 1 + Agent        | **{task-slug}.md Required** |

---

## TIER 0: UNIVERSAL RULES (Always Active)

### 🧹 Clean Code (Global Mandatory)

**ALL code MUST follow `@[skills/clean-code]` rules. No exceptions.**

- **Code**: Concise, direct, no over-engineering. Self-documenting.
- **Modularização**: 
    - Evite arquivos monolíticos. Quebre componentes em sub-componentes ou hooks.
    - Novas funcionalidades devem ter sua própria pasta ou service dedicado.
- **Performance**: Measure first. Adhere to 2025 standards (Core Web Vitals).

### 📁 File Dependency Awareness

**Before modifying ANY file:**

1. Check `CODEBASE.md` → File Dependencies
2. Identify dependent files
3. Update ALL affected files together

### 🧠 Multi-Agent Context Maintenance

> **REGRA DE OURO**: Manter a continuidade absoluta entre sessões e diferentes modelos de IA.

- **Task Files (Source of Truth)**: O arquivo `task.md` no diretório de brain é a verdade única sobre o que foi feito e o que falta.
- **Registros de Contexto**: Registre decisões, blockers e arquitetura no `implementation_plan.md` e `walkthrough.md`.
- **Interoperabilidade**: Outra IA deve ser capaz de ler os artefatos da pasta `brain` e continuar o trabalho perfeitamente.

---

## TIER 1: CODE RULES (When Writing Code)

### 📱 Project Type Routing

| Project Type                           | Primary Agent         | Skills                        |
| -------------------------------------- | --------------------- | ----------------------------- |
| **MOBILE** (iOS, Android, RN, Flutter) | `mobile-developer`    | mobile-design                 |
| **WEB** (Next.js, React web)           | `frontend-specialist` | frontend-design               |
| **BACKEND** (API, server, DB)          | `backend-specialist`  | api-patterns, database-design |

---

## 🚀 VERCEL & DEPLOYMENT PROTOCOL

Protocolo para bugs de produção (localhost OK vs Nuvem NOK):

1. **Logs**: Sempre analise os logs de Build e Runtime da Vercel primeiro.
2. **Setup Check**: Verifique `vercel.json` e scripts no `package.json`.
3. **Case-Sensitivity**: Verifique discrepâncias de nomes de arquivos Windows/Linux nas importações.

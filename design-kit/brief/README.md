# Living Miniature — Wedding Website Design & Build Kit

This package is a handoff brief for an AI coding model (for example, an Opus-class coding model) to design and implement a premium, mobile-first Indian wedding website.

## What is included
- `docs/MASTER_REQUIREMENTS.md` — source of truth for the experience, design, interactions, responsive behavior, accessibility, performance, and acceptance criteria.
- `docs/USER_FLOW_AND_STORY.md` — cinematic scroll narrative and interaction map.
- `docs/ASSET_SPECIFICATION.md` — asset inventory, recommended formats, performance budgets, and art direction.
- `docs/IMPLEMENTATION_PLAN.md` — phased build plan and guardrails for the coding agent.
- `data/site-content.example.json` — placeholder-only bilingual content model.
- `planning/DESIGN_TOKENS.md` — palette, type, spacing, motion, and layout tokens.
- `assets/reference-concepts/` — generated concept-board images for visual direction only.
- `assets/prompts/ASSET_GENERATION_PROMPTS.md` — prompts for producing individual production assets.
- `AGENTS.md` — instructions for the coding agent.

## Important
The reference concept boards are **visual inspiration, not production-ready site assets**. Text inside generated images may be inaccurate; do not crop their text and use it as final UI copy. Recreate typography and UI in HTML/CSS. Generate or source individual environment assets based on the asset specification.

All couple names, dates, event names, addresses, and contact details are placeholders. Do not infer or invent real details. Keep the full family names and detailed rituals in a separate invitation-card view or downloadable invitation, not on the main cinematic journey.

## How to use
1. Extract this ZIP into the project folder or open it beside the project.
2. Give the coding model `AGENTS.md` and `docs/MASTER_REQUIREMENTS.md` first.
3. Ask it to follow `docs/IMPLEMENTATION_PLAN.md` one milestone at a time.
4. Require it to run the project and verify each milestone before proceeding.
5. Replace placeholder content only after the layout and interactions work.

## Preferred technical direction
Astro for static-first delivery; use a small, intentional interactive island for the 3D environment. Three.js / React Three Fiber may be used for the miniature environment, with GSAP ScrollTrigger for scroll choreography. Do not add React or a 3D renderer to every page section. Choose compatible current package versions and document the choice.

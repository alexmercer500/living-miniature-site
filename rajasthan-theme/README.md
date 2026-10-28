# Rajasthan Wedding Route Redesign Pack

## Goal
Extend the existing wedding website with two new shareable theme routes while preserving the current nature-themed site on its current main route.

- **Existing main route (`/`)**: keep the current nature theme unchanged.
- **New Theme 2 route**: **Amber Fort Romance** — regal, warm, dramatic Rajasthan-inspired fort views.
- **New Theme 5 route**: **Lake City Elegance** — serene lake, illuminated heritage palace, sunset/blue-hour reflections.

The two new routes share the existing wedding data, bilingual support, functional interactions, animations, and transition patterns. The primary change is the visual asset system and theme-specific scene composition, not the application architecture.

## Start here
1. Read `prompts/IMPLEMENTATION_PROMPT.md` fully.
2. Review `references/approved-theme-2-and-5-layout.png` as the primary design reference.
3. Review `references/original-five-theme-showcase.png` for the original theme selection context.
4. Give the implementation prompt to your IDE LLM (Codex is fine).
5. Tell the LLM to audit first and implement in milestones; do not ask it to replace the whole site in one pass.

## Asset status
The included images are **visual references**, not separate production assets or 3D models. The `assets/` folders include per-asset generation prompts and a manifest explaining the exact outputs to generate. Do not treat the entire reference board as a page background or slice tiny composite-board elements and call them production assets. Generate the hero backgrounds and transparent objects individually using the prompts in `assets/ASSET_PROMPTS.md`.

## Route mapping
The exact route names should be confirmed against the existing project before coding. Suggested defaults:
- `/` — current nature theme, unchanged
- `/amber-fort/` — Theme 2, Amber Fort Romance
- `/lake-city/` — Theme 5, Lake City Elegance

If the existing route convention or project requirements suggest a better pattern, preserve current routes and explain the proposed alternatives before implementation.

## Asset generation priority
1. Amber Fort desktop and mobile hero backgrounds.
2. Lake City desktop and mobile hero backgrounds.
3. Transparent decorative assets and invitation objects.
4. Individual scene backgrounds for story, celebrations, venue, and closing.
5. Optional GLB models for true 3D interactions.

The animation and interaction system should be reused from the existing site. Do not rebuild animations from scratch unless a specific incompatibility is identified.

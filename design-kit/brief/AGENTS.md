# Coding Agent Instructions

You are building a polished, mobile-first, cinematic Indian wedding website from the attached requirements. Treat `docs/MASTER_REQUIREMENTS.md` as the source of truth.

## Non-negotiable working rules
1. Read all files in `docs/` and `planning/` before implementation.
2. Start by inspecting the existing repository. Do not overwrite an existing project blindly.
3. Implement in milestones. Do not build every scene in one giant pass.
4. Use only placeholder names and values from `data/site-content.example.json`; never invent personal data.
5. The main experience is visual-first and sparse. Detailed family names and rituals belong in the separate invitation card only.
6. Recreate text, buttons, and interface in HTML/CSS. Never use generated images as screenshots containing UI text.
7. Make mobile the primary target. Test narrow widths and touch input before polishing desktop.
8. Keep JavaScript and 3D loading intentional. Astro should render the content shell statically; hydrate only the interactive experience that needs it.
9. Every interactive object must work with mouse, touch, and keyboard where practical. Do not make the page depend on hover.
10. Provide a skip-intro / skip-animation path, reduced-motion mode, and accessible non-3D fallback.
11. Do not autoplay audio. If ambient music is added, it must be opt-in and have a visible mute control.
12. Do not claim a milestone is complete unless the app runs and its behavior has been verified.

## Required first deliverable
Before writing the full site, create a short implementation plan and a minimal working landing scene. Confirm the dev server runs, the language toggle works, the first screen is responsive, and the next scene can be reached without a 3D asset.

## Preferred stack
- Astro for page rendering and static content.
- TypeScript.
- React only where needed for a React Three Fiber island.
- Three.js / React Three Fiber for interactive 3D, if the asset and performance budget justifies it.
- GSAP + ScrollTrigger for scroll-linked storytelling.
- CSS for simple transitions and interface animation.
- Use an icon package only if needed; avoid a large general-purpose UI library.

If any library combination has compatibility concerns, verify the current Astro integration requirements before installing dependencies and explain the decision briefly.

# Motion Studies

Four independently accessible motion experiments. This repository is separate from the portfolio; there are no portfolio navigation links to these experiments.

- Prism: a draggable, dispersive glass cube, implemented from MotionSites' free Design World prompt. The vendor prompt itself is not redistributed.
- Aurora: an original adaptation of the Aurora and Circular Gallery interaction concepts showcased by React Bits.
- Tactile: an original instrument panel inspired by Uiverse's animated 3D buttons, switches and loaders.
- Depth: an original scroll-driven spatial interface inspired by Aceternity's Container Scroll Animation and 3D Card Effect.

All visuals are procedural. No third-party template or component source is redistributed. Three.js is pinned at r169 and bundled locally.

The frontend-design skill guided four intentionally different palettes and compositions: monochrome refraction, atmospheric green, tactile warm neutrals, and cool spatial layers. The prototype does not modify or import any private Space content.

## Run

`npm ci`, `npm run check`, `npm run build`, `npm run dev`.

## Acceptance

This is an exploratory visual prototype, so a red test against a nonexistent UI would add little evidence. Verify the actual result: all five entry points load, navigation works at the project base path, no horizontal overflow at narrow widths, controls change the animation, touch/keyboard alternatives work, pause stops idle motion, reduced-motion defaults to paused, and WebGL failure leaves readable content and a fallback.

Short-viewport regression scenario: at 1280 × 720 and 1280 × 600 CSS pixels, open Depth, click “Explode view”, and confirm “Assemble view” is pressed and its bounding box stays inside the viewport. The sticky scene must shrink its artwork, not force a minimum page height. Both sizes were verified in the browser; all five pages were also checked at 320 CSS pixels wide without horizontal overflow. Reduced-motion and WebGL fallback branches were inspected in code; a physical mobile device and disabled-GPU environment were not tested.

## References

- https://motionsites.ai/
- https://reactbits.dev/backgrounds/aurora
- https://reactbits.dev/components/circular-gallery
- https://uiverse.io/ui/3d-buttons
- https://ui.aceternity.com/components/container-scroll-animation
- https://ui.aceternity.com/components/3d-card-effect

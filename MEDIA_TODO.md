# Media to-do

The site is complete with the owner's existing imagery (see `docs/MEDIA.md`). These assets would raise it further or replace concept imagery with the real thing. Nothing below has been generated or sourced yet.

## How to add or replace an image

1. Put the master (PNG/TIFF/JPG, largest available) in `assets/source/` with a descriptive name. Keep `-concept` in the name for generated images.
2. Add or edit a job in `scripts/build-media.mjs` (optional `extract` crop), then run `pnpm media`.
3. Point the matching entry in `src/content/media.ts` at the new file and update `alt`, `disclosure` and `origin`. Use `provenance: 'authentic'` only for consented, approved business photography, and change the disclosure text accordingly.
4. Record origin, date, rights/consent in `docs/MEDIA.md`. Run `pnpm check && pnpm test`.

## Owner-supplied (authentic, cannot be generated)

| Need                                                                                                      | Why                                                                                                                                                                | Where it goes                     |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| Official on-dark logo and/or a horizontal lockup from the brand's designer                                | The site uses a derived on-dark variant (dark tones lifted). An official version would replace it, and a horizontal lockup would read better at small header sizes | Header, menu, footer, share image |
| Approved icon/monogram                                                                                    | No favicon is set: cropping the emblem out of the logo would invent a sub-mark                                                                                     | `src/app/icon.png`                |
| Salon premises, chair and team photographs (with consent)                                                 | Story chapter and `/story` are typographic until real photos exist                                                                                                 | Story, `/story`, `/services`      |
| Real training photographs (hands at work, mannequin practice, wig construction), with participant consent | Replaces the generated Academy craft concept                                                                                                                       | Academy feature, `/academy`       |
| Photographs of actual catalogue products                                                                  | Replaces product concepts once the catalogue exists                                                                                                                | Hair Edit, `/shop`                |
| Higher-resolution masters (≥ 2400 px long edge) of the current campaign set, if available                 | Current masters are 1024–1536 px                                                                                                                                   | Hero, Let it flow, campaign       |

## Generation briefs (campaign concepts; label as generated when used)

Shared constraints for every prompt: photorealistic editorial photograph; adult Black/West African subjects with natural skin texture; physically realistic hair and individual strands; rich ink-black and deep wine palette with restrained warm light; no text, logos, watermarks, collage or extra people; no salon interior, classroom or premises; not a real Naplin client, employee, student or product. Review every output at 100% for hands, hairline, teeth, ears and jewellery artefacts.

1. **`hero-hair-motion-wide`** — 16:9, ≥ 3000 px wide. A confident West African woman turning toward camera from the right third of the frame, long glossy black body-wave hair sweeping left through the air in a natural arc, deep wine-to-black seamless background, soft directional key light from the right with warm rim light on the hair, generous dark negative space across the left half for a headline. Also export a version with a transparent background (clean hair edges) for the WebGL hero.
2. **`macro-movement`** — 4:5. Extreme close-up of long dark body-wave hair in motion, strands separating at the ends, warm edge light against a dark burgundy-black background, shallow depth of field. No face.
3. **`macro-finish`** — 4:5. Extreme close-up of sleek, freshly finished straight black hair with a precise centre part, natural shine (not plastic), dark ink background. No face.
4. **`collection-closure`** — 4:5. A ready-to-wear sleek straight closure wig on a matte dark display head and minimal stand, warm ivory seamless backdrop, soft studio light, clear closure parting, product only, no person. Distinct from the frontal-wig study.
5. **`collection-frontal-hd`** — 4:5, ≥ 2000 px tall. Long body-wave frontal wig on a dark display head above a stone plinth, ivory backdrop, clean natural-looking hairline, product only.
6. **`salon-craft`** — 3:2. Close-up of two professional hands finishing a sleek high ponytail on dark hair, comb and hair tie visible, warm low-key light, dark background, no faces, no salon interior.
7. **`salon-retouch`** — 4:5. Close-up of hands applying treatment at the root with a tint brush on sectioned dark hair, protective gloves, warm low-key light, no faces, no premises.
8. **`salon-pedicure`** — 4:5. Elegant still of a woman's feet with fresh deep-wine nail polish resting on ivory linen, soft warm side light, minimal and editorial, no face, no premises.
9. **`academy-wig-making`** — 4:5. Close-up of a Black beautician's hands ventilating/constructing a wig on a mannequin head mounted on a stand, needle and lace visible, warm practical light, dark background, face out of frame. Not a classroom.
10. **`confidence-campaign-wide`** (optional) — 16:9. Striking portrait of a Black woman with elegant dark hair and natural skin texture against deep crimson-wine, strong direct gaze, sophisticated negative space on both sides.

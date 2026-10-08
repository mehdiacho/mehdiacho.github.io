# Illustration brief — mehdiacho.tech

What to hand to an image model, one entry per drawing. The SVGs currently in
`components/Drawings.tsx` are placeholders I drew by hand; they are correct in
placement and size, so a replacement only has to match the slot and the house
style below. Drop a new file in and swap the export — nothing else moves.

---

## House style (applies to every drawing)

Say this in every prompt, or the set will not hang together.

- **Line drawing only.** One stroke weight throughout, no fills, no shading, no
  gradients, no texture, no drop shadows.
- **Monochrome, inherited.** Draw everything in a single colour and let the page
  recolour it. In SVG that means `stroke="currentColor"` and `fill="none"` on
  every path — never a hard-coded hex. The one exception is a deliberate accent,
  which should be the only thing on its own layer.
- **Stroke weight 1.5–2 units** in the stated viewBox. Round caps, round joins.
- **Technical-drawing idiom, not clip art.** Think an engineer's hand on graph
  paper: construction lines, centre lines, leader lines, dimension arrows,
  corner tags, hatching where a section is cut. Slightly imperfect is good.
  Perfectly symmetrical and smooth is not.
- **Perspective:** flat orthographic or light isometric. No vanishing points, no
  dramatic camera.
- **No text** unless the entry explicitly asks for it. Where text is asked for it
  is a short number or a single letter, set in a monospace face.
- **Transparent background.** No frame, no border, no card behind the drawing.
- **Output:** SVG, optimised, with a `viewBox` exactly as stated and no
  `width`/`height` attributes. Paths only — no embedded raster, no `<image>`.

Palette, for the rare accent: ink `#15181c`, blue `#11508f`, red `#bf3b2b`,
acid `#c8ff2e` (acid only ever appears on a solid ink ground).

---

## 1. Hero drawing — `CaliperMeasuring`

- **viewBox** `0 0 440 300`, lands about 430 px wide on desktop, full width on a phone.
- **Where** top right of the page, beside the headline. The largest and most
  looked-at drawing on the site, so it carries the most detail.

> A pair of vernier calipers measuring a small moulded plastic bracket, drawn
> flat-on as a technical illustration. The caliper beam runs horizontally across
> the upper third with its graduation ticks and a sliding jaw; the jaws close on
> the left edge of the bracket below. The bracket is a rounded rectangular body
> with two bolt holes drawn as concentric circles, a step on one side and a small
> hooked arm projecting from the other. Underneath, a dimension line with arrow
> heads at both ends and short extension lines rising to the part, labelled
> `48.60` in monospace. One corner of the bracket is tagged with a leader line
> and the letter `A`. Construction lines are dashed and thinner than the object
> lines.

## 2–5. Process marks — `StepMeasure`, `StepDraw`, `StepModel`, `StepPrint`

- **viewBox** `0 0 96 96` each, rendered at 56 px inside a solid ink band, so
  they appear in **acid green on near-black**. They must read at 56 px: three or
  four shapes maximum, nothing finer than the stroke weight.
- **Where** the four-step strip under the hero.

> **Measure** — a caliper head on its own, jaws open around a small block, the
> graduated scale visible. Nothing else in frame.
>
> **Draw** — a drawing sheet seen flat: a border, one solid rectangle, one dashed
> rectangle beside it, and a dimension line with end ticks beneath them.
>
> **Model** — a wireframe cube in light isometric with its hidden edges dashed
> and a small origin cross at the near corner.
>
> **Print** — a 3D printer nozzle above a build plate, laying a single bead; two
> or three deposited layers visible as stacked lines underneath it.

## 6–8. Service marks — `MarkCad`, `MarkWeb`, `MarkLearning`

- **viewBox** `0 0 72 72` each, rendered at 56 px in blue on paper, at the top of
  the three service cards. Same weight and silhouette density across all three —
  they sit side by side and any mismatch shows.

> **CAD** — a bracket in three-quarter view with a section cut through it, the
> cut face hatched at 45°, and one radius called out with a leader line.
>
> **Web** — a browser window drawn as a plain rectangle with a title bar, and
> inside it a layout skeleton: one wide block, two columns under it. A small
> magnifier overlapping the lower right corner, to say "findable".
>
> **Machine learning** — a small graph of five or six nodes joined by edges, drawn
> as circles and straight lines, with three of the nodes slightly larger. Not a
> brain, not a chip, not a robot.

## 9. Visualisation — `IsometricDesk`

- **viewBox** `0 0 320 220`, about 300 px wide, beside the Desk Twin text.
- **This one is not decorative** — it carries `role="img"` and an alt
  description, so it has to actually depict the thing.

> A desk and its surroundings in light isometric line drawing: a rectangular desk
> top on four legs, a monitor on a stand, a keyboard, a chair pushed partway in,
> and a shelf unit against the wall behind. Dimension lines run along the floor
> edge and up the wall with arrow heads, labelled with short numbers in monospace
> (`1420`, `740`). The floor is suggested by a faint square grid that fades out
> toward the edges. Everything is drawn as if measured, not as if photographed.

## 10. `Crosshair`

- **viewBox** `0 0 120 120`, rendered at 40 px, beside the "working from
  Gaborone" line.

> A surveyor's registration mark: a circle with a cross through it extending past
> the circumference, a second smaller concentric circle, and four short tick
> marks at the diagonals.

## 11. `SectionRule`

- **viewBox** `0 0 1200 16`, stretched to full width with
  `preserveAspectRatio="none"`, so **avoid circles and diagonals** — they will
  distort. Horizontal and vertical lines only.

> A full-width dimension rule: one long horizontal line with a vertical end tick
> at each extreme, and evenly spaced minor ticks dropping below it, like the edge
> of a ruler.

---

## Things worth adding that do not exist yet

Slots I would use if the drawings existed. Nothing in the code references these
yet, so they can be added in any order.

1. **An exploded view of the charger brace** — the two printed halves pulled
   apart along the split line with dashed assembly axes running between them,
   and the plug barrel floating in the cavity. Would sit in the 3D section above
   the gallery. `0 0 520 320`.
2. **A print bed with failures on it** — three attempts at the same part, two of
   them visibly wrong (warped corner, separated layers), one correct. Honest
   about the process and nobody else has it. Goes beside the flip-key caption.
   `0 0 440 240`.
3. **A portrait mark for the header** — not a photograph and not a face. His
   initials or a monogram built from drawing furniture: an `M` constructed out of
   dimension lines and end ticks. `0 0 64 64`, must read at 24 px.
4. **A Botswana locator** — the country outline with a single crosshair on
   Gaborone and a radius circle around it. For the local-SEO line and for the
   service pages. `0 0 240 200`, outline accurate.
5. **A stack of the four process steps as one drawing** — for the service pages,
   which currently have no illustration at all and are the pages Google is being
   pointed at. `0 0 900 220`, horizontal.

---

## How to drop a replacement in

1. Save the SVG under `public/drawings/<name>.svg` **or** paste the paths into
   the matching export in `components/Drawings.tsx`.
2. Inline is preferred for anything above the fold — it costs no request and it
   inherits `currentColor`, which is how the process marks turn acid on ink.
3. Keep `aria-hidden="true"` on everything except `IsometricDesk`. A decorative
   drawing that announces itself is worse than no drawing.
4. `npm run build`, then check the section at 375 px wide before pushing.

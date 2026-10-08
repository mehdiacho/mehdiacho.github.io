# portfolio-3d

Stills and models for the **3D & CAD Modeling** section on the site. Everything
in this folder is published as-is at `https://mehdiacho.tech/portfolio-3d/<file>`,
so only put things here that are meant to be public.

## Adding a piece of work

1. Drop the file in here. Lowercase, hyphenated, no spaces — the name ends up in
   a URL. Stills as `.png` or `.jpg`; models as `.glb` (not `.stl`, the viewer
   cannot read it).
2. Add an entry to `WORKS_3D` in [`constants.ts`](../../constants.ts):

   ```ts
   {
     id: "M03",
     title: "VERTICAL_LAPTOP_STAND",
     caption: "One sentence on what it is and why it was made.",
     image: "/portfolio-3d/laptop-stand.png",
     alt:   "What the picture actually shows, for someone who cannot see it.",
     model: "/portfolio-3d/laptop-stand.glb",   // optional
     specs: ["Black PETG", "Ender-3 V3 SE"],    // optional
     status: "wip"                              // live | wip | concept
   }
   ```

3. `alt` is not optional and is not generated. Describe the *picture* — the views,
   the orientation, what is visible — not the part's name, which the title and
   caption already give.

`status` reads on the card as **PRINTED** / **MODELLED** / **DRAWN**.

## What happens if the two disagree

An entry whose `image` 404s is dropped from the grid at runtime rather than
shown as a broken image, and if that empties the list the whole section removes
itself. So a half-finished drop never ships a broken page — but it also fails
quietly, so check the section is still there after renaming anything.

## Models

`model` is optional. Setting it adds a **VIEW_3D** button; pressing it fetches
Google's `<model-viewer>` (~1 MB, pinned in `components/Work3D.tsx`) and swaps
the still for an orbitable model. Nothing is fetched until someone presses it,
and if the fetch fails the still stays with a note.

Export `.glb` from Fusion, or convert an STL — the STLs themselves live in the
`3d` project folder, along with the blueprints and the Python build scripts
that generate them.

(This file is served too. Keep it free of anything that shouldn't be public.)

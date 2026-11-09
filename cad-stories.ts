/**
 * The personal side of the model notebook: why I made each thing, in my words.
 * No print or test status here: the pages just show the models. Everything
 * factual about a print (title, renders, model) comes from the 3d-prints
 * manifest; see lib/prints.ts. A print without a story here still gets a page,
 * built from its manifest entry.
 */
export interface CadStory {
  /** The print's slug in the 3d-prints manifest. */
  print: string;
  /** This site's page slug. */
  slug: string;
  /** Meta description for the story page. */
  description: string;
  /** Describes the lead render, for someone who cannot see it. */
  alt: string;
  /** The site's own copy of the drawing (town name removed from title blocks). */
  blueprint?: string;
  intro: string;
  sections: [string, string][];
}

export const CAD_STORIES: CadStory[] = [
  {
    print: 'charger-brace', slug: 'charger-brace',
    description: 'A two-part brace for my laptop charger plug: why I modelled it, and the interactive model and blueprint.',
    blueprint: '/portfolio-3d/blueprints/charger-brace.html',
    alt: 'A ribbed charger-plug sleeve with a mounting plate and a hook for the laptop rear edge',
    intro: 'The strain relief on my charger plug tore away. That left me with a small, awkward problem to model: something that could grip the plug and support the cable without blocking the laptop’s vents.',
    sections: [
      ['Why this shape', 'The sleeve grips the plug, the plate sits against the laptop’s rear face, and a small arm hooks over its rear edge. It splits into two halves so it can go around the existing cable. Cable ties close the halves together. The drawing records the plug, the laptop’s rear edge and the clearances around them. The damaged cable is a separate issue: a printed brace does not restore its electrical insulation.'],
    ],
  },
  {
    print: 'key-fob', slug: 'mazda-flip-key',
    description: 'A replacement Mazda flip-key body made from caliper readings, with an interactive 3D model and the measurement blueprint.',
    blueprint: '/portfolio-3d/blueprints/mazda-flip-key.html',
    alt: 'A replacement flip-key body with a recessed folding-blade slot and keyring hole',
    intro: 'I wanted a replacement body for a 2007 Mazda flip key. The blade head and transponder need to fit the new body, so I started with calipers and a drawing rather than trying to copy the outside by eye.',
    sections: [
      ['Working back from the original', 'The blade head clips into the body using its snap tab. The model also needs room for the folded blade and a keyring. Those small interfaces matter more than making a convincing render.'],
      ['A drawing with honest gaps', 'Corners and dimensions are tagged in the blueprint. Where a measurement is not confirmed, it stays marked as unknown instead of quietly becoming a made-up number. The 3D model and the drawing show different parts of that process.'],
    ],
  },
];

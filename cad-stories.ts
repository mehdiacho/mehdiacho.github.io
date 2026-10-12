export const CAD_STORIES = [
  {
    id: 'M01', slug: 'charger-brace', title: 'Laptop charger brace',
    description: 'A two-part brace for my laptop charger plug: why I modelled it, the untested first version, and the interactive model and blueprint.',
    model: '/portfolio-3d/models/charger-brace.glb',
    poster: '/portfolio-3d/charger-brace-v1.png',
    blueprint: '/portfolio-3d/blueprints/charger-brace.html',
    alt: 'A ribbed charger-plug sleeve with a mounting plate and a hook for the laptop rear edge',
    status: 'V1 modelled · print and fit unconfirmed',
    intro: 'The strain relief on my charger plug tore away. That left me with a small, awkward problem to model: something that could grip the plug and support the cable without blocking the laptop’s vents.',
    sections: [
      ['Why this shape', 'The sleeve grips the plug, the plate sits against the laptop’s rear face, and a small arm hooks over its rear edge. It splits into two halves so it can go around the existing cable. Cable ties close the halves together.'],
      ['What I have so far', 'The first version is modelled, with two arm thicknesses prepared for printing. The drawing records the plug, the laptop’s rear edge and the clearances around them. Some details still depend on a physical test fit.'],
      ['The next test', 'I need to check whether the bore grips the plug, whether the hook sits in the trough and whether the plate rests flat. I have not confirmed a successful print or long-term use. The damaged cable is a separate issue: a printed brace does not restore its electrical insulation.'],
    ],
  },
  {
    id: 'M02', slug: 'mazda-flip-key', title: 'Mazda flip-key body',
    description: 'A replacement Mazda flip-key body made from caliper readings, with an interactive 3D model, the measurement blueprint and fit-test notes.',
    model: '/portfolio-3d/models/mazda-flipkey-body.glb',
    poster: '/portfolio-3d/renders/mazda-flipkey-body-1.webp',
    blueprint: '/portfolio-3d/blueprints/mazda-flip-key.html',
    alt: 'A replacement flip-key body with a recessed folding-blade slot and keyring hole',
    status: 'V3 modelled · fit-test results pending',
    intro: 'I wanted a replacement body for a 2007 Mazda flip key. The blade head and transponder need to fit the new body, so I started with calipers and a drawing rather than trying to copy the outside by eye.',
    sections: [
      ['Working back from the original', 'The blade head clips into the body using its snap tab. The model also needs room for the folded blade and a keyring. Those small interfaces matter more than making a convincing render.'],
      ['A drawing with honest gaps', 'Corners and dimensions are tagged in the blueprint. Where a measurement is not confirmed, it stays marked as unknown instead of quietly becoming a made-up number. The 3D model and the drawing show different parts of that process.'],
      ['Where it stands', 'Tight, standard and loose versions of the joint-end fit test were printed. The latest project record says collection and fit checks were still pending. The full-body model is available here, but I am not calling the replacement finished until the fit is confirmed.'],
    ],
  },
];

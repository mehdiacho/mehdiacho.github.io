export const origin = 'https://mehdiacho.tech';
export const image = `${origin}/portfolio-3d/charger-brace-v1.png`;
export const areaServed = [{ '@type': 'City', name: 'Gaborone' }, { '@type': 'Country', name: 'Botswana' }];
export const pages = [
  {
    path: '/', title: '3D & CAD Modeling Botswana | Mehdi Acho, Gaborone',
    description: 'Explore Mehdi Acho’s 3D and CAD modeling, functional part designs and full-stack web development in Gaborone, serving clients across Botswana.',
    heading: '3D modeling and web development in Botswana',
  },
  {
    path: '/3d-modeling-botswana/', title: '3D Modeling Gaborone, Botswana | Mehdi Acho',
    description: '3D modeling in Gaborone for functional objects and clear design presentations. Explore real model studies and discuss your next project with Mehdi Acho.',
    heading: '3D modeling in Gaborone', eyebrow: 'OBJECTS / FORM / PRESENTATION',
    intro: 'Turn an idea or an existing object into a model you can inspect, explain and refine. I work from Gaborone with clients across Botswana, building clear geometry around a practical brief.',
    sections: [
      ['From reference to a readable model', 'Photographs, sketches and reference dimensions establish the overall shape. The first model makes proportions and assembly visible, so we can resolve the big decisions before spending time on small details.'],
      ['Views that explain the design', 'A useful presentation shows how an object fits together. Multiple views, assembly studies and rendered stills help communicate the form and reveal what needs another iteration.'],
      ['What to bring to a 3D modeling project', 'Start with the object or idea, a few reference images and what the model needs to do. Tell me whether you need presentation images, editable geometry or a part for fabrication. Deliverables and tolerances are agreed around that use.'],
    ],
    work: true,
  },
  {
    path: '/cad-modeling-botswana/', title: 'CAD Modeling Botswana | Functional Parts by Mehdi Acho',
    description: 'CAD modeling in Botswana for measured parts, dimensioned drawings and print-ready models. See parametric design studies by Mehdi Acho in Gaborone.',
    heading: 'CAD modeling in Botswana', eyebrow: 'MEASURE / CONSTRAIN / ITERATE',
    intro: 'A replacement part needs more than the right silhouette. My CAD work starts with the dimensions and interfaces that control fit, then turns those constraints into a model that can be adjusted as testing reveals more.',
    sections: [
      ['Measured parts and parametric geometry', 'Caliper measurements and a dimensioned drawing provide the starting point. Critical interfaces, clearances and wall thicknesses drive the model instead of being hidden in a finished mesh.'],
      ['From a drawing to a print-ready file', 'The charger-brace and flip-key studies below show the process: measure the existing object, map the assembly, model the components and review how they can be made. A modelled part is labelled as modelled; a finished print is a separate milestone.'],
      ['Planning a CAD project', 'Send reference photographs, available measurements, the intended material and how the part will be used. We can agree the drawing, editable model or export files needed for the job, then refine fit through prototypes.'],
    ],
    work: true,
  },
  {
    path: '/web-development-gaborone/', title: 'Web Development Gaborone | Websites by Mehdi Acho',
    description: 'Website development in Gaborone for businesses and useful web applications. Work with Mehdi Acho on responsive React and TypeScript sites in Botswana.',
    heading: 'Web development in Gaborone', eyebrow: 'WEBSITES / APPLICATIONS / SYSTEMS',
    intro: 'I build websites and web applications around the task they need to make easier. Based in Gaborone, I work with React and TypeScript, with Firebase or Cloudflare where a project needs a backend.',
    sections: [
      ['Website development for a clear purpose', 'A business website should explain what you do, work on a phone and make the next step obvious. Content structure, accessible navigation, metadata and loading performance belong in the build from the start.'],
      ['When a website needs to do more', 'Some projects need accounts, stored data or workflows rather than a brochure. My portfolio includes browser tools, installable applications and services that connect a frontend to a backend. The technology follows the requirements.'],
      ['Start with the workflow', 'Tell me who will use the site, what they need to accomplish and any systems it must connect to. That gives us a practical basis for scope, design, implementation and handover.'],
    ],
    work: false,
  },
];
export function structuredData(page) {
  const person = `${origin}/#person`, service = `${origin}/#professional-service`;
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Person', '@id': person, name: 'Mehdi Acho', url: origin+'/',
      jobTitle: '3D and CAD modeler, full-stack developer',
      homeLocation: { '@type': 'City', name: 'Gaborone', containedInPlace: { '@type': 'Country', name: 'Botswana' } },
      knowsAbout: ['3D modeling', 'CAD modeling', 'Web development', 'Machine learning'],
      sameAs: ['https://github.com/mehdiacho', 'https://linkedin.com/in/mehdiacho'] },
    { '@type': 'ProfessionalService', '@id': service, name: 'Mehdi Acho — 3D, CAD & Web Development',
      url: origin+'/', image, description: pages[0].description, founder: { '@id': person }, areaServed,
      address: { '@type': 'PostalAddress', addressLocality: 'Gaborone', addressCountry: 'BW' },
      hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Design and development services', itemListElement: pages.slice(1).map(p=>({ '@type': 'Offer', itemOffered: { '@type': 'Service', name:p.heading, url:origin+p.path, areaServed, provider:{'@id':service} } })) } },
    { '@type': 'WebSite', '@id': `${origin}/#website`, url:origin+'/', name:'Mehdi Acho', publisher:{'@id':person}, inLanguage:'en' },
    { '@type': 'WebPage', '@id':origin+page.path+'#webpage', url:origin+page.path, name:page.title,
      description:page.description, isPartOf:{'@id':`${origin}/#website`}, about:{'@id':service}, inLanguage:'en' },
  ] };
}

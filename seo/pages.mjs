export const origin = 'https://mehdiacho.tech';
export const image = `${origin}/portfolio-3d/charger-brace-v1.png`;
export const areaServed = [{ '@type': 'City', name: 'Gaborone' }, { '@type': 'Country', name: 'Botswana' }];

/**
 * The crawlable pages.
 *
 * Written in the first person, the same as the rest of the site. Marketing
 * voice ("explore", "solutions", "tailored to your needs") is deliberately
 * absent — it reads as filler to a person and carries nothing extra for a
 * crawler. Every claim here has to be one Mehdi can stand behind on a call.
 */
export const pages = [
  {
    path: '/', title: 'Mehdi Acho — CAD Modeling, 3D Printing & Web Development, Gaborone',
    description: "I'm Mehdi Acho. I do CAD modeling, 3D printing and web development in Gaborone, Botswana. Send me a photo of the part and a couple of measurements.",
    heading: 'CAD modeling, 3D printing and web development in Botswana',
  },
  {
    path: '/3d-modeling-botswana/', title: '3D Modeling in Gaborone, Botswana | Mehdi Acho',
    description: '3D modeling in Gaborone. I model objects from photos, sketches or the thing itself, and give you views that actually explain the design. Mehdi Acho, Botswana.',
    heading: '3D modeling in Gaborone', eyebrow: 'OBJECTS / FORM / PRESENTATION',
    intro: "I model objects so you can look at them properly before anyone commits to making one. That might start from a sketch, a few photos, or the thing itself sitting on my desk. I work from Gaborone and take jobs anywhere in Botswana.",
    sections: [
      ['Starting from whatever you have', "Photos and a rough sketch are usually enough to get going. The first model is about proportion and how the pieces sit together, not about detail. It is much easier to argue about the shape once you can turn it around on screen."],
      ['Views that explain the thing', "A single render is pretty and not very useful. I give you the views that answer questions: how it comes apart, what touches what, where the awkward bit is. That is normally where the next round of changes comes from."],
      ['What to send me', "The object or the idea, a few photos, and what the model is for. Tell me whether you need images to show someone, geometry you can keep editing, or a file that goes to a machine. That decides how it gets built, so it is worth saying up front."],
    ],
    work: true,
  },
  {
    path: '/cad-modeling-botswana/', title: 'CAD Modeling in Botswana — Measured Parts | Mehdi Acho',
    description: 'CAD modeling in Botswana for replacement parts that have to fit. Measured with calipers, drawn, modelled and printed. Mehdi Acho, Gaborone.',
    heading: 'CAD modeling in Botswana', eyebrow: 'MEASURE / CONSTRAIN / ITERATE',
    intro: "A replacement part is not about looking right, it is about fitting. So I start with the measurements and the surfaces that have to mate, and let those drive the model. When a test fit tells me something new, the model changes with it instead of being rebuilt.",
    sections: [
      ['Calipers before software', "I measure the original and draw it before I model anything. Clearances, wall thickness and the faces that have to meet are written down as numbers, not buried in a finished mesh where nobody can find them later."],
      ['From the drawing to something you can print', "The charger brace and the flip key below are both this process. Measure, map how it comes apart, model the pieces, then look at whether it can actually be made that way. If a part has only been modelled, the label says modelled. A finished print is a separate thing and I will not pretend otherwise."],
      ['What to send me', "Photos, any measurements you already have, what material it needs to be, and how the part gets used. Dropped? Loaded? Hot? That changes the answer. We settle on what you get back, whether that is a drawing, a model you can keep editing or files that go straight to a printer, and then fix the fit with prototypes."],
    ],
    work: true,
  },
  {
    path: '/web-development-gaborone/', title: 'Web Development in Gaborone | Websites by Mehdi Acho',
    description: 'Web development in Gaborone, Botswana. Websites and web apps in React and TypeScript that load fast on a phone and turn up in search. Mehdi Acho.',
    heading: 'Web development in Gaborone', eyebrow: 'WEBSITES / APPLICATIONS / SYSTEMS',
    intro: "I build sites and web apps around the thing they are supposed to make easier. React and TypeScript, with Firebase or Cloudflare behind them when there is something to store. Based in Gaborone.",
    sections: [
      ['A site that does its job', "Most business sites here are slow on a phone and bury what the business actually does, which is the same reason nobody ever finds them. None of that gets fixed at the end; it is decided while the thing is being built. This site is the demonstration. It was built to rank for what I do, and that is why you are reading it."],
      ['When a site needs to be an app', "Accounts, stored data, something that has to happen on a schedule. I have built browser tools, installable apps and services with real backends; a few of them are listed on the home page. The stack follows what the thing needs, not the other way around."],
      ['What to tell me', "Who uses it, what they are trying to get done, and anything it has to talk to. That is enough to scope it honestly. If I think you do not need what you are asking for, I will say so before you pay for it."],
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
      knowsAbout: ['3D modeling', 'CAD modeling', '3D printing', 'Web development', 'Machine learning'],
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'Botswana International University of Science and Technology' },
      sameAs: ['https://github.com/mehdiacho', 'https://linkedin.com/in/mehdiacho'] },
    { '@type': 'ProfessionalService', '@id': service, name: 'Mehdi Acho — CAD, 3D Printing & Web Development',
      url: origin+'/', image, description: pages[0].description, founder: { '@id': person }, areaServed,
      address: { '@type': 'PostalAddress', addressLocality: 'Gaborone', addressCountry: 'BW' },
      hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Design and development services', itemListElement: pages.slice(1).map(p=>({ '@type': 'Offer', itemOffered: { '@type': 'Service', name:p.heading, url:origin+p.path, areaServed, provider:{'@id':service} } })) } },
    { '@type': 'WebSite', '@id': `${origin}/#website`, url:origin+'/', name:'Mehdi Acho', publisher:{'@id':person}, inLanguage:'en' },
    { '@type': 'WebPage', '@id':origin+page.path+'#webpage', url:origin+page.path, name:page.title,
      description:page.description, isPartOf:{'@id':`${origin}/#website`}, about:{'@id':service}, inLanguage:'en' },
  ] };
}

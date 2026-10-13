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
    path: '/', title: 'Mehdi Acho — Software, Research & Side Quests',
    description: "I'm Mehdi Acho, based in Gaborone, Botswana. I build software, research graph networks for EEG, and keep a few side quests going, including CAD modeling.",
    heading: 'Hi, I’m Mehdi.',
  },
  {
    path: '/3d-modeling-botswana/', title: '3D Modeling in Gaborone, Botswana | Mehdi Acho',
    description: 'How I approach 3D modeling in Gaborone: from photos, sketches or the object itself, with views that explain the design. A hobby I take requests for. Mehdi Acho, Botswana.',
    heading: '3D modeling in Gaborone', eyebrow: 'A HOBBY / NOTES ON HOW I MODEL',
    intro: "Modeling is a hobby for me. I like looking at a thing properly before anyone commits to making it, whether that starts from a sketch, a few photos or the object sitting on my desk. I’m based in Gaborone, Botswana. Most of my models start with something of my own, and I’m happy to look at a request when it’s a good fit.",
    sections: [
      ['Starting from whatever you have', "Photos and a rough sketch are usually enough to get going. The first model is about proportion and how the pieces sit together, not about detail. It is much easier to argue about the shape once you can turn it around on screen."],
      ['Views that explain the thing', "A single render is pretty and not very useful. I give you the views that answer questions: how it comes apart, what touches what, where the awkward bit is. That is normally where the next round of changes comes from."],
      ['What to send me', "The object or the idea, a few photos, and what the model is for. Tell me whether you need images to show someone, geometry you can keep editing, or a file that goes to a machine. That decides how it gets built, so it is worth saying up front."],
    ],
    work: true,
  },
  {
    path: '/cad-modeling-botswana/', title: 'CAD Modeling in Botswana — Measured Parts | Mehdi Acho',
    description: 'How I model replacement parts that have to fit: measured with calipers, drawn, then modeled for later fabrication. A hobby in Gaborone, Botswana. Mehdi Acho.',
    heading: 'CAD modeling in Botswana', eyebrow: 'A HOBBY / MEASURE, DRAW, MODEL',
    intro: "This is how I work on my own replacement parts, written down in case it helps you. A part like that isn’t about looking right, it’s about fitting. So I start with the measurements and the surfaces that have to meet, and let those drive the model. When a test fit tells me something new, the model changes with it instead of being rebuilt.",
    sections: [
      ['Calipers before software', "I measure the original and draw it before I model anything. Clearances, wall thickness and the faces that have to meet are written down as numbers, not buried in a finished mesh where nobody can find them later."],
      ['From the drawing to something you can print', "The charger brace and the flip key below are both this process. Measure, map how it comes apart, model the pieces, then look at whether it can actually be made that way. If a part has only been modelled, the label says modelled. A finished print is a separate thing and I will not pretend otherwise."],
      ['What to send me', "Photos, any measurements you already have, what material it needs to be, and how the part gets used. Dropped? Loaded? Hot? That changes the answer. We settle on what you get back, whether that is a drawing, a model you can keep editing or files that go straight to a printer, with physical prototyping arranged separately. I do not currently own a 3D printer."],
    ],
    work: true,
  },
  {
    path: '/web-development-gaborone/', title: 'Web Development in Gaborone | Websites by Mehdi Acho',
    description: 'How I build websites and web apps in Gaborone, Botswana: React and TypeScript, made to load fast on a phone and be easy to find. Mehdi Acho.',
    heading: 'Web development in Gaborone', eyebrow: 'HOW I BUILD FOR THE WEB',
    intro: "I build sites and web apps around the thing they are supposed to make easier. React and TypeScript, with Firebase or Cloudflare behind them when there is something to store. Based in Gaborone.",
    sections: [
      ['A site that does its job', "When I build a site, I care about whether someone can find what they need and use it on a phone. This portfolio is one of those ongoing experiments: content, performance and design all change as I learn what works."],
      ['When a site needs to be an app', "Accounts, stored data, something that has to happen on a schedule. I have built browser tools, installable apps and services with real backends; a few of them are listed on the home page. The stack follows what the thing needs, not the other way around."],
      ['What to tell me', "Who uses it, what they are trying to get done, and anything it has to talk to. That gives us a starting point. I can look at the request and tell you whether it is something I can take on."],
    ],
    work: false,
  },
];
export function structuredData(page) {
  const person = `${origin}/#person`, service = `${origin}/#professional-service`;
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Person', '@id': person, name: 'Mehdi Acho', url: origin+'/',
      jobTitle: 'Software developer and MSc student',
      homeLocation: { '@type': 'City', name: 'Gaborone', containedInPlace: { '@type': 'Country', name: 'Botswana' } },
      knowsAbout: ['Software development', 'Machine learning', 'Graph neural networks', 'Web development', 'CAD modeling'],
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'Botswana International University of Science and Technology' },
      sameAs: ['https://github.com/mehdiacho', 'https://linkedin.com/in/mehdiacho'] },
    { '@type': 'ProfessionalService', '@id': service, name: 'Mehdi Acho — Modeling & Web Development',
      url: origin+'/', image, description: pages[0].description, founder: { '@id': person }, areaServed,
      address: { '@type': 'PostalAddress', addressLocality: 'Gaborone', addressCountry: 'BW' },
      hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Design and development services', itemListElement: pages.slice(1).map(p=>({ '@type': 'Offer', itemOffered: { '@type': 'Service', name:p.heading, url:origin+p.path, areaServed, provider:{'@id':service} } })) } },
    { '@type': 'WebSite', '@id': `${origin}/#website`, url:origin+'/', name:'Mehdi Acho', publisher:{'@id':person}, inLanguage:'en' },
    { '@type': 'WebPage', '@id':origin+page.path+'#webpage', url:origin+page.path, name:page.title,
      description:page.description, isPartOf:{'@id':`${origin}/#website`}, about:{'@id':service}, inLanguage:'en' },
  ] };
}

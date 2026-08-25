export interface ProjectItem {
  id: string;
  title: { fr: string; en: string };
  subtitle: { fr: string; en: string };
  category: { fr: string; en: string };
  location: { fr: string; en: string };
  surface: string;
  year: string;
  image: string;
  gallery: string[];
  description: { fr: string; en: string };
  highlights: { fr: string[]; en: string[] };
  tags: string[];
}

export const projectsData: ProjectItem[] = [
  {
    id: "cabinet-haussmann",
    title: {
      fr: "Cabinet Médical & Dentaire Haussmann",
      en: "Haussmann Medical & Dental Practice"
    },
    subtitle: {
      fr: "Conformité ARS, ergonomie praticien & confort patient",
      en: "ARS Compliance, Practitioner Ergonomics & Patient Comfort"
    },
    category: {
      fr: "Santé",
      en: "Healthcare"
    },
    location: {
      fr: "Paris 8ème",
      en: "Paris 8th Arrondissement"
    },
    surface: "180 m²",
    year: "2024",
    image: "/templates/medical-cabinet.jpg",
    gallery: [
      "/templates/medical-cabinet.jpg",
      "/templates/living-room.jpg",
      "/templates/bedroom.jpg"
    ],
    description: {
      fr: "Transformation complète d'un appartement haussmannien en cabinet médical multidisciplinaire. Intégration rigoureuse des normes PMR, des zones de stérilisation et d'un univers visuel apaisant en chêne clair et laiton.",
      en: "Complete transformation of a Haussmannian apartment into a multidisciplinary medical practice. Rigorous integration of accessibility standards, sterilization zones, and a soothing visual aesthetic in light oak and brass."
    },
    highlights: {
      fr: [
        "Conformité totale normes ARS & PMR",
        "Signalétique & identité visuelle dédiées",
        "Isolation phonique renforcée entre bureaux",
        "Mobilier sur-mesure d'accueil et de soins"
      ],
      en: [
        "Full ARS & PMR compliance",
        "Dedicated signage & visual identity",
        "Enhanced acoustic isolation between offices",
        "Custom reception & treatment furniture"
      ]
    },
    tags: ["Santé", "Rénovation", "Sur-mesure", "Digital"]
  },
  {
    id: "villa-japonais",
    title: {
      fr: "Master Suite & Salon Japandi",
      en: "Japandi Master Suite & Living Room"
    },
    subtitle: {
      fr: "Minimalisme chaleureux, boiseries sur-mesure & sérénité",
      en: "Warm Minimalism, Custom Woodwork & Serenity"
    },
    category: {
      fr: "Particuliers",
      en: "Residential"
    },
    location: {
      fr: "Saint-Tropez",
      en: "Saint-Tropez, France"
    },
    surface: "140 m²",
    year: "2024",
    image: "/templates/bedroom.jpg",
    gallery: [
      "/templates/bedroom.jpg",
      "/templates/living-room.jpg",
      "/templates/kitchen.jpg"
    ],
    description: {
      fr: "Rénovation globale d'une suite principale et d'un espace de vie. Agencement sur-mesure avec tasseaux de bois, éclairages indirects et mobilier épuré favorisant le bien-être.",
      en: "Overall renovation of a master suite and living area. Custom fit-out featuring timber slats, indirect mood lighting, and minimalist furniture promoting tranquility."
    },
    highlights: {
      fr: [
        "Dressings et têtes de lit sur-mesure",
        "Matériaux naturels & essences bio-sourcées",
        "Integration domotique discrète",
        "Visualisation 3D photoréaliste préalable"
      ],
      en: [
        "Custom walk-in closets and headboards",
        "Natural materials & bio-sourced woods",
        "Discreet smart home integration",
        "Prior photorealistic 3D rendering"
      ]
    },
    tags: ["Particuliers", "Sur-mesure", "Rénovation"]
  },
  {
    id: "cuisine-marbre",
    title: {
      fr: "Cuisine Architectural & Îlot Marbre",
      en: "Architectural Kitchen & Marble Island"
    },
    subtitle: {
      fr: "Lignes contemporaines, marbre Calacatta & menuiserie intégrée",
      en: "Contemporary Lines, Calacatta Marble & Built-in Joinery"
    },
    category: {
      fr: "Particuliers",
      en: "Residential"
    },
    location: {
      fr: "Neuilly-sur-Seine",
      en: "Neuilly-sur-Seine, France"
    },
    surface: "65 m²",
    year: "2023",
    image: "/templates/kitchen.jpg",
    gallery: [
      "/templates/kitchen.jpg",
      "/templates/living-room.jpg",
      "/templates/bedroom.jpg"
    ],
    description: {
      fr: "Création d'une cuisine ouverte d'exception. Agencement fluide avec électroménager dissimulé, îlot central monolithique en marbre et rangements toute hauteur sur-mesure.",
      en: "Creation of an exceptional open plan kitchen. Fluid layout with concealed appliances, monolithic marble center island, and full-height custom storage."
    },
    highlights: {
      fr: [
        "Îlot central sur-mesure en marbre massif",
        "Façades en placage bois véritable",
        "Plan de travail sans raccord apparent",
        "Éclairage architectural scénographié"
      ],
      en: [
        "Custom solid marble center island",
        "Real wood veneer cabinet fronts",
        "Seamless countertop integration",
        "Scenographic architectural lighting"
      ]
    },
    tags: ["Particuliers", "Sur-mesure"]
  },
  {
    id: "siege-collaboratif",
    title: {
      fr: "Siège Contemporain & Espaces Collab",
      en: "Contemporary HQ & Collaborative Spaces"
    },
    subtitle: {
      fr: "Bureaux modulables, cabines acoustiques & identité de marque",
      en: "Flexible Workspaces, Acoustic Pods & Brand Identity"
    },
    category: {
      fr: "Bureaux / Entreprise",
      en: "Office / Corporate"
    },
    location: {
      fr: "Lyon Part-Dieu",
      en: "Lyon Part-Dieu, France"
    },
    surface: "450 m²",
    year: "2024",
    image: "/templates/living-room.jpg",
    gallery: [
      "/templates/living-room.jpg",
      "/templates/kitchen.jpg",
      "/templates/bedroom.jpg"
    ],
    description: {
      fr: "Aménagement complet de plateaux de bureaux pour une entreprise technologique. Conception d'espaces ouverts, de salles de réunion connectées et d'espaces détente.",
      en: "Complete interior fit-out of office floors for a tech company. Design of open spaces, connected meeting rooms, and relaxing breakout areas."
    },
    highlights: {
      fr: [
        "Mobilier professionnel ergonomique & sur-mesure",
        "Cabines et cloisons acoustiques hautes performances",
        "Signalétique web & physique assortie",
        "Déploiement digital & réservation de salles"
      ],
      en: [
        "Ergonomic custom corporate furniture",
        "High-performance acoustic pods & dividers",
        "Coordinated physical & web signage",
        "Digital room booking deployment"
      ]
    },
    tags: ["Bureaux / Entreprise", "Digital", "Sur-mesure"]
  },
  {
    id: "concept-store-horlogerie",
    title: {
      fr: "Concept Store Haute Horlogerie",
      en: "Haute Horlogerie Concept Store"
    },
    subtitle: {
      fr: "Expérience client immersive, vitrines sécurisées & 360°",
      en: "Immersive Retail Experience, Secure Displays & 360°"
    },
    category: {
      fr: "Commerce",
      en: "Retail"
    },
    location: {
      fr: "Paris Place Vendôme",
      en: "Paris Place Vendôme"
    },
    surface: "110 m²",
    year: "2023",
    image: "/templates/living-room.jpg",
    gallery: [
      "/templates/living-room.jpg",
      "/templates/bedroom.jpg"
    ],
    description: {
      fr: "Conception architecturale et digitale d'un concept store d'horlogerie de luxe. Présentoirs sur-mesure en noyer massif, vitrines sécurisées et écrans immersifs 360°.",
      en: "Architectural and digital creation of a luxury horology concept store. Custom displays in solid walnut, high-security showcases, and 360° immersive digital displays."
    },
    highlights: {
      fr: [
        "Vitrines d'exposition sécurisées sur-mesure",
        "Expérience client phygitale immersive",
        "Éclairage de précision spécial joaillerie",
        "Charte de marque & site vitrine assorti"
      ],
      en: [
        "Custom high-security showcase displays",
        "Immersive phygital customer experience",
        "Precision jewelry-grade lighting",
        "Matching brand book & digital website"
      ]
    },
    tags: ["Commerce", "Digital", "Sur-mesure"]
  },
  {
    id: "restaurant-bistronomique",
    title: {
      fr: "Restaurant Bistronomique & Bar Laiton",
      en: "Bistronomic Restaurant & Brass Bar"
    },
    subtitle: {
      fr: "Ambiance feutrée, banquettes sur-mesure & acoustique",
      en: "Cosy Ambiance, Custom Banquettes & Acoustics"
    },
    category: {
      fr: "Restaurant",
      en: "Restaurant"
    },
    location: {
      fr: "Bordeaux",
      en: "Bordeaux, France"
    },
    surface: "210 m²",
    year: "2024",
    image: "/templates/kitchen.jpg",
    gallery: [
      "/templates/kitchen.jpg",
      "/templates/living-room.jpg"
    ],
    description: {
      fr: "Rénovation d'un restaurant historique. Création d'un comptoir bar sculptural en laiton brossé, banquettes en velours et étude acoustique poussée.",
      en: "Renovation of a historic restaurant space. Creation of a sculptural brushed brass bar counter, velvet booth seating, and extensive acoustic engineering."
    },
    highlights: {
      fr: [
        "Bar central en laiton brossé sur-mesure",
        "Banquettes courbes et assises personnalisées",
        "Conformité sécurité & accessibilité ERP",
        "Site web & menu digital QR code intégrés"
      ],
      en: [
        "Custom brushed brass central bar counter",
        "Curved booths and tailored seating",
        "Full ERP public safety & PMR compliance",
        "Integrated website & digital QR menu"
      ]
    },
    tags: ["Restaurant", "Rénovation", "Sur-mesure", "Digital"]
  }
];

export const PROJECTS_DATA = projectsData;

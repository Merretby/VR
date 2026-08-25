import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Filter, Sparkles } from "lucide-react";
import { useState } from "react";
import { projectsData } from "@/lib/projectsData";
import { useDict, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/projects/")({
  component: ProjectsPage,
});

const CATEGORIES = [
  { fr: "Tous", en: "All" },
  { fr: "Particuliers", en: "Residential" },
  { fr: "Commerce", en: "Retail" },
  { fr: "Restaurant", en: "Restaurant" },
  { fr: "Bureaux / Entreprise", en: "Office / Corporate" },
  { fr: "Santé", en: "Healthcare" },
  { fr: "Rénovation", en: "Renovation" },
  { fr: "Sur-mesure", en: "Custom" },
  { fr: "Digital", en: "Digital" },
];

function ProjectsPage() {
  const d = useDict();
  const { lang } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const filteredProjects = projectsData.filter((project) => {
    if (selectedCategory === "Tous" || selectedCategory === "All") return true;
    
    // Check tags in both languages
    const tagMatch = project.tags.some((tag) => {
      if (tag === selectedCategory) return true;
      if (selectedCategory === "Residential" && tag === "Particuliers") return true;
      if (selectedCategory === "Retail" && tag === "Commerce") return true;
      if (selectedCategory === "Office / Corporate" && tag === "Bureaux / Entreprise") return true;
      if (selectedCategory === "Healthcare" && tag === "Santé") return true;
      if (selectedCategory === "Renovation" && tag === "Rénovation") return true;
      if (selectedCategory === "Custom" && tag === "Sur-mesure") return true;
      return false;
    });
    return tagMatch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border/60 py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-4 py-1.5 text-xs font-mono font-medium text-muted-foreground backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>{lang === "fr" ? "NOS RÉALISATIONS" : "OUR PROJECTS"}</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-3xl leading-tight">
            {d.projects?.title ?? (lang === "fr" ? "Nos réalisations" : "Our Projects")}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {d.projects?.subtitle ?? (lang === "fr" 
              ? "Chaque projet part d'un besoin différent. Notre rôle est d'en comprendre les enjeux, d'imaginer la réponse ajustée, et de la traduire en une réalisation concrète."
              : "Every project starts from a unique need. Our role is to understand your vision, design a tailored solution, and transform it into reality.")}
          </p>

          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-semibold text-background shadow-md hover:scale-105 transition-all duration-300"
            >
              <span>{d.header?.contact ?? "Parlons de votre projet"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Filter Bar & Case Studies */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-10">
          
          {/* Categories Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
              <Filter className="h-3.5 w-3.5 text-amber-500" />
              <span>{lang === "fr" ? "Filtrer par secteur ou domaine" : "Filter by sector or domain"}</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {CATEGORIES.map((cat) => {
                const label = cat[lang];
                const isSelected = selectedCategory === cat.fr || selectedCategory === cat.en;
                return (
                  <button
                    key={cat.fr}
                    onClick={() => setSelectedCategory(cat[lang])}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-foreground text-background font-semibold shadow-xs"
                        : "border border-border bg-muted/40 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                to="/projects"
                className="group flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-foreground/30"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-muted">
                  <img
                    src={project.image}
                    alt={project.title[lang]}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-background/20 bg-black/60 px-3 py-1 text-[10px] font-mono font-medium text-white backdrop-blur-md">
                      {project.category[lang]}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 rounded-full bg-background/90 px-3 py-1 text-[10px] font-mono text-foreground backdrop-blur-md">
                    {project.surface} — {project.location[lang]}
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif text-xl font-bold tracking-tight text-foreground group-hover:text-amber-600 transition-colors">
                      {project.title[lang]}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {project.subtitle[lang]}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-foreground">
                    <span>{lang === "fr" ? "Voir l'étude de cas" : "View case study"}</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

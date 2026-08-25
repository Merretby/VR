import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, MapPin, Calendar, Layers, Sparkles } from "lucide-react";
import { PROJECTS_DATA } from "@/lib/projectsData";
import { useDict, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/projects/$projectId")({
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const d = useDict();
  const { lang } = useI18n();

  const project = PROJECTS_DATA.find((p) => p.id === projectId) ?? PROJECTS_DATA[0];

  const title = typeof project.title === "object" ? project.title[lang] : project.title;
  const subtitle = typeof project.subtitle === "object" ? project.subtitle[lang] : project.subtitle;
  const category = typeof project.category === "object" ? project.category[lang] : project.category;
  const location = typeof project.location === "object" ? project.location[lang] : project.location;
  const description = typeof project.description === "object" ? project.description[lang] : project.description;
  const highlights = typeof project.highlights === "object" ? project.highlights[lang] : project.highlights;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header Back Bar */}
      <section className="border-b border-border/60 py-6 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{lang === "fr" ? "Retour aux réalisations" : "Back to Projects"}</span>
          </Link>
          <span className="text-xs font-mono text-muted-foreground">POKIBOIS CASE STUDY</span>
        </div>
      </section>

      {/* Project Banner & Specs */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-4 py-1.5 text-xs font-mono font-medium text-muted-foreground backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>{category}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-3xl border border-border bg-card">
            <div className="space-y-1">
              <span className="text-xs font-mono text-muted-foreground block">{lang === "fr" ? "Lieu" : "Location"}</span>
              <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-amber-500" />
                {location}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono text-muted-foreground block">{lang === "fr" ? "Surface" : "Surface"}</span>
              <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-amber-500" />
                {project.surface}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono text-muted-foreground block">{lang === "fr" ? "Année" : "Year"}</span>
              <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-amber-500" />
                {project.year}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono text-muted-foreground block">{lang === "fr" ? "Domaine" : "Domain"}</span>
              <span className="font-bold text-foreground text-sm text-amber-600 dark:text-amber-400">
                Pokibois Global
              </span>
            </div>
          </div>

          {/* Hero Main Image */}
          <div className="relative aspect-16/9 overflow-hidden rounded-3xl border border-border shadow-lg">
            <img
              src={project.image}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Content Description & Highlights */}
          <div className="grid lg:grid-cols-12 gap-8 pt-6">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="font-serif text-2xl font-bold">{lang === "fr" ? "Présentation du projet" : "Project Overview"}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                {description}
              </p>
            </div>
            <div className="lg:col-span-5 space-y-4 rounded-3xl border border-border bg-muted/40 p-6">
              <h3 className="font-serif text-lg font-bold">{lang === "fr" ? "Points clés de la réalisation" : "Key Highlights"}</h3>
              <ul className="space-y-3 text-xs">
                {highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-foreground font-medium">
                    <Check className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

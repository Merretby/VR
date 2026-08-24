import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Camera,
  Compass,
  Layers,
  Box,
  Eye,
  CheckCircle2,
  ArrowRight,
  Stethoscope,
  Utensils,
  Bed,
  Sofa,
  Cpu,
  Globe2,
  ShieldCheck,
} from "lucide-react";

import medicalCabinetImg from "@/assets/templates/medical-cabinet.jpg";
import kitchenImg from "@/assets/templates/kitchen.jpg";
import bedroomImg from "@/assets/templates/bedroom.jpg";
import livingRoomImg from "@/assets/templates/living-room.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Pokibois" },
      {
        name: "description",
        content:
          "Learn about Pokibois, our AI room reconstruction technology, photoreal moodboard redesign pipeline, and immersive 360° VR experience.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <AppHeader current="/about" />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent shadow-sm">
            <Sparkles className="h-4 w-4" />
            <span>Spatial AI & Interior Architecture</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
            Redefining Spaces with AI & 360° VR
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Pokibois transforms real physical spaces—from residential living rooms, master bedrooms, and modern kitchens to specialized medical cabinets—into geometry-accurate 3D models and photorealistic 360° VR environments.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild size="lg" className="rounded-full font-semibold px-6 shadow-md">
              <Link to="/capture">
                <Camera className="mr-2 h-4 w-4" /> Capture Your Space
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-6 border-border">
              <Link to="/vr">
                <Compass className="mr-2 h-4 w-4" /> Explore in 360° VR
              </Link>
            </Button>
          </div>
        </section>

        {/* Core Mission Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 p-8 sm:p-12 shadow-xl text-white">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
              Our Vision
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">
              Bridging Physical Architecture & Immersive AI Virtualization
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              We empower interior designers, architects, medical practitioners, and homeowners to visualize full spatial renovations before making a single physical change. By pairing multi-photo capture algorithms with custom moodboard prompts and equirectangular VR rendering, Pokibois makes interior transformation instant, precise, and accessible.
            </p>
          </div>
        </section>

        {/* Technology Pillar Grid */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-serif text-3xl font-bold tracking-tight">Our Core Technologies</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Built on cutting-edge spatial processing, AI vision models, and WebXR standards.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col justify-between p-6 rounded-2xl border border-border/70 bg-card/80 shadow-sm backdrop-blur-sm space-y-4">
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary w-fit">
                <Box className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold">Spatial 3D Reconstruction</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Extracts spatial depth, wall dimensions, ceiling heights, and room bounds from standard photos or 2D floor plans.
                </p>
              </div>
              <div className="pt-2 border-t border-border/50 text-[11px] font-semibold text-primary flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> Geometry Accurate
              </div>
            </div>

            <div className="flex flex-col justify-between p-6 rounded-2xl border border-border/70 bg-card/80 shadow-sm backdrop-blur-sm space-y-4">
              <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl text-accent w-fit">
                <Cpu className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold">Moodboard Redesign Pipeline</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Applies curated style directions (Japandi, Modern Luxury, Contemporary Chic) via automated n8n prompt workflows.
                </p>
              </div>
              <div className="pt-2 border-t border-border/50 text-[11px] font-semibold text-accent flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> Prompt Engine
              </div>
            </div>

            <div className="flex flex-col justify-between p-6 rounded-2xl border border-border/70 bg-card/80 shadow-sm backdrop-blur-sm space-y-4">
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary w-fit">
                <Globe2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold">360° Equirectangular VR</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Renders high-definition spherical panoramas instantly viewable in browser or WebXR headsets.
                </p>
              </div>
              <div className="pt-2 border-t border-border/50 text-[11px] font-semibold text-primary flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> WebXR Ready
              </div>
            </div>

            <div className="flex flex-col justify-between p-6 rounded-2xl border border-border/70 bg-card/80 shadow-sm backdrop-blur-sm space-y-4">
              <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl text-accent w-fit">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold">Cloud Database & Storage</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Secure Supabase backend mapping projects, photo assets, moodboard prompts, and panorama rows.
                </p>
              </div>
              <div className="pt-2 border-t border-border/50 text-[11px] font-semibold text-accent flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> Persistent Storage
              </div>
            </div>
          </div>
        </section>

        {/* Supported Environments / Use Cases */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-serif text-3xl font-bold tracking-tight">Spaces We Redesign</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Custom-tailored AI moodboards for residential and professional environments.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                <img src={medicalCabinetImg} alt="Medical Cabinet" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-lg">
                  <Stethoscope className="h-3.5 w-3.5 text-accent" /> Medical Cabinet
                </div>
              </div>
              <div className="p-4 space-y-1">
                <h3 className="font-serif text-base font-semibold">Medical Cabinets & Clinics</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Serene consultation offices with warm oak paneling, LED cove lighting, and acoustic treatment.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                <img src={kitchenImg} alt="Kitchen" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-lg">
                  <Utensils className="h-3.5 w-3.5 text-accent" /> Kitchen
                </div>
              </div>
              <div className="p-4 space-y-1">
                <h3 className="font-serif text-base font-semibold">Luxury Kitchens</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Custom waterfall marble islands, integrated appliances, and warm natural oak cabinetry.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                <img src={bedroomImg} alt="Bedroom" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-lg">
                  <Bed className="h-3.5 w-3.5 text-accent" /> Bedroom
                </div>
              </div>
              <div className="p-4 space-y-1">
                <h3 className="font-serif text-base font-semibold">Master Bedroom Suites</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Upholstered low beds, fluted wood accent walls, paper globe pendants, and organic linen.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                <img src={livingRoomImg} alt="Living Room" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-lg">
                  <Sofa className="h-3.5 w-3.5 text-accent" /> Living Room
                </div>
              </div>
              <div className="p-4 space-y-1">
                <h3 className="font-serif text-base font-semibold">Grand Living Rooms</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Curved bouclé sofas, travertine coffee tables, dark walnut paneling, and warm ambient sconces.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Footer Section */}
        <section className="text-center py-12 px-6 rounded-3xl border border-border bg-card shadow-sm space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">Experience Your Space Redesigned in 360°</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Upload your room photos or floor plan, pick your favorite moodboard style, and enter your redesigned sanctuary in 360° VR.
          </p>
          <div className="pt-2">
            <Button asChild size="lg" className="rounded-full px-8 font-semibold shadow-lg">
              <Link to="/capture">
                Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

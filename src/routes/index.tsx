import { useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { createProject, savePanorama, saveVisionBoard } from "@/lib/photos";
import { setActiveProjectId } from "@/lib/project-store";
import {
  Camera,
  Compass,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Box,
  Eye,
  Sliders,
  ShieldCheck,
  Zap,
  Globe,
  Award,
  X,
  Palette,
  Layers,
  Home,
  Check,
} from "lucide-react";

import luxuryAfter from "@/assets/showcase/luxury-after.png";
import luxuryBefore from "@/assets/showcase/luxury-before.jpg";
import japandiAfter from "@/assets/showcase/japandi-after.png";
import afterContemporary from "@/assets/showcase/afterContemporary.png";
import moodboardDefault from "@/assets/moodboards/moodbord.jpg";
import moodboard1 from "@/assets/moodboards/moodbord-1.jpg";
import moodboard2 from "@/assets/moodboards/moodbord-2.jpg";

export const Route = createFileRoute('/')({
  head: () => (+{
    meta: [
      { title: "Roomcast Studio AI 360° Room Redesign & VR Experience" },
      {
        name: "description",
        content:
          "Capture your room in photos, apply luxury moodboard aesthetics, and explore your AI-redesigned room in interactive 360° and VR.",
      },
      { property: "og:title", content: "Roomcast Studio 360° AI Interior Redesign" },
      {
        property: "og:description",
        content: "From real-room photos to photoreal 360° VR transformations styled with curated moodboards.",
      },
    ],
  }),
  component: LandingPage,
});

interface ShowcaseSpace {
  id: string;
  category: "luxury" | "japandi" | "contemporary" | "penthouse";
  title: string;
  subtitle: string;
  beforeImg: string;
  afterImg: string;
  styleName: string;
  tags: string[];
  dimensions: string;
  panoramaId: string;
}

 interface MoodboardDetail {
  id: string;
  title: string;
  styleName: string;
  subtitle: string;
  philosophy: string;
  img: string;
  components: {
    category: string;
    items: string[];
  }[];
  palette: {
    hex: string;
    name: string;
  }[];
  idealRooms: string[];
  lighting: string;
}
const MOODBOARD_DETAILS: MoodboardDetail[] = [
  {
    id: "luxury-warm",
    title: "Modern Luxury & Warm Elegance",
    styleName: "Contemporary Luxury & Warm Elegance",
    subtitle: "Timeless refinement, noble materials and a warm, luminous ambiance.",
    philosophy:
      "A prestigious aesthetic that elevates volumes through the warm contrast of dark walnut, the nobility of veined marble and the softness of curved boucl fabric seating.",
    img: moodboardDefault,
    components: [
      {
        category: "Woodwork & Millwork",
        items: ["Dark American walnut wall panels", "Vertical slat partitions and battens", "Backlit integrated bookcases"],
      },
      {
        category: "Stone & Surfaces",
        items: ["Calacatta white marble with gold/grey veining", "Contemporary quartz or marble fireplace", "Polished travertine table tops"],
      },
      {
        category: "Furniture & Textiles",
        items: ["Organic curved boucl ecru sofas", "Terracotta velvet accent armchairs", "Textured Merino wool rugs"],
      },
      {
        category: "Metallic Finishes & Décor",
        items: ["Brushed matte brass & warm bronze", "Sculptural ceramic vases", "Bronze-tinted mirrors"],
      },
      {
        category: "Forms",
        items: ["Contrast between straight architectural lines and furniture with organic shapes", "Curved boucl seating against linear walnut paneling", "Rectilinear marble surfaces paired with sculptural rounded objects"],
      },
    ],
    palette: [
      { hex: "#2C221E", name: "Espresso Walnut (Deep wood)" },
      { hex: "#C47A47", name: "Amber & Terracotta (Warm accent)" },
      { hex: "#E6DFD5", name: "Cream Travertine (Stone)" },
      { hex: "#96705B", name: "Sienna Earth (Transition)" },
      { hex: "#F4EFEA", name: "Ecru Linen (Soft light)" },
    ],
    idealRooms: [
      "Grand Living Rooms & Reception Spaces",
      "Premium Master Suites",
      "Character Dining Rooms",
      "Executive Offices & Libraries",
    ],
    lighting: "Warm indirect LED lighting (2700K) in light coves, sculptural brass pendants and soft-diffusion floor lamps.",
  },
  {
    id: "japandi-organic",
    title: "Japandi & Organic Minimalist",
    styleName: "Organic Minimalism & Japandi Spirit",
    subtitle: "A calming fusion of Scandinavian functionality and Japanese wabi-sabi artistry.",
    philosophy:
      "A serene, pared-back haven celebrating the imperfect beauty of raw materials, the clarity of low-profile lines and a communion with natural light.",
    img: moodboard1,
    components: [
      {
        category: "Woodwork & Millwork",
        items: ["Low solid light oak platform bed", "Modernized shoji-style light ash screens", "Monolithic raw wood coffee tables"],
      },
      {
        category: "Walls & Wall Coverings",
        items: ["Beige textured limewash plaster", "Matte brushed oak parquet flooring", "Natural felt acoustic panels"],
      },
      {
        category: "Organic Textiles",
        items: ["Unbleached washed linen bedding", "Natural waffle-weave cotton throws", "Braided jute and untreated wool rugs"],
      },
      {
        category: "Zen & Botanical Elements",
        items: ["Bonsai & dried eucalyptus branches", "Artisanal wabi-sabi ceramics", "Braided washi paper pendant lights"],
      },
      {
        category: "Forms",
        items: ["Straight architectural framework embracing softly irregular organic forms", "Low horizontal platform lines vs. hand-shaped asymmetric ceramics", "Geometric shoji screens contrasting with natural, imperfect silhouettes"],
      },
    ],
    palette: [
      { hex: "#EADCC9", name: "Soft Sand (Wall base)" },
      { hex: "#B59E7D", name: "Natural Oak (Furniture)" },
      { hex: "#5C5248", name: "Warm Clay (Terracotta)" },
      { hex: "#88927F", name: "Zen Sage Green (Botanical accent)" },
      { hex: "#36312C", name: "Wabi Anthracite (Contrast)" },
    ],
    idealRooms: [
      "Bedrooms & Zen Suites",
      "Intimate Living Rooms & Reading Nooks",
      "Yoga / Meditation Spaces",
      "Studios & Light-Filled Small Spaces",
    ],
    lighting: "Natural daylight flowing through, rice paper pendant lights casting a soft glow and ceramic table lamps.",
  },
  {
    id: "contemporary-chic",
    title: "Contemporary Architectural Chic",
    styleName: "Contemporary Architectural Chic",
    subtitle: "Bold geometry, sculptural contrasts and haute couture finishes.",
    philosophy:
      "A visual signature worthy of a modern art gallery, combining fluted travertine, brushed brass and emerald velvet for a decidedly sophisticated interior.",
    img: moodboard2,
    components: [
      {
        category: "Sculptural Furniture",
        items: ["Monolithic Roman travertine side tables", "Low-profile geometric modulay sofas", "Architect's chairs in patinated leather"],
      },
      {
        category: "Wood & Fluted Textures",
        items: ["Fluted wood paneling", "Flush invisible doors", "Recessed baseboards with shadow gaps"],
      },
      {
        category: "Editorial Textiles",
        items: ["Deep forest green silk velvet", "Textured ivory boucl fabric", "Cognac saddle leather with contrast stitching"],
      },
      {
        category: "Art & Ironwork",
        items: ["Brushed brass & matte black powder-coated steel", "Custom geometric mirrors", "Minimalist pedestal sculptures"],
      },
      {
        category: "Forms",
        items: ["Strict architectural geometry juxtaposed with fluid sculptural furniture", "Rigid vertical fluting softened by curved seating silhouettes", "Cubic monolithic volumes balanced by rounded organic accents"],
      },
   ],
   palette: [
      { hex: "#1F1F1F", name: "Architect Black (Frames & Profiles)" },
      { hex: "#D9CEBC", name: "Roman Travertine (Stone)" },
      { hex: "#B38B59", name: "Brushed Brass (Artistic finishes)" },
      { hex: "#4A5844", name: "Forest Green (Accent velvet)" },
      { hex: "#6E6860", name: "Mineral Grey (Micro-cement)" },
    ],
   idealRooms: [
      "Contemporary Living Rooms & Open Lofts",
      "Penthouses & Luxury Apartments",
      "Private Galleries & Grand Entrances",
      "High-End Conference Rooms",
    ],
    lighting: "Directional museum-style track spots, geometric brass wall sconces and contemporary chandeliers.",
  },
];

const SHOWCASE_SPACES: ShowcaseSpace[] = [
  {
    id: "luxury-lounge",
    panoramaId: "panorama_luxury_default",
    category: "luxury",
    title: "Walnut & Marble Grand Living Room",
    subtitle: "Warm amber coving lights, bookmatched marble fireplace, and curved boucl seating.",
    beforeImg: luxuryBefore,
    afterImg: luxuryAfter,
    styleName: "Modern Luxury",
    tags: ["Marble", "Walnut Panel", "Ambient Lighting"],
    dimensions: "6.2m ° 4.8m",
  },
  {
    id: "japandi-master",
    panoramaId: "panorama_japandi_default",
    category: "japandi",
    title: "Organic Japandi Master Suite",
    subtitle: "Low platform solid oak bed, limewash walls, slatted timber divider, and morning light.",
    beforeImg: luxuryBefore,
    afterImg: japandiAfter,
    styleName: "Japandi Minimalist",
    tags: ["Oak Wood", "Linen", "Limewash"],
    dimensions: "6.2m ° 4.8m",
  },
  {
   id: "contemporary-studio",
    panoramaId: "panorama_contemporary_default",
    category: "contemporary",
    title: "Contemporary Architectural Salon",
    subtitle: "Sculptural lighting, travertine accents, bespoke shelving, and seamless spatial flow.",
    beforeImg: luxuryBefore,
    afterImg: afterContemporary,
    styleName: "Contemporary Chic",
    tags: ["Travertine", "Matte Brass", "Sculptural"],
    dimensions: "6.2m ° 4.8m",
  },
];
function LandingPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showAfterOnlyMap, setShowAfterOnlyMap] = useState<Record<string, boolean>>({});
  const [selectedMoodboard, setSelectedMoodboard] = useState<MoodboardDetail | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingPanorama, setIsUploadingPanorama] = useState(false);

  const startCapture = async (moodboardKey?: string) => {
    try {
      const { projectId } = await createProject();
      setActiveProjectId(projectId);
      if (moodboardKey) {
        const mb = MOODBOARD_DETAILS.find((m) => m.id === moodboardKey);
        if (mb) {
          try {
            await saveVisionBoard({
              data: {
                projectId,
                image: mb.img,
              },
            });
          } catch (e) {
            console.warn("Could not pre-save vision board:", e);
          }
        }
      }
      await navigate({ to: "/capture" });
    } catch (error) {
      console.error("Could not start room capture:", error);
      toast.error("Starting capture session¦");
      await navigate({ to: "/capture" });
    }
  };

  const handlePanoramaUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || isUploadingPanorama) return;

    const reader = new FileReader();
    reader.onload = async () => {
      setIsUploadingPanorama(true);
      try {
        const { projectId } = await createProject();
        setActiveProjectId(projectId);
        await savePanorama({
          data: { projectId, image: String(reader.result) },
        });
        toast.success("360° Panorama uploaded! Entering VR°");
        navigate({ to: "/vr" });
      } catch (error) {
        console.error("Panorama upload error:", error);
        toast.error("Panorama upload failed. Check server connection.");
      } finally {
        setIsUploadingPanorama(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredSpaces = SHOWCASE_SPACES.filter(
    (space) => activeCategory === "all" || space.category === activeCategory
  );
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <AppHeader />
      <main className="space-y-16 sm:space-y-24 md:space-y-32">
        <section className="relative overflow-hidden pt-4 pb-12 sm:pt-8 sm:pb-20">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-accent/10 blur-[120px]" />
          <div className="pointer-events-none absolute top-1/3 -right-24 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span>Next-Gen Spatial 360° & VR Room Redesign</span>
              </div>
            </div>
            <div className="mt-6 text-center max-w-4xl mx-auto">
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.08]">
                Reimagine Your Space Into an {""}
                <span className="italic font-normal text-accent underline decoration-accent/30 underline-offset-8">
                  Interactive 360°
                </span>{""}
                Sanctuary
              </h1>
              <p className="mt-5 text-xs sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Snap photos of your current room, select your dream moodboard style, and watch AI reconstruct
                and redesign your interior into a photorealistic, immersive 360° VR experience.
              </p>
            </div>
            <div className="mt-10 sm:mt-14 relative max-w-5xl mx-auto">
              <div className="relative overflow-hidden rounded-[2.5em] border-2 border-border/80 bg-card shadow-2xl p-2 sm:p-4 backdrop-blur-sm">
                <BeforeAfterSlider aspectRatio="aspect-[16/10]" />
              </div>
            </div>
            <div className="mt-8 sm:mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
              <div
                onClick={() => startCapture()}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                  <Camera className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-serif text-base font-semibold">Capture My Room</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Snap multiple room photos & choose your moodboard.
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary group-hover:underline">
                  Start Capture <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
              <Link
                to="/vr"
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-300 hover:border-accent hover:shadow-ng hover:-translate-y-1"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-xs">
                  <Compass className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-serif text-base font-semibold">360° VR Experience</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Look around in 360° or walk in VR headset.
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-accent group-hover:underline">
                  Enter VR <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground shadow-xs">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-serif text-base font-semibold">Upload 360° Panorama</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Upload any equirectangular image file to view in 360°.
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary group-hover:underline">
                  {isUploadingPanorama ? "Uploading…" : "Upload Panorama"} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
              <Link
                to="/studio"
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-300 hover:border-border hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground shadow-xs">
                  <Box className="h-5 w-5 text-accent" />
                </div>
                <h3 className="mt-4 font-serif text-base font-semibold">3D Design Studing</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Customize layout, furniture & top ceiling views.
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-foreground group-hover:underline">
                  Open Studio <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePanoramaUpload}
            />
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end-justify-between gap-4">
            <div>
              <p className="label-mono">Before & After Showcase</p>
              <h2 className="mt-1.5 font-serif text-3xl sm:text-4xl font-semibold">
                Featured 360° <span className="text-accent italic font-normal">Transformations</span>
              </h2>
            </div>
            {/* <p className="max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Explore how raw empty spaces are transformed with AI-driven moodboard aesthetics into photorealistic 360° VR environments.
            </p> */}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Spaces" },
              { id: "luxury", label: "Modern Luxury" },
              { id: "japandi", label: "Japandi Minimalist" },
              { id: "contemporary", label: "Contemporary Chic" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  activeCategory === tab.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSpaces.map((space) => {
              const isAfter = showAfterOnlyMap[space.id] ?? true;
              return (
                <div
                  key={space.id}
                  className="group relative flex flex-col overflow-hidden rounded-[2em] border-2 border-border/80 bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/60"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-black/90">
                    <img
                      src={isAfter ? space.afterImg : space.beforeImg}
                      alt={space.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                      <Compass className="h-3.5 w-3.5 text-accent" />
                      <span>360° VR Ready</span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowAfterOnlyMap((prev) => ({
                           prev,
                           [space.id]: !isAfter,
                        }))
                      }
                      className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-foreground shadow-sm backdrop-blur-md hover:bg-white transition-all">
                      <Sliders className="h-3 w-3" />
                      <span>{isAfter ? "Showing: AFTER" : "Showing: BEFORE"}</span>
                    </button>

                    <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-mono text-white/90 backdrop-blur-md">
                       ° {space.dimensions}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-accent/15 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                        {space.styleName}
                      </span>
                    </div>

                    <h3 className="mt-3 font-serif text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                      {space.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed flex-1">
                      {space.subtitle}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {space.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                           {tag}
                        </span>
                      ))}
                    </div>

                    <Link
                      to="/vr"
                      search={{ pano: space.panoramaId }}
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Experience in 360° VR</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-[2.5em] border border-border/80 bg-gradient-to-br from-card to-secondary/30 p-8 sm:p-12 lg:p-16 shadow-lg">
            <div className="text-center max-w-2xl mx-auto">
              <p className="label-mono">How It Works</p>
              <h2 className="mt-1.5 font-serif text-3xl sm:text-4xl font-semibold">
                Three Steps to Your <span className="text-accent italic font-normal">Dream Space</span>
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                From simple smartphone pictures to a fully realized 360° interior walkthrough.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="relative flex flex-col rounded-2xl border border-border/80 bg-background/80 p-6 shadow-sm backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-serif text-lg font-bold">
                  01
                </div>
                <h3 className="mt-5 font-serif text-lg font-semibold">Multi-Shot Room Capture</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed flex-1">
                  Snap clear photos of your room walls. Review all your shots in a visual gallery and choose only the best angles to save.
                </p>
                <div className="mt-4 pt-4 border-t border-border/60 flex items-center gap-2 text-xs font-semibold text-primary">
                  <CheckCircle2 className="h-4 w-4 text-accent" /> No LiDAR needed
                </div>
              </div>

              <div className="relative flex flex-col rounded-2xl border border-border/80 bg-background/80 p-6 shadow-sm backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground font-serif text-lg font-bold">
                  02
                </div>
                <h3 className="mt-5 font-serif text-lg font-semibold">Curated Moodboard Styling</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed flex-1">
                  Select your desired aesthetic ° Modern Luxury, Japandi Minimalist, or Architectural Chic. Our AI adapts the lighting, textures, and furniture.
                </p>
                <div className="mt-4 pt-4 border-t border-border/60 flex items-center gap-2 text-xs font-semibold text-accent">
                  <CheckCircle2 className="h-4 w-4 text-accent" /> Photoreal Materials
                </div>
              </div>

              <div className="relative flex flex-col rounded-2xl border border-border/80 bg-background/80 p-6 shadow-sm backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-serif text-lg font-bold">
                  03
                </div>
                <h3 className="mt-5 font-serif text-lg font-semibold">360° Spatial & VR Tour</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed flex-1">
                  Step right into your redesigned space. Look in 360° with smooth orbit controls or put on a VR headset for real-scale presence.
                </p>
                <div className="mt-4 pt-4 border-t border-border/60 flex items-center gap-2 text-xs font-semibold text-primary">
                  <CheckCircle2 className="h-4 w-4 text-accent" /> WebXR & Mobile Ready
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end-justify-between gap-4">
            <div>
              <p className="label-mono">Interior Aesthetics</p>
              <h2 className="mt-1.5 font-serif text-3xl sm:text-4xl font-semibold">
                Curated Design <span className="text-accent italic font-normal">Moodboards</span>
              </h2>
            </div>
            {/* <p className="text-xs text-muted-foreground">
               <em>Click on any moodboard card to explore full styling details, materials, and color palette.</em>
            </p> */}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {MOODBOARD_DETAILS.map((mb) => (
              <div
                key={mb.id}
                onClick={() => setSelectedMoodboard(mb)}
                className="group relative flex flex-col overflow-hidden rounded-[2em] border-2 border-border/84 bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-2xl hover:border-accent hover:-translate-y-1.5 cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-black/10">
                  <img
                      src={mb.img}
                      alt={mb.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-foreground shadow-lg flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-accent" /> Inspect Moodboard
                      </span>
                    </div>
                </div>

                <div className="mt-4 flex flex-1 flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-base font-semibold group-hover:text-accent transition-colors">
                      {mb.title}
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed flex-1 line-clamp-2">
                    {mb.subtitle}
                  </p>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">Palette:</span>
                      <div className="flex gap-1">
                        {mb.palette.map((color, i) => (
                          <span
                            key={i}
                            style={{ backgroundColor: color.hex }}
                            className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-2xs"
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-primary group-hover:underline flex items-center gap-1">
                      View Details °
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="label-mono">Precision & Quality</p>
            <h2 className="mt-1.5 font-serif text-3xl sm:text-4xl font-semibold">
              Why Choose <span className="text-accent italic font-normal">Roomcast Studio</span>
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-serif text-base font-semibold">Exact 1:1 Scale Geometry</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Walls, openings, and ceilings maintain true architectural dimensions so your designs actually fit.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-serif text-base font-semibold">Instant AI Transformation</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Go from photos to high-resolution 360° panoramic redesigns in minutes without 3D CAD modeling.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground">
                <Award className="h-5 w-5 text-accent" />
              </div>
              <h3 className="mt-4 font-serif text-base font-semibold">Immersive WebXR & VR</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Experience full immersion on mobile, desktop, or Apple Vision Pro & Meta Quest headsets.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
          <div className="relative overflow-hidden rounded-[2.5em] border border-border/80 bg-primary p-8 sm:p-14 text-primary-foreground shadow-2xl text-center">
            <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

            <div className="relative max-w-2xl mx-auto">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight">
                Ready to Experience Your Room in 360°?
              </h2>
              <p className="mt-4 text-xs sm:text-sm md:text-base text-primary-foreground/80 leading-relaxed">
                Snap photos of your space now, select your moodboard, and step inside your redesigned sanctuary.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  onClick={() => startCapture()}
                  className="rounded-full bg-accent text-accent-foreground font-semibold px-8 hover:bg-accent/90 shadow-lg">
                    <Camera className="mr-2 h-4 w-4" /> Capture My Room
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20"
                >
                  <Link to="/vr">
                    <Compass className="mr-2 h-4 w-4" /> View 360° VR
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      {selectedMoodboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5em] border-2 border-border/84 bg-card p-6 sm:p-8 shadow-2xl text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedMoodboard(null)}
              className="absolute top-6 right-6 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 border border-border shadow-sm hover:bg-secondary transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl bg-black/10 border border-border/60">
              <img
                src={selectedMoodboard.img}
                alt={selectedMoodboard.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-semibold">
                  {selectedMoodboard.styleName}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold">
                  {selectedMoodboard.title}
                </h2>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-serif text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                Style Philosophy & Ambiance
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {selectedMoodboard.philosophy}
              </p>
            </div>


            <div className="mt-6 pt-6 border-t border-border/60">
              <h3 className="font-serif text-base font-semibold flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Color Palette & Tones
              </h3>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {selectedMoodboard.palette.map((color, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/80 p-2.5">
                    <span
                      style={{ backgroundColor: color.hex }}
                      className="h-7 w-7 flex-shrink-0 rounded-lg border border-black/15 shadow-xs"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-xs font-bold text-foreground">{color.hex}</span>
                      <span className="text-[11px] text-muted-foreground truncate">{color.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border/60">
              <h3 className="font-serif text-base font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent" />
                Key Components & Materials
              </h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {selectedMoodboard.components.map((comp, i) => (
                  <div key={i} className="rounded-xl border border-border/60 bg-background/60 p-4">
                    <h4 className="font-serif text-xs font-bold text-foreground uppercase tracking-wider">
                      {comp.category}
                    </h4>
                    <ul className="mt-2 space-y-1.5">
                      {comp.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-accent flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                    ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border/60">
              <h3 className="font-serif text-base font-semibold flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                Ideal For Which Room Types?
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedMoodboard.idealRooms.map((room, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                    {room}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-secondary/50 p-3.5 border border-border/60 text-xs text-muted-foreground leading-relaxed">
               <strong>Lighting Tip:</strong> {selectedMoodboard.lighting}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
              <Button
                size="lg"
                onClick={() => {
                  const mbId = selectedMoodboard.id;
                  setSelectedMoodboard(null);
                  void startCapture(mbId);
                }}
                className="flex-1 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-md"
              >
                <Camera className="mr-2 h-4 w-4" /> Apply This Moodboard & Capture My Room 
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setSelectedMoodboard(null)}
                className="rounded-full border-border hover:bg-secondary">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}


      <footer className="border-t border-border/80 bg-card py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-serif font-semibold text-foreground text-sm">Roomcast Studio</span>
            <span> 360° AI Interior Redesign & WebXR</span>
          </div>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <Link to="/studio" className="hover:text-foreground">3D Studio</Link>
            <Link to="/capture" className="hover:text-foreground">Capture Room</Link>
            <Link to="/vr" className="hover:text-foreground">360° VR</Link>
            <Link to="/plan" className="hover:text-foreground">Floor Plan</Link>
          </div>
          <div> 2026 Roomcast Studio. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

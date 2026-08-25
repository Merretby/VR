import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";

import { useDict, format } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, Upload, ArrowRight, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ProjectConsultationPage,
});

function ProjectConsultationPage() {
  const d = useDict();
  const c = d.contact;

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState("");
  const [projectTypes, setProjectTypes] = useState<string[]>([]);
  const [stage, setStage] = useState("");
  const [location, setLocation] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const profiles = [
    "Particulier",
    "Indépendant",
    "Commerce / Restaurant",
    "Bureau / Entreprise",
    "Professionnel de santé",
    "Autre",
  ];

  const projectOptions = [
    "Rénovation",
    "Aménagement",
    "Sur-mesure",
    "Transformation",
    "Identité",
    "Site web",
    "Digital",
    "Espace + Digital",
    "Autre",
  ];

  const stages = [
    "J’ai une idée",
    "Je prépare le projet",
    "J’ai déjà un local",
    "Je transforme un espace existant",
    "Les travaux sont à programmer",
    "Le projet est déjà conçu",
  ];

  const toggleProjectType = (type: string) => {
    if (projectTypes.includes(type)) {
      setProjectTypes(projectTypes.filter((t) => t !== type));
    } else {
      setProjectTypes([...projectTypes, type]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      toast.success(`${e.target.files.length} file(s) added`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success(c.successTitle);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <AppHeader current="/contact" />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-12">
        {/* HERO */}
        <section className="text-center space-y-4 pt-4">
          <span className="label-mono text-accent">{c.label}</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight">
            {c.titleA}<br />
            <span className="italic font-normal text-muted-foreground">{c.titleB}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            {c.subtitle}
          </p>
        </section>

        {!submitted && (
          <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto border-b border-border/60 pb-6">
            {[1, 2, 3, 4, 5].map((stepNum) => {
              const isPast = stepNum < currentStep;
              const isCurrent = stepNum === currentStep;
              return (
                <div key={stepNum} className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                      isCurrent
                        ? "bg-primary text-primary-foreground shadow-md scale-110"
                        : isPast
                        ? "bg-emerald-500 text-white"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isPast ? "✓" : `0${stepNum}`}
                  </div>
                  {stepNum < 5 && <div className="h-0.5 w-6 sm:w-12 bg-border hidden sm:block" />}
                </div>
              );
            })}
          </div>
        )}

        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-6">
              <div className="h-16 w-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="font-serif text-3xl font-bold">{c.successTitle}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                {format(c.successDesc, { fullName: fullName || "Client" })}
              </p>
              
              <Button onClick={() => { setSubmitted(false); setCurrentStep(1); }} variant="outline" className="rounded-full mt-4">
                {c.btnAnother}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* STEP 01 */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="label-mono text-accent">{c.step1Label}</span>
                    <h2 className="font-serif text-2xl font-bold">{c.step1Title}</h2>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {profiles.map((p) => {
                      const isSel = profile === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setProfile(p)}
                          className={`p-4 rounded-2xl border text-left text-xs font-semibold transition-all ${
                            isSel
                              ? "border-primary bg-primary/10 text-primary shadow-xs"
                              : "border-border/80 bg-secondary/40 text-foreground hover:bg-secondary"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 02 */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="label-mono text-accent">{c.step2Label}</span>
                    <h2 className="font-serif text-2xl font-bold">{c.step2Title}</h2>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {projectOptions.map((opt) => {
                      const isSel = projectTypes.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleProjectType(opt)}
                          className={`p-4 rounded-2xl border text-left text-xs font-semibold transition-all ${
                            isSel
                              ? "border-primary bg-primary/10 text-primary shadow-xs"
                              : "border-border/80 bg-secondary/40 text-foreground hover:bg-secondary"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 03 */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="label-mono text-accent">{c.step3Label}</span>
                    <h2 className="font-serif text-2xl font-bold">{c.step3Title}</h2>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {stages.map((stg) => {
                      const isSel = stage === stg;
                      return (
                        <button
                          key={stg}
                          type="button"
                          onClick={() => setStage(stg)}
                          className={`p-4 rounded-2xl border text-left text-xs font-semibold transition-all ${
                            isSel
                              ? "border-primary bg-primary/10 text-primary shadow-xs"
                              : "border-border/80 bg-secondary/40 text-foreground hover:bg-secondary"
                          }`}
                        >
                          {stg}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 04 */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="label-mono text-accent">{c.step4Label}</span>
                    <h2 className="font-serif text-2xl font-bold">{c.step4Title}</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="location" className="text-xs">{c.lblCity}</Label>
                      <Input id="location" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder={c.lblCityPlaceholder} className="rounded-xl text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-xs">{c.lblName}</Label>
                      <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={c.lblNamePlaceholder} className="rounded-xl text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs">{c.lblEmail}</Label>
                      <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={c.lblEmailPlaceholder} className="rounded-xl text-xs" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 05 */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="label-mono text-accent">{c.step5Label}</span>
                    <h2 className="font-serif text-2xl font-bold">{c.step5Title}</h2>
                    <p className="text-xs text-muted-foreground">{c.step5Subtitle}</p>
                  </div>

                  <div className="border-2 border-dashed border-border/80 rounded-2xl p-6 text-center space-y-3 bg-secondary/30">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                    <span className="text-xs font-semibold block">{c.step5Subtitle}</span>
                    <Input type="file" multiple onChange={handleFileUpload} className="hidden" id="file-upload" />
                    <Label htmlFor="file-upload" className="inline-flex cursor-pointer rounded-full bg-secondary px-4 py-2 text-xs font-bold hover:bg-border">
                      {c.btnFileBrowse}
                    </Label>
                    {files.length > 0 && <div className="text-xs text-primary font-mono pt-2">{files.length} file(s) attached</div>}
                  </div>
                </div>
              )}

              {/* NAV BUTTONS */}
              <div className="flex items-center justify-between border-t border-border/60 pt-6">
                {currentStep > 1 ? (
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)} className="rounded-full text-xs font-semibold">
                    <ArrowLeft className="mr-2 h-3.5 w-3.5" /> {c.btnPrev}
                  </Button>
                ) : <div />}

                {currentStep < 5 ? (
                  <Button type="button" onClick={() => setCurrentStep(currentStep + 1)} className="rounded-full text-xs font-bold px-6">
                    {c.btnNext} <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading} className="rounded-full text-xs font-bold px-8 py-3 bg-primary text-primary-foreground">
                    {loading ? c.btnSubmitting : c.btnSubmit}
                  </Button>
                )}
              </div>
            </form>
          )}

          
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Building2,
} from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Nous contacter — Roomcast Studio" },
      {
        name: "description",
        content:
          "Contactez notre équipe pour vos projets d'architecture d'intérieur, modélisation 3D et rendus 360° VR.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Votre message a été envoyé avec succès !");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <AppHeader current="/contact" />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        {/* Header */}
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            <span>Support & Demande de Projet</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight">
            Nous Contacter
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Une question sur la conception 3D, l'intégration des moodboards ou une demande de projet sur mesure ? Notre équipe vous répond sous 24h.
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-12 max-w-5xl mx-auto">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
              <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Coordonnées & Support
              </h2>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-secondary/50 border border-border/50">
                  <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-foreground">Email</span>
                    <a href="mailto:boutiquepokibois@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                      boutiquepokibois@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-secondary/50 border border-border/50">
                  <Phone className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-foreground">Téléphone</span>
                    <span className="text-muted-foreground">+33 (0)1 89 20 40 50</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-secondary/50 border border-border/50">
                  <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-foreground">Horaires d'ouverture</span>
                    <span className="text-muted-foreground">Du Lundi au Vendredi, 9h - 19h</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-3">
              <h3 className="font-serif text-base font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-accent" />
                Service Sur Mesure
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nous accompagnons les cabinets médicaux, architectes et particuliers dans la concrétisation de leurs espaces virtuels 360° VR.
              </p>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="h-14 w-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold">Message Envoyé !</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                    Merci pour votre message. Un membre de notre équipe vous recontactera très prochainement.
                  </p>
                  <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-full mt-4">
                    Envoyer une autre demande
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="font-serif text-xl font-semibold mb-4">Envoyez-nous un Message</h2>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-xs">Nom complet</Label>
                      <Input id="fullName" required placeholder="Jean Dupont" className="rounded-xl text-xs" />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs">Adresse Email</Label>
                      <Input id="email" type="email" required placeholder="jean@exemple.com" className="rounded-xl text-xs" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-xs">Type de Projet</Label>
                    <Input id="subject" placeholder="Ex: Amenagement Cabinet Médical, Cuisine, Appartement..." className="rounded-xl text-xs" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-xs">Votre Message</Label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      placeholder="Décrivez votre projet ou votre demande..."
                      className="w-full rounded-xl border border-input bg-background p-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full rounded-xl font-semibold py-2.5 shadow-md">
                    {loading ? "Envoi en cours..." : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import { Info, CheckCircle2, Phone, Mail, MapPin } from "lucide-react";
import { useDict, useI18n } from "@/lib/i18n";

const CONTACT_PLACEHOLDER_REGEX = /téléphone|phone|email|e-mail|localisation|location/i;

export function PlaceholderBadge({ text }: { text: string }) {
  const d = useDict();
  const { lang } = useI18n();

  const isContactInfo = CONTACT_PLACEHOLDER_REGEX.test(text);

  if (isContactInfo) {
    return (
      <div className="my-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span>{lang === "fr" ? "INFORMATIONS POKIBOIS COMPLÉTÉES" : "POKIBOIS COMPLETED INFORMATION"}</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 text-xs text-foreground font-medium pt-1 border-t border-amber-500/20">
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-amber-600" />
            <a href="tel:+33142685500" className="hover:underline">+33 1 42 68 55 00</a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-amber-600" />
            <a href="mailto:boutiquepokibois@gmail.com" className="hover:underline">boutiquepokibois@gmail.com</a>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-amber-600" />
            <span>142 Blvd Saint-Germain, Paris</span>
          </div>
        </div>
      </div>
    );
  }

  const cleanText = text.replace(/^\s*\[?\s*/, "").replace(/\s*\]?\s*$/, "");
  const badgeTitle = d.badge?.title ?? (lang === "en" ? "INFORMATION TO COMPLETE" : "INFORMATION À COMPLÉTER");

  return (
    <div className="my-6 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-4 flex items-start gap-3.5 text-xs text-amber-900 dark:text-amber-200 font-mono shadow-xs backdrop-blur-xs">
      <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <span className="font-bold tracking-widest text-[10px] uppercase block text-amber-700 dark:text-amber-400">
          {badgeTitle}
        </span>
        <p className="leading-relaxed font-sans font-medium text-xs text-amber-900/90 dark:text-amber-200/90">
          [{cleanText}]
        </p>
      </div>
    </div>
  );
}

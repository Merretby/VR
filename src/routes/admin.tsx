import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminData, deleteProject } from "@/lib/photos";
import { format, useDict } from "@/lib/i18n";
import moodboardDefault from "@/assets/moodboards/moodbord.jpg";
import moodboard1 from "@/assets/moodboards/moodbord-1.jpg";
import moodboard2 from "@/assets/moodboards/moodbord-2.jpg";
import { MOODBOARD_PROMPTS } from "@/lib/prompts";
import {
  Lock,
  User,
  LogOut,
  Folder,
  Image as ImageIcon,
  FileText,
  Trash2,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Compass,
  AlertCircle,
  Sparkles,
  Palette,
  X,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — Roomcast Studio" },
      { name: "description", content: "Administrator control panel for Roomcast Studio." },
    ],
  }),
  component: AdminPage,
});

interface ProjectRecord {
  id: string;
  created_at: string;
  vision_board_path: string | null;
  name: string | null;
  prompt: string | null;
  image_count: number | null;
}

interface PhotoRecord {
  id: string;
  wall_key: string | null;
  file_path: string;
  project_id: string;
  created_at: string;
}

interface PanoramaRecord {
  id: string;
  project_id: string;
  file_path: string;
  designed_file_path: string | null;
  status: string;
  created_at: string;
}

type MoodboardTemplateId = "luxury-warm" | "japandi-organic" | "contemporary-chic";

const MOODBOARD_TEMPLATES: {
  id: MoodboardTemplateId;
  image: string;
  promptKey: string;
}[] = [
  {
    id: "luxury-warm",
    image: moodboardDefault,
    promptKey: "luxury-warm",
  },
  {
    id: "japandi-organic",
    image: moodboard1,
    promptKey: "japandi-organic",
  },
  {
    id: "contemporary-chic",
    image: moodboard2,
    promptKey: "contemporary-chic",
  },
];

function AdminPage() {
  const navigate = useNavigate();
  const d = useDict();

  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Data states
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [panoramas, setPanoramas] = useState<PanoramaRecord[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // UI states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedPromptId, setExpandedPromptId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [copiedTemplateKey, setCopiedTemplateKey] = useState<string | null>(null);

  // Check login on mount
  useEffect(() => {
    const session = localStorage.getItem("roomcast_admin_session");
    if (session === "true") {
      setIsLoggedIn(true);
      loadDashboardData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin1") {
      localStorage.setItem("roomcast_admin_session", "true");
      setIsLoggedIn(true);
      setLoginError("");
      toast.success(d.admin.welcomeBack);
      loadDashboardData();
    } else {
      setLoginError(d.admin.invalidCredentials);
      toast.error(d.admin.authFailed);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("roomcast_admin_session");
    setIsLoggedIn(false);
    setProjects([]);
    setPhotos([]);
    setPanoramas([]);
    toast.info(d.admin.loggedOut);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await getAdminData();
      if (res && res.success) {
        setProjects(res.projects as ProjectRecord[]);
        setPhotos(res.photos as PhotoRecord[]);
        setPanoramas(res.panoramas as PanoramaRecord[]);
      }
    } catch (error) {
      console.error("Failed to load admin data:", error);
      toast.error(d.admin.fetchFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm(format(d.admin.confirmDeleteProject, { id: projectId }))) {
      return;
    }

    try {
      setDeletingId(projectId);
      const res = await deleteProject({ data: projectId });
      if (res && res.success) {
        toast.success(format(d.admin.projectDeleted, { id: projectId }));
        // Remove locally
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        setPhotos((prev) => prev.filter((ph) => ph.project_id !== projectId));
        setPanoramas((prev) => prev.filter((p) => p.project_id !== projectId));
      }
    } catch (error) {
      console.error("Delete project error:", error);
      toast.error(d.admin.deleteFailed);
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success(d.admin.projectIdCopied);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPhotosForProject = (projectId: string) => {
    return photos.filter((ph) => ph.project_id === projectId);
  };

  const getPanoramasForProject = (projectId: string) => {
    return panoramas.filter((p) => p.project_id === projectId);
  };

  // Render Login Phase
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between">
        <AppHeader current="/admin" />

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-neutral-800 border border-neutral-700 text-primary mb-2">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold font-serif">{d.admin.loginTitle}</h2>
              <p className="text-xs text-neutral-400">{d.admin.loginSubtitle}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">{d.admin.username}</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                    <User className="h-4 w-4" />
                  </span>
                  <Input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={d.admin.usernamePlaceholder}
                    className="pl-10 bg-neutral-950 border-neutral-800 focus:border-primary text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">{d.admin.password}</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={d.admin.passwordPlaceholder}
                    className="pl-10 bg-neutral-950 border-neutral-800 focus:border-primary text-white"
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-xl font-medium shadow-lg transition-all"
              >
                {d.admin.authenticate}
              </Button>
            </form>
          </div>
        </div>

        <footer className="py-6 border-t border-neutral-900 text-center text-xs text-neutral-500">
          Roomcast Studio &copy; {new Date().getFullYear()} · {d.admin.securedFooter}
        </footer>
      </div>
    );
  }

  // Render Dashboard Phase
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between">
      <AppHeader current="/admin" />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Dashboard Title Panel */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-6">
          <div className="space-y-1">
            <p className="text-[10px] tracking-widest font-mono text-primary uppercase">
              {d.admin.managementDashboard}
            </p>
            <h1 className="text-3xl font-semibold font-serif">{d.admin.controlCenter}</h1>
            <p className="text-xs text-neutral-400">{d.admin.controlCenterSubtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboardData}
              disabled={loading}
              className="bg-red-950 border border-red-900/40 text-red-300 hover:bg-red-900 hover:text-white text-xs"
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              {d.admin.refreshData}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="bg-red-950 border border-red-900/40 text-red-300 hover:bg-red-900 hover:text-white text-xs"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              {d.admin.logOut}
            </Button>
          </div>
        </div>

        {/* Counter Summary Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5 flex items-center justify-between shadow-md">
            <div className="space-y-1">
              <span className="text-[10px] text-neutral-500 font-mono uppercase">
                {d.admin.totalProjects}
              </span>
              <p className="text-3xl font-semibold font-serif">{projects.length}</p>
            </div>
            <div className="p-3 bg-neutral-850 border border-neutral-800 rounded-xl text-primary">
              <Folder className="h-5 w-5" />
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5 flex items-center justify-between shadow-md">
            <div className="space-y-1">
              <span className="text-[10px] text-neutral-500 font-mono uppercase">
                {d.admin.capturedPhotos}
              </span>
              <p className="text-3xl font-semibold font-serif">{photos.length}</p>
            </div>
            <div className="p-3 bg-neutral-850 border border-neutral-800 rounded-xl text-purple-400">
              <ImageIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5 flex items-center justify-between shadow-md">
            <div className="space-y-1">
              <span className="text-[10px] text-neutral-500 font-mono uppercase">
                {d.admin.panoramasCount}
              </span>
              <p className="text-3xl font-semibold font-serif">{panoramas.length}</p>
            </div>
            <div className="p-3 bg-neutral-850 border border-neutral-800 rounded-xl text-teal-400">
              <Compass className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Moodboard Templates Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-850 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h2 className="text-xl font-bold font-serif text-amber-100 tracking-wide">
                  {d.admin.templatesTitle}
                </h2>
              </div>
              <p className="text-xs text-neutral-400 mt-1">{d.admin.templatesSubtitle}</p>
            </div>
            {/* <div className="flex items-center gap-2 text-xs text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              <FileText className="h-3.5 w-3.5 text-amber-400" />
              <span>Editable in <code className="font-mono text-[11px] text-amber-200">src/lib/prompts.ts</code></span>
            </div> */}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {MOODBOARD_TEMPLATES.map((mb) => {
              const isSelected = selectedTemplateId === mb.id;
              const promptText = MOODBOARD_PROMPTS[mb.promptKey] || "";
              const isCopied = copiedTemplateKey === mb.id;
              const mbDict = d.admin.templates[mb.id];

              return (
                <div
                  key={mb.id}
                  className={`group relative bg-gradient-to-b from-neutral-900/90 to-neutral-950/90 border rounded-3xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between ${
                    isSelected
                      ? "border-amber-400 ring-2 ring-amber-400/20 shadow-2xl shadow-amber-500/10 scale-[1.02]"
                      : "border-neutral-800/80 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5"
                  }`}
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-neutral-950">
                      <img
                        src={mb.image}
                        alt={mbDict.name}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-80" />
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 bg-black/75 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[11px] px-3 py-1 rounded-full font-medium shadow-md">
                          <Palette className="h-3 w-3 text-amber-400" />
                          {mbDict.tag}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="text-base font-bold font-serif text-amber-50 group-hover:text-amber-300 transition-colors">
                        {mbDict.name}
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                        {mbDict.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex gap-2">
                    <Button
                      variant="default"
                      className={`flex-1 text-xs py-2.5 rounded-xl h-auto font-semibold transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-md shadow-amber-400/20 border border-amber-300"
                          : "bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-amber-300 border border-amber-500/30"
                      }`}
                      onClick={() => setSelectedTemplateId(isSelected ? null : mb.id)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {isSelected ? d.admin.hidePrompt : d.admin.viewPrompt}
                    </Button>
                    <Button
                      variant="outline"
                      className={`text-xs py-2.5 px-3.5 rounded-xl h-auto font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                        isCopied
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold"
                          : "bg-neutral-850 hover:bg-neutral-750 text-neutral-200 border-neutral-700 hover:border-neutral-600"
                      }`}
                      onClick={() => {
                        navigator.clipboard.writeText(promptText);
                        setCopiedTemplateKey(mb.id);
                        toast.success(format(d.admin.copiedPromptFor, { name: mbDict.name }));
                        setTimeout(() => setCopiedTemplateKey(null), 2000);
                      }}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{d.admin.copied}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-neutral-400" />
                          <span>{d.admin.copy}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedTemplateId &&
            (() => {
              const currentTemplate = MOODBOARD_TEMPLATES.find((t) => t.id === selectedTemplateId);
              const promptText = MOODBOARD_PROMPTS[currentTemplate?.promptKey || ""] || "";
              const isCopied = copiedTemplateKey === selectedTemplateId;
              const currentDict = currentTemplate
                ? d.admin.templates[currentTemplate.id]
                : undefined;

              return (
                <div className="relative bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-2xl shadow-amber-500/5 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="flex flex-wrap justify-between items-center gap-3 border-b border-neutral-850 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold font-serif text-amber-100">
                            {currentDict?.name}
                          </h3>
                          <span className="text-[10px] font-mono uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                            {d.admin.systemPrompt}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                          {format(d.admin.usedByPipeline, {
                            style: currentTemplate?.promptKey || currentDict?.name || "",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className={`text-xs px-4 py-2 h-auto rounded-xl font-semibold transition-all shadow-md ${
                          isCopied
                            ? "bg-emerald-500 text-neutral-950 hover:bg-emerald-400"
                            : "bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-amber-400/20"
                        }`}
                        onClick={() => {
                          navigator.clipboard.writeText(promptText);
                          setCopiedTemplateKey(selectedTemplateId);
                          toast.success(d.admin.fullPromptCopied);
                          setTimeout(() => setCopiedTemplateKey(null), 2000);
                        }}
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1.5" />
                            {d.admin.copiedToClipboard}
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 mr-1.5" />
                            {d.admin.copyFullPrompt}
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl h-auto py-2 px-3 text-xs"
                        onClick={() => setSelectedTemplateId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="relative bg-black/90 border border-neutral-850 rounded-2xl p-5 font-mono text-xs text-neutral-300 leading-relaxed max-h-[420px] overflow-y-auto whitespace-pre-wrap selection:bg-amber-500 selection:text-black">
                    {promptText}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-neutral-400 bg-neutral-900/60 border border-neutral-800 rounded-xl p-3">
                    <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>{d.admin.howToModifyLabel}</strong> {d.admin.howToModifyBefore}
                      <code className="font-mono text-amber-300 bg-black/50 px-1.5 py-0.5 rounded border border-amber-500/20">
                        src/lib/prompts.ts
                      </code>
                      {d.admin.howToModifyAfter}
                    </span>
                  </div>
                </div>
              );
            })()}
        </div>

        {/* Main Workspace List */}
        <div className="space-y-4">
          <div className="border-b border-neutral-900 pb-2">
            <h2 className="text-lg font-semibold font-serif">{d.admin.activeProjects}</h2>
            <p className="text-xs text-neutral-400">{d.admin.activeProjectsSubtitle}</p>
          </div>

          {loading && projects.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-neutral-900/40 border border-neutral-800/40 rounded-3xl">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-neutral-400">{d.admin.syncing}</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-neutral-900/40 border border-neutral-800/40 rounded-3xl">
              <Folder className="h-8 w-8 mx-auto text-neutral-600" />
              <h3 className="text-base font-medium">{d.admin.noProjects}</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">{d.admin.noProjectsBody}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {projects.map((project) => {
                const projectPhotos = getPhotosForProject(project.id);
                const projectPanos = getPanoramasForProject(project.id);
                const hasPrompt = Boolean(project.prompt);
                const isPromptExpanded = expandedPromptId === project.id;

                return (
                  <div
                    key={project.id}
                    className="bg-neutral-900 border border-neutral-800/70 rounded-3xl overflow-hidden shadow-xl"
                  >
                    {/* Project Header Bar */}
                    <div className="p-6 bg-neutral-900/80 border-b border-neutral-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-neutral-200">
                            {project.name || d.admin.unnamedCapture}
                          </span>
                          <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded-md text-neutral-400 font-mono">
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                          <span className="font-mono">{project.id}</span>
                          <button
                            onClick={() => copyToClipboard(project.id)}
                            className="hover:text-primary transition-colors cursor-pointer"
                            title={d.admin.copyProjectId}
                          >
                            {copiedId === project.id ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deletingId === project.id}
                        onClick={() => handleDeleteProject(project.id)}
                        className="bg-red-950/60 text-red-400 hover:bg-red-900 hover:text-white border border-red-900/30 text-xs px-3.5 py-1.5 rounded-xl h-auto"
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        {deletingId === project.id ? d.admin.deleting : d.admin.deleteProject}
                      </Button>
                    </div>

                    {/* Project Details Panel */}
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left: Selected Moodboard Vision Board */}
                      <div className="lg:col-span-3 space-y-2">
                        <span className="text-[10px] text-neutral-500 font-mono uppercase block">
                          {d.admin.selectedMoodboard}
                        </span>
                        {project.vision_board_path ? (
                          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-neutral-800 group bg-neutral-950">
                            <img
                              src={project.vision_board_path}
                              alt={d.admin.visionBoardAlt}
                              className="w-full h-full object-cover"
                            />
                            <a
                              href={project.vision_board_path}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all gap-1.5 text-xs font-semibold"
                            >
                              <ExternalLink className="h-4 w-4" /> {d.admin.openFull}
                            </a>
                          </div>
                        ) : (
                          <div className="aspect-[16/10] rounded-2xl border border-dashed border-neutral-800 flex flex-col items-center justify-center text-center p-4 bg-neutral-950/40 text-neutral-600">
                            <ImageIcon className="h-5 w-5 mb-1.5" />
                            <span className="text-[10px]">{d.admin.noMoodboard}</span>
                          </div>
                        )}
                      </div>

                      {/* Middle: Photos Uploaded (Wall Keys) */}
                      <div className="lg:col-span-5 space-y-2">
                        <span className="text-[10px] text-neutral-500 font-mono uppercase block">
                          {format(d.admin.photosCount, { count: projectPhotos.length })}
                        </span>
                        {projectPhotos.length > 0 ? (
                          <div className="grid grid-cols-4 gap-2">
                            {projectPhotos.map((photo) => (
                              <div
                                key={photo.id}
                                className="relative aspect-square rounded-xl overflow-hidden border border-neutral-800 group bg-neutral-950"
                              >
                                <img
                                  src={photo.file_path}
                                  alt={photo.wall_key || d.admin.photoAltFallback}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 inset-x-0 bg-black/80 py-0.5 text-[8px] text-center font-mono truncate text-neutral-400 group-hover:text-white">
                                  {photo.wall_key || d.admin.captureFallback}
                                </div>
                                <a
                                  href={photo.file_path}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-20 rounded-2xl border border-dashed border-neutral-800 flex flex-col items-center justify-center text-center p-4 bg-neutral-950/40 text-neutral-600">
                            <ImageIcon className="h-5 w-5 mb-1" />
                            <span className="text-[10px]">{d.admin.noPhotos}</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Panoramas Redesign Output */}
                      <div className="lg:col-span-4 space-y-2">
                        <span className="text-[10px] text-neutral-500 font-mono uppercase block">
                          {d.admin.generatedOutput}
                        </span>
                        {projectPanos.length > 0 ? (
                          <div className="space-y-3">
                            {projectPanos.map((pano) => {
                              const isCompleted =
                                pano.status === "completed" && pano.designed_file_path;
                              return (
                                <div
                                  key={pano.id}
                                  className="flex items-center gap-3 p-3 bg-neutral-950/80 rounded-2xl border border-neutral-800/80"
                                >
                                  <div className="h-12 w-20 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 shrink-0">
                                    <img
                                      src={pano.designed_file_path || pano.file_path}
                                      alt={d.admin.panoramaAlt}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0 space-y-0.5">
                                    <p className="text-[10px] font-mono text-neutral-400 truncate">
                                      {pano.id}
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className={`inline-block w-1.5 h-1.5 rounded-full ${
                                          pano.status === "completed"
                                            ? "bg-green-500 animate-pulse"
                                            : pano.status === "processing"
                                              ? "bg-yellow-500 animate-bounce"
                                              : "bg-neutral-600"
                                        }`}
                                      />
                                      <span className="text-[10px] text-neutral-300 font-medium capitalize">
                                        {pano.status}
                                      </span>
                                    </div>
                                  </div>

                                  {isCompleted && (
                                    <Link
                                      to="/vr"
                                      search={{ pano: pano.id }}
                                      className="p-2 bg-neutral-800 border border-neutral-700 hover:border-primary hover:text-primary transition-all rounded-lg shrink-0"
                                      title={d.admin.openInVr}
                                    >
                                      <Compass className="h-4 w-4" />
                                    </Link>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="h-20 rounded-2xl border border-dashed border-neutral-800 flex flex-col items-center justify-center text-center p-4 bg-neutral-950/40 text-neutral-600">
                            <Compass className="h-5 w-5 mb-1" />
                            <span className="text-[10px]">{d.admin.noPanorama}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom: Collapsible Prompt Section */}
                    {hasPrompt && (
                      <div className="border-t border-neutral-850 px-6 py-4 bg-neutral-950/20">
                        <button
                          onClick={() => setExpandedPromptId(isPromptExpanded ? null : project.id)}
                          className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {isPromptExpanded ? (
                            <>
                              <EyeOff className="h-3.5 w-3.5" />
                              <span>{d.admin.hideGeneratedPrompt}</span>
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5" />
                              <span>{d.admin.viewGeneratedPrompt}</span>
                            </>
                          )}
                        </button>

                        {isPromptExpanded && (
                          <div className="mt-3 p-4 bg-neutral-950 border border-neutral-850 rounded-2xl text-xs font-mono leading-relaxed text-neutral-300 max-h-80 overflow-y-auto whitespace-pre-wrap selection:bg-primary selection:text-primary-foreground">
                            {project.prompt}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <footer className="py-6 border-t border-neutral-900 text-center text-xs text-neutral-500">
        Roomcast Studio &copy; {new Date().getFullYear()} · {d.admin.securedFooter}
      </footer>
    </div>
  );
}

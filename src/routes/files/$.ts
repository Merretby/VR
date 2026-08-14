import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/files/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const splat = params._splat;
        if (!splat) return new Response("Not found", { status: 404 });
        const { handleServeFile } = await import("@/lib/ai-backend");
        return handleServeFile(splat);
      },
    },
  },
});

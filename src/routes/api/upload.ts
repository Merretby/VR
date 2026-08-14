import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleUpload } = await import("@/lib/ai-backend");
        return handleUpload(request);
      },
    },
  },
});

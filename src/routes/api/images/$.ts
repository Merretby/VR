import { createFileRoute } from "@tanstack/react-router";

/**
 * GET  /api/images            -> list processed panoramas
 * GET  /api/images/:filename  -> single processed panorama
 * DELETE /api/images/:filename -> delete a processed panorama
 * TanStack Router resolves /api/images onto this splat route, so the exact
 * "images.ts" sibling is intentionally omitted.
 */
export const Route = createFileRoute("/api/images/$")({
  server: {
    handlers: {
      ANY: async ({ request, params }) => {
        const { handleListImages, handleDeleteImage } = await import("@/lib/ai-backend");
        const method = request.method.toUpperCase();
        const filename = params._splat;

        if (method === "GET") {
          return handleListImages();
        }
        if (method === "DELETE") {
          if (!filename) {
            return Response.json({ success: false, message: "Missing filename" }, { status: 400 });
          }
          return handleDeleteImage(filename);
        }
        return Response.json(
          { success: false, message: `Method ${method} not allowed` },
          { status: 405 },
        );
      },
    },
  },
});

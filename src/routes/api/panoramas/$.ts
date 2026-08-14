import { createFileRoute } from "@tanstack/react-router";

/**
 * GET    /api/panoramas           -> list DB panoramas (filePath + designedFilePath + status)
 * DELETE /api/panoramas/:id       -> delete a panorama (row + storage files)
 * POST   /api/panoramas/design    -> n8n callback: receive the generated designed panorama
 */
export const Route = createFileRoute("/api/panoramas/$")({
  server: {
    handlers: {
      ANY: async ({ request, params }) => {
        const { handleListPanoramas, handleDeletePanorama, handleReceiveDesignedPanorama } =
          await import("@/lib/photos");

        const method = request.method.toUpperCase();
        const splat = params._splat;

        if (method === "GET") {
          if (splat) {
            return Response.json({ success: false, message: "Not found" }, { status: 404 });
          }
          return handleListPanoramas();
        }

        if (method === "DELETE") {
          if (!splat) {
            return Response.json(
              { success: false, message: "Missing panorama id" },
              { status: 400 },
            );
          }
          return handleDeletePanorama(splat);
        }

        if (method === "POST" && splat === "design") {
          return handleReceiveDesignedPanorama(request);
        }

        return Response.json(
          { success: false, message: `Method ${method} not allowed` },
          { status: 405 },
        );
      },
    },
  },
});

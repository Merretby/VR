import { createServerFn } from "@tanstack/react-start";

import type { Point } from "../lib/image-processor";

function base64ToBuffer(image: string) {
  const base64Data = image.replace(
    /^data:image\/\w+;base64,/,
    "",
  );

  return Buffer.from(
    base64Data,
    "base64",
  );
}

function getMimeType(image: string) {
  const match = image.match(
    /^data:(image\/[\w.+-]+);base64,/,
  );

  return match?.[1] ?? "image/jpeg";
}

function getExtension(mimeType: string) {
  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  return "jpg";
}

export const processPhoto = createServerFn({
  method: "POST",
})
  .validator(
    (data: {
      projectId: string;
      wallKey: string;
      image: string;
      corners: [Point, Point, Point, Point];
    }) => data,
  )
  .handler(async ({ data }) => {
    const crypto = await import("crypto");

    const {
      supabase,
      SUPABASE_BUCKET,
    } = await import("./supabase");

    try {
      const {
        projectId,
        wallKey,
        image,
        corners,
      } = data;

      if (!projectId) {
        throw new Error(
          "Missing projectId",
        );
      }

      if (!wallKey) {
        throw new Error(
          "Missing wallKey",
        );
      }

      if (!image || !corners) {
        throw new Error(
          "Missing image or corners",
        );
      }

      // =========================
      // 1. Ensure project exists
      // =========================

      const {
        data: existingProject,
        error: projectFindError,
      } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .maybeSingle();

      if (projectFindError) {
        throw projectFindError;
      }

      if (!existingProject) {
        const {
          error: projectCreateError,
        } = await supabase
          .from("projects")
          .insert({
            id: projectId,
          });

        if (projectCreateError) {
          throw projectCreateError;
        }
      }

      // =========================
      // 2. Convert image
      // =========================

      const buffer =
        base64ToBuffer(image);

      const mimeType =
        getMimeType(image);

      const extension =
        getExtension(mimeType);

      const photoId =
        crypto.randomUUID();

      const storagePath =
        `projects/${projectId}/photos/${photoId}.${extension}`;

      // =========================
      // 3. Upload to Storage
      // =========================

      const {
        data: storageData,
        error: storageError,
      } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(
          storagePath,
          buffer,
          {
            contentType: mimeType,
            upsert: false,
            cacheControl: "3600",
          },
        );

      if (storageError) {
        throw storageError;
      }

      // =========================
      // 4. Get public URL
      // =========================

      const {
        data: publicUrlData,
      } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(
          storageData.path,
        );

      const filePath =
        publicUrlData.publicUrl;

      // =========================
      // 5. Insert photo DB row
      // =========================

      const {
        data: photo,
        error: photoError,
      } = await supabase
        .from("photos")
        .insert({
          id: photoId,
          wall_key: wallKey,
          file_path: filePath,
          project_id: projectId,
        })
        .select()
        .single();

      if (photoError) {
        // Cleanup uploaded image
        await supabase.storage
          .from(SUPABASE_BUCKET)
          .remove([
            storagePath,
          ]);

        throw photoError;
      }

      return {
        success: true,
        filePath:
          photo.file_path,
        photoId:
          photo.id,
      };
    } catch (error) {
      console.error(
        "Backend photo processing error:",
        error,
      );

      throw error;
    }
  });

export const savePanorama = createServerFn({
  method: "POST",
})
  .validator(
    (data: {
      projectId: string;
      image: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const crypto = await import("crypto");

    const {
      supabase,
      SUPABASE_BUCKET,
    } = await import("./supabase");

    try {
      const {
        projectId,
        image,
      } = data;

      if (!projectId) {
        throw new Error(
          "Missing projectId",
        );
      }

      if (!image) {
        throw new Error(
          "Missing image",
        );
      }

      // =========================
      // 1. Ensure project exists
      // =========================

      const {
        data: existingProject,
        error: projectFindError,
      } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .maybeSingle();

      if (projectFindError) {
        throw projectFindError;
      }

      if (!existingProject) {
        const {
          error: projectCreateError,
        } = await supabase
          .from("projects")
          .insert({
            id: projectId,
          });

        if (projectCreateError) {
          throw projectCreateError;
        }
      }

      // =========================
      // 2. Find old panoramas
      // =========================

      const {
        data: oldPanoramas,
        error: oldPanoramaError,
      } = await supabase
        .from("panoramas")
        .select(
          "id,file_path,designed_file_path",
        )
        .eq(
          "project_id",
          projectId,
        );

      if (oldPanoramaError) {
        throw oldPanoramaError;
      }

      // =========================
      // 3. Delete old DB rows
      // =========================

      const {
        error: deleteError,
      } = await supabase
        .from("panoramas")
        .delete()
        .eq(
          "project_id",
          projectId,
        );

      if (deleteError) {
        throw deleteError;
      }

      // =========================
      // 4. Convert new panorama
      // =========================

      const buffer =
        base64ToBuffer(image);

      const mimeType =
        getMimeType(image);

      const extension =
        getExtension(mimeType);

      const panoramaId =
        crypto.randomUUID();

      const storagePath =
        `projects/${projectId}/panoramas/${panoramaId}.${extension}`;

      // =========================
      // 5. Upload panorama
      // =========================

      const {
        data: storageData,
        error: storageError,
      } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(
          storagePath,
          buffer,
          {
            contentType: mimeType,
            upsert: false,
            cacheControl: "3600",
          },
        );

      if (storageError) {
        throw storageError;
      }

      // =========================
      // 6. Public URL
      // =========================

      const {
        data: publicUrlData,
      } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(
          storageData.path,
        );

      const filePath =
        publicUrlData.publicUrl;

      // =========================
      // 7. Insert panorama row
      // =========================

      const {
        data: panorama,
        error: panoramaError,
      } = await supabase
        .from("panoramas")
        .insert({
          id: panoramaId,
          project_id:
            projectId,
          file_path:
            filePath,
          designed_file_path:
            null,
          status:
            "pending",
        })
        .select()
        .single();

      if (panoramaError) {
        await supabase.storage
          .from(SUPABASE_BUCKET)
          .remove([
            storagePath,
          ]);

        throw panoramaError;
      }

      // =========================
      // 8. Optional old storage cleanup
      // =========================

      if (
        oldPanoramas &&
        oldPanoramas.length > 0
      ) {
        console.log(
          `${oldPanoramas.length} old panorama row(s) replaced`,
        );
      }

      return {
        success: true,

        filePath:
          panorama.file_path,

        panoramaId:
          panorama.id,

        status:
          panorama.status,

        designedFilePath:
          panorama
            .designed_file_path,
      };
    } catch (error) {
      console.error(
        "Backend panorama save error:",
        error,
      );

      throw error;
    }
  });
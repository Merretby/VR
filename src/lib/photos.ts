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

// =====================================================
// PROCESS PHOTO
// =====================================================

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

      console.log("PROCESS PHOTO CALLED", {
        projectId,
        wallKey,
        imageLength: image?.length,
      });

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

      // Ensure project exists
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

      // Convert image
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

      console.log(
        "UPLOADING PHOTO TO STORAGE",
        {
          bucket: SUPABASE_BUCKET,
          storagePath,
          mimeType,
          size: buffer.length,
        },
      );

      // Upload photo
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
        console.error(
          "PHOTO STORAGE ERROR",
          storageError,
        );

        throw storageError;
      }

      console.log(
        "PHOTO STORAGE UPLOAD OK",
        storageData,
      );

      // Public URL
      const {
        data: publicUrlData,
      } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(
          storageData.path,
        );

      const filePath =
        publicUrlData.publicUrl;

      // Save photo in DB
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
        console.error(
          "PHOTO DB ERROR",
          photoError,
        );

        await supabase.storage
          .from(SUPABASE_BUCKET)
          .remove([
            storagePath,
          ]);

        throw photoError;
      }

      console.log(
        "PHOTO DB INSERT OK",
        photo,
      );

      return {
        success: true,
        filePath: photo.file_path,
        photoId: photo.id,
      };
    } catch (error) {
      console.error(
        "Backend photo processing error:",
        error,
      );

      throw error;
    }
  });

// =====================================================
// SAVE PANORAMA
// =====================================================

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

      console.log(
        "SAVE PANORAMA CALLED",
        {
          projectId,
          imageLength: image?.length,
        },
      );

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

      // Ensure project exists
      const {
        data: existingProject,
        error: projectFindError,
      } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .maybeSingle();

      if (projectFindError) {
        console.error(
          "PROJECT FIND ERROR",
          projectFindError,
        );

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
          console.error(
            "PROJECT CREATE ERROR",
            projectCreateError,
          );

          throw projectCreateError;
        }
      }

      // Convert panorama
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

      console.log(
        "UPLOADING PANORAMA TO STORAGE",
        {
          bucket: SUPABASE_BUCKET,
          storagePath,
          mimeType,
          size: buffer.length,
        },
      );

      // Upload panorama
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
        console.error(
          "PANORAMA STORAGE ERROR",
          storageError,
        );

        throw storageError;
      }

      console.log(
        "STORAGE UPLOAD OK",
        storageData,
      );

      // Get public URL
      const {
        data: publicUrlData,
      } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(
          storageData.path,
        );

      const filePath =
        publicUrlData.publicUrl;

      console.log(
        "PANORAMA PUBLIC URL",
        filePath,
      );

      // Insert panorama in DB
      const {
        data: panorama,
        error: panoramaError,
      } = await supabase
        .from("panoramas")
        .insert({
          id: panoramaId,
          project_id: projectId,
          file_path: filePath,
          designed_file_path: null,
          status: "pending",
        })
        .select()
        .single();

      if (panoramaError) {
        console.error(
          "PANORAMA DB INSERT ERROR",
          panoramaError,
        );

        await supabase.storage
          .from(SUPABASE_BUCKET)
          .remove([
            storagePath,
          ]);

        throw panoramaError;
      }

      console.log(
        "PANORAMA DB INSERT OK",
        panorama,
      );

      console.log(
        "SAVE PANORAMA COMPLETED",
        {
          panoramaId:
            panorama.id,
          status:
            panorama.status,
          filePath:
            panorama.file_path,
        },
      );

      return {
        success: true,

        filePath:
          panorama.file_path,

        panoramaId:
          panorama.id,

        status:
          panorama.status,

        designedFilePath:
          panorama.designed_file_path,
      };
    } catch (error) {
      console.error(
        "Backend panorama save error:",
        error,
      );

      throw error;
    }
  });

// =====================================================
// COMPLETE PANORAMA DESIGN
// =====================================================

export const completePanoramaDesign = createServerFn({
  method: "POST",
})
  .validator(
    (data: {
      panoramaId: string;
      designedFilePath: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const {
      supabase,
    } = await import("./supabase");

    try {
      const {
        panoramaId,
        designedFilePath,
      } = data;

      console.log(
        "COMPLETE PANORAMA DESIGN CALLED",
        {
          panoramaId,
          designedFilePath,
        },
      );

      if (!panoramaId) {
        throw new Error(
          "Missing panoramaId",
        );
      }

      if (!designedFilePath) {
        throw new Error(
          "Missing designedFilePath",
        );
      }

      const {
        data: panorama,
        error,
      } = await supabase
        .from("panoramas")
        .update({
          designed_file_path:
            designedFilePath,
          status:
            "completed",
        })
        .eq(
          "id",
          panoramaId,
        )
        .select()
        .single();

      if (error) {
        console.error(
          "PANORAMA DESIGN UPDATE ERROR",
          error,
        );

        throw error;
      }

      console.log(
        "PANORAMA DESIGN COMPLETED",
        panorama,
      );

      return {
        success: true,
        panorama,
      };
    } catch (error) {
      console.error(
        "Panorama design completion error:",
        error,
      );

      throw error;
    }
  });
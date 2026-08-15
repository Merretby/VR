import { createServerFn } from "@tanstack/react-start";

import type { Point } from "../lib/image-processor";

function base64ToBuffer(image: string) {
  const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

  return Buffer.from(base64Data, "base64");
}

function getMimeType(image: string) {
  const match = image.match(/^data:(image\/[\w.+-]+);base64,/);

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

    const { supabase, SUPABASE_BUCKET } = await import("./supabase");

    try {
      const { projectId, wallKey, image, corners } = data;

      console.log("PROCESS PHOTO CALLED", {
        projectId,
        wallKey,
        imageLength: image?.length,
      });

      if (!projectId) {
        throw new Error("Missing projectId");
      }

      if (!wallKey) {
        throw new Error("Missing wallKey");
      }

      if (!image || !corners) {
        throw new Error("Missing image or corners");
      }

      // Ensure project exists
      const { data: existingProject, error: projectFindError } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .maybeSingle();

      if (projectFindError) {
        throw projectFindError;
      }

      if (!existingProject) {
        const { error: projectCreateError } = await supabase.from("projects").insert({
          id: projectId,
        });

        if (projectCreateError) {
          throw projectCreateError;
        }
      }

      // Convert image
      const buffer = base64ToBuffer(image);

      const mimeType = getMimeType(image);

      const extension = getExtension(mimeType);

      const photoId = crypto.randomUUID();

      const storagePath = `projects/${projectId}/photos/${photoId}.${extension}`;

      console.log("UPLOADING PHOTO TO STORAGE", {
        bucket: SUPABASE_BUCKET,
        storagePath,
        mimeType,
        size: buffer.length,
      });

      // Upload photo
      const { data: storageData, error: storageError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: false,
          cacheControl: "3600",
        });

      if (storageError) {
        console.error("PHOTO STORAGE ERROR", storageError);

        throw storageError;
      }

      console.log("PHOTO STORAGE UPLOAD OK", storageData);

      // Public URL
      const { data: publicUrlData } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(storageData.path);

      const filePath = publicUrlData.publicUrl;

      // Save photo in DB
      const { data: photo, error: photoError } = await supabase
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
        console.error("PHOTO DB ERROR", photoError);

        await supabase.storage.from(SUPABASE_BUCKET).remove([storagePath]);

        throw photoError;
      }

      console.log("PHOTO DB INSERT OK", photo);

      return {
        success: true,
        filePath: photo.file_path,
        photoId: photo.id,
      };
    } catch (error) {
      console.error("Backend photo processing error:", error);

      throw error;
    }
  });

// =====================================================
// SAVE PANORAMA
// =====================================================

export const savePanorama = createServerFn({
  method: "POST",
})
  .validator((data: { projectId: string; image: string }) => data)
  .handler(async ({ data }) => {
    const crypto = await import("crypto");

    const { supabase, SUPABASE_BUCKET } = await import("./supabase");

    try {
      const { projectId, image } = data;

      console.log("SAVE PANORAMA CALLED", {
        projectId,
        imageLength: image?.length,
      });

      if (!projectId) {
        throw new Error("Missing projectId");
      }

      if (!image) {
        throw new Error("Missing image");
      }

      // Ensure project exists
      const { data: existingProject, error: projectFindError } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .maybeSingle();

      if (projectFindError) {
        console.error("PROJECT FIND ERROR", projectFindError);

        throw projectFindError;
      }

      if (!existingProject) {
        const { error: projectCreateError } = await supabase.from("projects").insert({
          id: projectId,
        });

        if (projectCreateError) {
          console.error("PROJECT CREATE ERROR", projectCreateError);

          throw projectCreateError;
        }
      }

      // Convert panorama
      const buffer = base64ToBuffer(image);

      const mimeType = getMimeType(image);

      const extension = getExtension(mimeType);

      const panoramaId = crypto.randomUUID();

      const storagePath = `projects/${projectId}/panoramas/${panoramaId}.${extension}`;

      console.log("UPLOADING PANORAMA TO STORAGE", {
        bucket: SUPABASE_BUCKET,
        storagePath,
        mimeType,
        size: buffer.length,
      });

      // Upload panorama
      const { data: storageData, error: storageError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: false,
          cacheControl: "3600",
        });

      if (storageError) {
        console.error("PANORAMA STORAGE ERROR", storageError);

        throw storageError;
      }

      console.log("STORAGE UPLOAD OK", storageData);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(storageData.path);

      const filePath = publicUrlData.publicUrl;

      console.log("PANORAMA PUBLIC URL", filePath);

      // Insert panorama in DB
      const { data: panorama, error: panoramaError } = await supabase
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

      // Also create a design_jobs record for tracking
      try {
        await supabase.from("design_jobs").insert({
          project_id: projectId,
          panorama_id: panoramaId,
          source_image_url: filePath,
          status: "processing",
          moodboard_key: "moodbord.jpg",
          output_image_url: null,
        });
      } catch (djErr) {
        console.warn("design_jobs initial insert warning:", djErr);
      }

      if (panoramaError) {
        console.error("PANORAMA DB INSERT ERROR", panoramaError);

        await supabase.storage.from(SUPABASE_BUCKET).remove([storagePath]);

        throw panoramaError;
      }

      console.log("PANORAMA DB INSERT OK", panorama);

      // Trigger the n8n workflow (best-effort). On failure the panorama stays
      // available with status "pending" — the original is never deleted.
      const status = await triggerN8nWorkflow(panorama);

      if (status !== panorama.status) {
        const { error: statusUpdateError } = await supabase
          .from("panoramas")
          .update({ status })
          .eq("id", panorama.id);

        if (statusUpdateError) {
          console.error("PANORAMA STATUS UPDATE ERROR", statusUpdateError);
        }
      }

      console.log("SAVE PANORAMA COMPLETED", {
        panoramaId: panorama.id,
        status,
        filePath: panorama.file_path,
      });

      return {
        success: true,

        filePath: panorama.file_path,

        panoramaId: panorama.id,

        status,

        designedFilePath: panorama.designed_file_path,
      };
    } catch (error) {
      console.error("Backend panorama save error:", error);

      throw error;
    }
  });

// =====================================================
// N8N WEBHOOK TRIGGER
// =====================================================
// After a panorama is created we POST its downloadable URL(s) to the n8n
// workflow (N8N_PANORAMA_WEBHOOK_URL). The backend never calls OpenAI itself.
//
// Status behaviour:
//   - insert          -> "pending"   (created, not yet dispatched)
//   - webhook success -> "processing" (n8n has started generation)
//   - webhook failure -> "pending"    (generation never started; original stays)
//   - generation done -> "completed" (see /api/panoramas/generated)
//   - generation fail -> "failed"    (see /api/panoramas/generated)

const N8N_WEBHOOK_TIMEOUT_MS = 10_000;

export async function toDownloadableUrl(pathOrUrl: string): Promise<string> {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const { supabase, SUPABASE_BUCKET } = await import("./supabase");

  const { data: publicUrlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(pathOrUrl);

  return publicUrlData.publicUrl;
}

async function resolveVisionBoardPath(projectId: string): Promise<string | null> {
  const { supabase } = await import("./supabase");

  const { data } = await supabase
    .from("projects")
    .select("vision_board_path")
    .eq("id", projectId)
    .maybeSingle();

  if (!data?.vision_board_path) {
    return null;
  }

  return toDownloadableUrl(data.vision_board_path);
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  let result = 0;

  for (let i = 0; i < left.length; i++) {
    result |= left[i]! ^ right[i]!;
  }

  return result === 0;
}

async function triggerN8nWorkflow(panorama: {
  id: string;
  project_id: string;
  file_path: string;
}): Promise<"pending" | "processing"> {
  const webhookUrl = process.env['N8N_PANORAMA_WEBHOOK_URL'];

  if (!webhookUrl) {
    console.log("N8N_PANORAMA_WEBHOOK_URL not configured; skipping n8n trigger");

    return "pending";
  }

  const panoramaPath = await toDownloadableUrl(panorama.file_path);

  const visionBoardPath = await resolveVisionBoardPath(panorama.project_id);

  const payload = {
    panoramaId: panorama.id,
    projectId: panorama.project_id,
    panoramaPath,
    visionBoardPath,
  };

  console.log("TRIGGERING N8N WORKFLOW", payload);

  const controller = new AbortController();

  const timer = setTimeout(() => controller.abort(), N8N_WEBHOOK_TIMEOUT_MS);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");

      console.error("N8N WEBHOOK NON-2XX RESPONSE", response.status, text.slice(0, 200));

      return "pending";
    }

    console.log("N8N WEBHOOK OK", response.status);

    return "processing";
  } catch (error) {
    console.error("N8N WEBHOOK TRIGGER FAILED", error instanceof Error ? error.message : error);

    return "pending";
  } finally {
    clearTimeout(timer);
  }
}

// =====================================================
// COMPLETE PANORAMA DESIGN
// =====================================================

export const completePanoramaDesign = createServerFn({
  method: "POST",
})
  .validator((data: { panoramaId: string; designedFilePath: string }) => data)
  .handler(async ({ data }) => {
    const { supabase } = await import("./supabase");

    try {
      const { panoramaId, designedFilePath } = data;

      console.log("COMPLETE PANORAMA DESIGN CALLED", {
        panoramaId,
        designedFilePath,
      });

      if (!panoramaId) {
        throw new Error("Missing panoramaId");
      }

      if (!designedFilePath) {
        throw new Error("Missing designedFilePath");
      }

      const { data: panorama, error } = await supabase
        .from("panoramas")
        .update({
          designed_file_path: designedFilePath,
          status: "completed",
        })
        .eq("id", panoramaId)
        .select()
        .single();

      if (error) {
        console.error("PANORAMA DESIGN UPDATE ERROR", error);

        throw error;
      }

      console.log("PANORAMA DESIGN COMPLETED", panorama);

      return {
        success: true,
        panorama,
      };
    } catch (error) {
      console.error("Panorama design completion error:", error);

      throw error;
    }
  });

// =====================================================
// LIST PANORAMAS (DB-DRIVEN /vr LISTING)
// =====================================================

export type PanoramaRecord = {
  id: string;
  projectId: string;
  filePath: string;
  designedFilePath: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
};

export async function handleListPanoramas(): Promise<Response> {
  const { supabase } = await import("./supabase");

  try {
    const { data, error } = await supabase
      .from("panoramas")
      .select("id, project_id, file_path, designed_file_path, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("PANORAMA LIST ERROR", error);
      throw error;
    }

    // Also fetch design_jobs to read output_image_url if present
    const { data: designJobs } = await supabase
      .from("design_jobs")
      .select("panorama_id, output_image_url, status");

    const djMap = new Map((designJobs ?? []).map((dj) => [dj.panorama_id, dj]));

    const panoramas = (data ?? []).map((row): PanoramaRecord => {
      const dj = djMap.get(row.id);
      const designedFilePath = row.designed_file_path || dj?.output_image_url || null;
      const isCompleted = Boolean(designedFilePath) || row.status === "completed" || dj?.status === "completed";
      const status = isCompleted && designedFilePath ? "completed" : row.status;

      return {
        id: row.id,
        projectId: row.project_id,
        filePath: row.file_path,
        designedFilePath,
        status,
        createdAt: row.created_at,
      };
    });

    return Response.json({
      success: true,
      panoramas,
    });
  } catch (error) {
    console.error("Backend panorama list error:", error);

    return Response.json(
      {
        success: false,
        message: (error as Error).message ?? "Failed to list panoramas",
      },
      { status: 500 },
    );
  }
}

// =====================================================
// DELETE PANORAMA (ROW + STORAGE FILES)
// =====================================================

function storagePathFromPublicUrl(publicUrl: string): string | null {
  // https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const marker = "/storage/v1/object/public/";

  const index = publicUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  const afterMarker = publicUrl.slice(index + marker.length);

  // Strip bucket name, keep the object path.
  const slashIndex = afterMarker.indexOf("/");

  if (slashIndex === -1) {
    return null;
  }

  return afterMarker.slice(slashIndex + 1);
}

export async function handleDeletePanorama(panoramaId: string): Promise<Response> {
  const { supabase, SUPABASE_BUCKET } = await import("./supabase");

  try {
    const { data: row, error: findError } = await supabase
      .from("panoramas")
      .select("file_path, designed_file_path")
      .eq("id", panoramaId)
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (!row) {
      return Response.json(
        {
          success: false,
          message: "Panorama not found",
        },
        { status: 404 },
      );
    }

    const storagePaths = [row.file_path, row.designed_file_path]
      .filter((path): path is string => Boolean(path))
      .map(storagePathFromPublicUrl)
      .filter((path): path is string => Boolean(path));

    if (storagePaths.length) {
      await supabase.storage.from(SUPABASE_BUCKET).remove(storagePaths);
    }

    const { error: deleteError } = await supabase.from("panoramas").delete().eq("id", panoramaId);

    if (deleteError) {
      throw deleteError;
    }

    return Response.json({
      success: true,
      panoramaId,
    });
  } catch (error) {
    console.error("Backend panorama delete error:", error);

    return Response.json(
      {
        success: false,
        message: (error as Error).message ?? "Failed to delete panorama",
      },
      { status: 500 },
    );
  }
}

// =====================================================
// N8N DESIGN CALLBACK — RECEIVE THE GENERATED PANORAMA
// =====================================================
// n8n POSTs the generated/designed panorama here. It accepts either:
//   - multipart/form-data: field "image" (file) + field "panoramaId"
//   - JSON: { panoramaId, designedFilePath }
// The designed file is stored in Supabase storage and the panorama row is
// marked status="completed" so /vr can show the After view.

export async function handleReceiveDesignedPanorama(request: Request): Promise<Response> {
  const crypto = await import("crypto");

  const { supabase, SUPABASE_BUCKET } = await import("./supabase");

  try {
    const contentType = request.headers.get("content-type") ?? "";

    let panoramaId = "";
    let designedFilePath = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const idField = formData.get("panoramaId");

      panoramaId = typeof idField === "string" ? idField : "";

      const imageFile = formData.get("image");

      if (!(imageFile instanceof File)) {
        return Response.json(
          {
            success: false,
            message: "Missing image file",
          },
          { status: 400 },
        );
      }

      const { data: row, error: findError } = await supabase
        .from("panoramas")
        .select("project_id")
        .eq("id", panoramaId)
        .maybeSingle();

      if (findError) {
        throw findError;
      }

      if (!row) {
        return Response.json(
          {
            success: false,
            message: "Panorama not found",
          },
          { status: 404 },
        );
      }

      const buffer = Buffer.from(await imageFile.arrayBuffer());

      const mimeType = getMimeType(`data:${imageFile.type};base64,`);

      const extension = getExtension(mimeType);

      const storagePath = `projects/${row.project_id}/panoramas/designs/${panoramaId}-${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: false,
          cacheControl: "3600",
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(storagePath);

      designedFilePath = publicUrlData.publicUrl;
    } else {
      const body = (await request.json()) as {
        panoramaId?: string;
        designedFilePath?: string;
      };

      panoramaId = body.panoramaId ?? "";
      designedFilePath = body.designedFilePath ?? "";
    }

    if (!panoramaId) {
      return Response.json(
        {
          success: false,
          message: "Missing panoramaId",
        },
        { status: 400 },
      );
    }

    if (!designedFilePath) {
      return Response.json(
        {
          success: false,
          message: "Missing designedFilePath",
        },
        { status: 400 },
      );
    }

    const { data: panorama, error } = await supabase
      .from("panoramas")
      .update({
        designed_file_path: designedFilePath,
        status: "completed",
      })
      .eq("id", panoramaId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Also update design_jobs table output_image_url
    try {
      await supabase
        .from("design_jobs")
        .update({
          output_image_url: designedFilePath,
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("panorama_id", panoramaId);
    } catch (djErr) {
      console.warn("design_jobs update error:", djErr);
    }

    console.log("N8N DESIGN RECEIVED", panorama);

    return Response.json({
      success: true,
      panoramaId,
      output_image_url: designedFilePath,
      designedFilePath,
      panorama,
    });
  } catch (error) {
    console.error("N8N design receive error:", error);

    return Response.json(
      {
        success: false,
        message: (error as Error).message ?? "Failed to receive designed panorama",
      },
      { status: 500 },
    );
  }
}

// =====================================================
// N8N GENERATED PANORAMA ENDPOINT
// =====================================================
// POST /api/panoramas/generated
// Content-Type: multipart/form-data
//   panoramaId         - the panorama id (must exist)
//   projectId          - the project id (must match the panorama's project)
//   generatedPanorama  - the generated/redesigned image file
//
// The designed file is stored separately from the original (filePath is never
// touched). On success: designedFilePath + status="completed".
// On any failure: status="failed", original remains intact.

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MAX_GENERATED_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export async function handleReceiveGeneratedPanorama(request: Request): Promise<Response> {
  const crypto = await import("crypto");

  const { supabase, SUPABASE_BUCKET } = await import("./supabase");

  let panoramaId = "";

  try {
    const contentType = request.headers.get("content-type") ?? "";

    // Optional shared-secret authentication for n8n.
    const secret = process.env['N8N_GENERATED_PANORAMA_SECRET'];

    if (secret) {
      const provided = request.headers.get("x-panorama-secret");

      if (!provided || !timingSafeEqualStrings(secret, provided)) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }
    }

    let projectId = "";
    let designedFilePath = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const panoramaIdValue = formData.get("panoramaId") ?? formData.get("panorama_id");
      const projectIdValue = formData.get("projectId") ?? formData.get("project_id");
      const generatedFile = formData.get("generatedPanorama") ?? formData.get("image") ?? formData.get("file");

      if (typeof panoramaIdValue === "string" && panoramaIdValue) {
        panoramaId = panoramaIdValue;
      } else {
        const { data: latestPano } = await supabase
          .from("panoramas")
          .select("id, project_id")
          .in("status", ["processing", "pending"])
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (latestPano) {
          panoramaId = latestPano.id;
        }
      }

      if (!panoramaId) {
        return Response.json({ success: false, message: "Missing panoramaId and no active panorama found" }, { status: 400 });
      }

      projectId = typeof projectIdValue === "string" ? projectIdValue : "";

      // Step 1 — Verify panorama exists.
      const { data: panorama, error: findError } = await supabase
        .from("panoramas")
        .select("project_id, file_path")
        .eq("id", panoramaId)
        .maybeSingle();

      if (findError) {
        throw findError;
      }

      if (!panorama) {
        return Response.json({ success: false, message: "Panorama not found" }, { status: 404 });
      }

      if (!projectId) {
        projectId = panorama.project_id;
      }

      if (generatedFile instanceof File) {
        if (!ALLOWED_IMAGE_TYPES.includes(generatedFile.type)) {
          return Response.json(
            { success: false, message: `Unsupported image type: ${generatedFile.type}` },
            { status: 400 },
          );
        }

        if (generatedFile.size > MAX_GENERATED_FILE_SIZE) {
          return Response.json(
            { success: false, message: "Generated panorama file too large" },
            { status: 400 },
          );
        }

        const buffer = Buffer.from(await generatedFile.arrayBuffer());
        const extension = getExtension(generatedFile.type);

        const storagePath = `projects/${projectId}/panoramas-designed/${panoramaId}-${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(SUPABASE_BUCKET)
          .upload(storagePath, buffer, {
            contentType: generatedFile.type,
            upsert: false,
            cacheControl: "3600",
          });

        if (uploadError) {
          console.error("GENERATED PANORAMA STORAGE ERROR", uploadError);
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from(SUPABASE_BUCKET)
          .getPublicUrl(storagePath);

        designedFilePath = publicUrlData.publicUrl;
      } else {
        const urlField = formData.get("output_image_url") ?? formData.get("designedFilePath") ?? formData.get("imageUrl");
        if (typeof urlField === "string" && urlField) {
          designedFilePath = urlField;
        } else {
          return Response.json(
            { success: false, message: "Missing generatedPanorama file or output_image_url" },
            { status: 400 },
          );
        }
      }
    } else {
      // JSON body support
      const body = (await request.json()) as {
        panoramaId?: string;
        panorama_id?: string;
        projectId?: string;
        project_id?: string;
        output_image_url?: string;
        outputImageUrl?: string;
        designedFilePath?: string;
      };

      panoramaId = body.panoramaId ?? body.panorama_id ?? "";
      designedFilePath = body.output_image_url ?? body.outputImageUrl ?? body.designedFilePath ?? "";
      projectId = body.projectId ?? body.project_id ?? "";

      if (!panoramaId) {
        // Auto-fallback to the most recent processing or pending panorama
        const { data: latestPano } = await supabase
          .from("panoramas")
          .select("id, project_id")
          .in("status", ["processing", "pending"])
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestPano) {
          panoramaId = latestPano.id;
          if (!projectId) projectId = latestPano.project_id;
        } else {
          return Response.json({ success: false, message: "Missing panoramaId and no active panorama found" }, { status: 400 });
        }
      }

      if (!designedFilePath) {
        return Response.json({ success: false, message: "Missing output_image_url / designedFilePath" }, { status: 400 });
      }
    }

    // Step 5 — Update panoramas table (status='completed', designed_file_path=designedFilePath)
    const { data: updated, error: updateError } = await supabase
      .from("panoramas")
      .update({
        designed_file_path: designedFilePath,
        status: "completed",
      })
      .eq("id", panoramaId)
      .select()
      .single();

    if (updateError) {
      console.error("GENERATED PANORAMA DB UPDATE ERROR", updateError);
      throw updateError;
    }

    // Also update design_jobs table output_image_url
    try {
      await supabase
        .from("design_jobs")
        .update({
          output_image_url: designedFilePath,
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("panorama_id", panoramaId);
    } catch (djErr) {
      console.warn("design_jobs update error:", djErr);
    }

    console.log("GENERATED PANORAMA ACCEPTED", { panoramaId, output_image_url: designedFilePath });

    // Step 6 — Return success with both output_image_url and designedFilePath.
    return Response.json({
      success: true,
      panoramaId,
      projectId: projectId || updated?.project_id,
      status: "completed",
      output_image_url: designedFilePath,
      designedFilePath,
    });
  } catch (error) {
    console.error("GENERATED PANORAMA PROCESSING ERROR", error);

    // Mark failed, never touch the original.
    if (panoramaId) {
      try {
        await supabase.from("panoramas").update({ status: "failed" }).eq("id", panoramaId);
      } catch (statusError) {
        console.error("GENERATED PANORAMA FAILED STATUS ERROR", statusError);
      }
    }

    return Response.json(
      {
        success: false,
        message: "Failed to process generated panorama",
      },
      { status: 500 },
    );
  }
}

// =====================================================
// SAVE VISION BOARD
// =====================================================
// Uploads a vision board image for a project and saves
// the public URL to projects.vision_board_path.
// The URL is automatically included in the n8n webhook
// payload via resolveVisionBoardPath().

export const saveVisionBoard = createServerFn({
  method: 'POST',
})
  .validator((data: { projectId: string; image: string }) => data)
  .handler(async ({ data }) => {
    const crypto = await import('crypto');

    const { supabase, SUPABASE_BUCKET } = await import('./supabase');

    try {
      const { projectId, image } = data;

      console.log('SAVE VISION BOARD CALLED', {
        projectId,
        imageLength: image?.length,
      });

      if (!projectId) {
        throw new Error('Missing projectId');
      }

      if (!image) {
        throw new Error('Missing image');
      }

      // Ensure project exists, create if not
      const { data: existingProject, error: projectFindError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .maybeSingle();

      if (projectFindError) {
        throw projectFindError;
      }

      if (!existingProject) {
        const { error: projectCreateError } = await supabase
          .from('projects')
          .insert({ id: projectId });

        if (projectCreateError) {
          throw projectCreateError;
        }
      }

      // Convert base64 image
      const buffer = base64ToBuffer(image);
      const mimeType = getMimeType(image);
      const extension = getExtension(mimeType);

      // Always create a fresh vision board file for this project
      const boardId = crypto.randomUUID();
      const storagePath = `projects/${projectId}/vision-board/${boardId}.${extension}`;

      console.log('UPLOADING VISION BOARD TO STORAGE', {
        bucket: SUPABASE_BUCKET,
        storagePath,
        mimeType,
        size: buffer.length,
      });

      const { data: storageData, error: storageError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: false,
          cacheControl: '3600',
        });

      if (storageError) {
        console.error('VISION BOARD STORAGE ERROR', storageError);
        throw storageError;
      }

      console.log('VISION BOARD STORAGE UPLOAD OK', storageData);

      // Build public URL
      const { data: publicUrlData } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(storageData.path);

      const visionBoardPath = publicUrlData.publicUrl;

      // Save URL to the project row
      const { error: updateError } = await supabase
        .from('projects')
        .update({ vision_board_path: visionBoardPath })
        .eq('id', projectId);

      if (updateError) {
        console.error('VISION BOARD PROJECT UPDATE ERROR', updateError);
        // Clean up orphaned storage file
        await supabase.storage.from(SUPABASE_BUCKET).remove([storagePath]);
        throw updateError;
      }

      console.log('VISION BOARD SAVED', { projectId, visionBoardPath });

      return {
        success: true,
        visionBoardPath,
      };
    } catch (error) {
      console.error('Backend vision board save error:', error);
      throw error;
    }
  });

// =====================================================
// GET PROJECT VISION BOARD URL
// =====================================================
// Returns the public URL of the project's current
// vision board, or null if none has been uploaded.

export const getProjectVisionBoard = createServerFn({
  method: 'GET',
})
  .validator((data: { projectId: string }) => data)
  .handler(async ({ data }) => {
    const { supabase } = await import('./supabase');

    const { projectId } = data;

    if (!projectId) {
      throw new Error('Missing projectId');
    }

    const { data: project, error } = await supabase
      .from('projects')
      .select('vision_board_path')
      .eq('id', projectId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return {
      success: true,
      visionBoardPath: project?.vision_board_path ?? null,
    };
  });

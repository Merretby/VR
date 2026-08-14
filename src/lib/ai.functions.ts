import { createServerFn } from "@tanstack/react-start";
import { streamText, generateImage, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3.6-flash";

const AnalyzeInput = z.object({
  fileData: z.string(),
  mimeType: z.string(),
  fileName: z.string(),
});

const PlanSchema = z.object({
  widthM: z.number(),
  lengthM: z.number(),
  heightM: z.number(),
  doorWidth: z.number(),
  doorHeight: z.number(),
  doorOffsetFromLeft: z.number(),
  windowWidth: z.number(),
  windowHeight: z.number(),
  windowOffsetFromLeft: z.number(),
  roomName: z.string(),
  detected: z.array(z.string()),
  notes: z.array(z.string()),
});

export type AnalyzedPlan = z.infer<typeof PlanSchema>;

function gateway() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

/** Detects walls, doors, windows and dimensions in an uploaded 2D floor plan. */
export const analyzeFloorPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AnalyzeInput.parse(input))
  .handler(async ({ data }) => {
    const provider = gateway();

    const contentBlock =
      data.mimeType === "application/pdf"
        ? {
            type: "file" as const,
            file: {
              filename: data.fileName,
              file_data: `data:${data.mimeType};base64,${data.fileData}`,
            },
          }
        : {
            type: "image_url" as const,
            image_url: { url: `data:${data.mimeType};base64,${data.fileData}` },
          };

    const system = [
      "You are an architectural floor-plan analyst.",
      "Read the plan and report the geometry of the single main room.",
      "Report every length in metres. If a dimension is printed on the plan, use it exactly.",
      "If a dimension is not printed, estimate it from the drawing scale — never return 0.",
      "Typical values: ceiling height 2.4-3.0 m, door 0.8-1.0 m wide and 2.0-2.1 m tall, window 0.9-2.0 m wide.",
      "doorOffsetFromLeft is the distance from the left end of the back wall to the door centre.",
      "windowOffsetFromLeft is the distance from the left end of the front wall to the window centre.",
      "detected: short list of the elements you found (walls, doors, windows, dimensions, rooms, furniture).",
      "notes: short observations about anything ambiguous the user should verify.",
    ].join(" ");

    try {
      const result = streamText({
        model: provider(MODEL),
        output: Output.object({ schema: PlanSchema }),
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyse this 2D floor plan and return the structured room geometry.",
              },
              contentBlock,
            ],
          },
        ] as never,
      });
      return await result.output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error) && error.text) {
        const match = error.text.match(/\{[\s\S]*\}/);
        if (match) return PlanSchema.parse(JSON.parse(match[0]));
      }
      throw error;
    }
  });

const DesignInput = z.object({
  prompt: z.string(),
  style: z.string(),
  widthM: z.number(),
  lengthM: z.number(),
  heightM: z.number(),
});

const DesignSchema = z.object({
  name: z.string(),
  wallColor: z.string(),
  floorColor: z.string(),
  lighting: z.string(),
  summary: z.string(),
  furniture: z.array(
    z.object({
      type: z.string(),
      x: z.number(),
      z: z.number(),
      rotation: z.number(),
    }),
  ),
});

export type AiDesign = z.infer<typeof DesignSchema>;

/** Designs a room layout inside the EXISTING geometry — it never changes walls. */
export const designRoomWithAi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => DesignInput.parse(input))
  .handler(async ({ data }) => {
    const provider = gateway();

    const system = [
      "You are an interior designer laying out furniture inside a fixed room.",
      "The room geometry is fixed and must never be changed — only place furniture and pick finishes.",
      `The room is ${data.widthM} m wide (x from 0 to ${data.widthM}) and ${data.lengthM} m long (z from 0 to ${data.lengthM}), ceiling ${data.heightM} m.`,
      "z=0 is the front wall with the window, z=max is the back wall with the door. Keep the door area clear.",
      "x and z are the centre point of each item in metres and must stay inside the room with clearance from walls.",
      "rotation is degrees around the vertical axis: 0 faces the front wall.",
      "Allowed furniture types only: sofa, bed, desk, chair, table, tv, wardrobe, cabinet, carpet, plant, lamp, shelves.",
      "wallColor and floorColor are hex colours. lighting is one of: warm, neutral, cool.",
      "Place between 4 and 9 items, never overlapping, and leave a walking path.",
    ].join(" ");

    try {
      const result = streamText({
        model: provider(MODEL),
        output: Output.object({ schema: DesignSchema }),
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: `Style: ${data.style}. Request: ${data.prompt || "Design a comfortable, well balanced room."}`,
          },
        ],
      });
      return await result.output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error) && error.text) {
        const match = error.text.match(/\{[\s\S]*\}/);
        if (match) return DesignSchema.parse(JSON.parse(match[0]));
      }
      throw error;
    }
  });

const HeroImagesInput = z.object({
  force: z.boolean().optional(),
});

export type HeroImages = { before: string; after: string };

/** Image models to try, in order, through the Lovable AI gateway. */
const HERO_IMAGE_MODELS = [
  "google/imagen-3.0-generate-002",
  "openai/gpt-image-1",
  "google/gemini-image-generation",
];

const HERO_BEFORE_FILE = pathOfUpload("hero-ai-before.png");
const HERO_AFTER_FILE = pathOfUpload("hero-ai-after.png");

const HERO_BEFORE_PROMPT = [
  "Photorealistic interior photograph of a bright, empty, unfurnished room.",
  "Warm white and cream painted walls, pale beige wooden floor, large window on the front wall with sheer curtains letting in soft daylight.",
  "No furniture, no decor. Clean, airy, light and minimal. Real-estate architectural photo, wide angle, eye level.",
].join(" ");

const HERO_AFTER_PROMPT = [
  "Photorealistic interior photograph of the same bright, warm living room, now fully furnished.",
  "Beige linen sofa, light wood coffee table, cream wool rug, potted plants, soft warm table lamps.",
  "Scandinavian cozy modern style, bright and airy, warm natural daylight from the window. Wide angle, eye level.",
].join(" ");

function pathOfUpload(fileName: string) {
  return `public/uploads/${fileName}`;
}

function uploadUrl(fileName: string) {
  return `/uploads/${fileName}`;
}

/** Generates the landing-page Before/After hero images via the gateway, cached to disk. */
export const generateHeroImages = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => HeroImagesInput.parse(input ?? {}))
  .handler(async ({ data }) => {
    if (!process.env["LOVABLE_API_KEY"]) return null;

    const fs = await import("fs/promises");
    const path = await import("path");

    const beforePath = path.join(process.cwd(), HERO_BEFORE_FILE);
    const afterPath = path.join(process.cwd(), HERO_AFTER_FILE);

    if (!data.force) {
      try {
        await fs.access(beforePath);
        await fs.access(afterPath);
        const cached: HeroImages = {
          before: uploadUrl("hero-ai-before.png"),
          after: uploadUrl("hero-ai-after.png"),
        };
        return cached;
      } catch {
        // not cached yet — generate below
      }
    }

    const provider = gateway();
    const generated: { before?: string; after?: string } = {};

    const models = process.env["HERO_IMAGE_MODEL"]
      ? [process.env["HERO_IMAGE_MODEL"], ...HERO_IMAGE_MODELS]
      : HERO_IMAGE_MODELS;

    for (const modelId of models) {
      if (generated.before && generated.after) break;
      try {
        const [before, after] = await Promise.allSettled([
          generateImage({
            model: provider.imageModel(modelId),
            prompt: HERO_BEFORE_PROMPT,
            n: 1,
            size: "1024x1024",
          }),
          generateImage({
            model: provider.imageModel(modelId),
            prompt: HERO_AFTER_PROMPT,
            n: 1,
            size: "1024x1024",
          }),
        ]);
        if (before.status === "fulfilled" && before.value.images[0])
          generated.before = before.value.images[0].base64;
        if (after.status === "fulfilled" && after.value.images[0])
          generated.after = after.value.images[0].base64;
      } catch (error) {
        console.error(`Hero image generation failed with ${modelId}:`, error);
      }
    }

    if (!generated.before || !generated.after) {
      console.error("Could not generate hero images with any gateway model.");
      return null;
    }

    try {
      await fs.mkdir(path.join(process.cwd(), "public", "uploads"), { recursive: true });
      await fs.writeFile(beforePath, Buffer.from(generated.before, "base64"));
      await fs.writeFile(afterPath, Buffer.from(generated.after, "base64"));
      return {
        before: uploadUrl("hero-ai-before.png"),
        after: uploadUrl("hero-ai-after.png"),
      } satisfies HeroImages;
    } catch (error) {
      console.error("Could not cache hero images to disk, sending inline:", error);
      return {
        before: `data:image/png;base64,${generated.before}`,
        after: `data:image/png;base64,${generated.after}`,
      } satisfies HeroImages;
    }
  });

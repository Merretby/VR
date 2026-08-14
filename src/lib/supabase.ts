import { createClient } from "@supabase/supabase-js";

// supabase-js v2.112+ eagerly constructs a RealtimeClient inside createClient(),
// which requires a WebSocket implementation. This app never uses realtime, but
// on Node runtimes without a native WebSocket (e.g. Node 20) the client fails
// to construct. Since this module is only loaded server-side, we polyfill the
// global with the `ws` package when needed.
if (typeof globalThis.WebSocket === "undefined") {
  const { WebSocket } = await import("ws");
  globalThis.WebSocket = WebSocket as unknown as typeof WebSocket;
}

const supabaseUrl = process.env.SUPABASE_URL;

const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is missing");
}

if (!supabaseSecretKey) {
  throw new Error("SUPABASE_SECRET_KEY is missing");
}

export const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET ?? "vr-images";

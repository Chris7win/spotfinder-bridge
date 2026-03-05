// ============================================================
//  SPOTFINDER IOT — MQTT to Supabase Bridge v3.0
//  Supabase URL  : https://wvhsbojctjegijyyoqby.supabase.co
//  Table         : parking_slots (single source of truth)
//  Operation     : UPDATE is_occupied + last_updated on rows 1-4
// ============================================================

const mqtt = require("mqtt");
const { createClient } = require("@supabase/supabase-js");

// ── Supabase Config ──────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || "https://wvhsbojctjegijyyoqby.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2aHNib2pjdGplZ2lqeXlvcWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MjI0NjAsImV4cCI6MjA4Njk5ODQ2MH0.1EFbIFpLMxtAaw1UfQj56r8zcQaX13yb_MHtj8ZXM7A";

// ── MQTT Config ──────────────────────────────────────────────
const MQTT_BROKER = "mqtt://test.mosquitto.org";
const MQTT_TOPIC  = "spotfinder/slots";
const MQTT_CLIENT = `bridge_${Math.random().toString(16).slice(2, 8)}`;

// ── Init clients ─────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const client = mqtt.connect(MQTT_BROKER, {
  port:            1883,
  clientId:        MQTT_CLIENT,
  clean:           true,
  reconnectPeriod: 5000,
});

// ════════════════════════════════════════════════════════════
//  MQTT EVENTS
// ════════════════════════════════════════════════════════════
client.on("connect", () => {
  console.log(`[MQTT] Connected → ${MQTT_BROKER}`);
  client.subscribe(MQTT_TOPIC, { qos: 0 }, (err) => {
    if (err) console.error("[MQTT] Subscribe error:", err.message);
    else     console.log(`[MQTT] Subscribed to: ${MQTT_TOPIC}\n`);
  });
});

client.on("reconnect", () => console.log("[MQTT] Reconnecting..."));
client.on("error",     (e) => console.error("[MQTT] Error:", e.message));
client.on("offline",   ()  => console.warn("[MQTT] Offline"));

// ════════════════════════════════════════════════════════════
//  MESSAGE HANDLER
//  Incoming: {"slot1":0,"slot2":1,"slot3":0,"slot4":1,"free":2,"total":4,"ts":12345}
//  0 = free, 1 = occupied
//
//  Writes to: parking_slots.is_occupied for slot_id 1-4
//  Dashboard realtime channel picks up the change automatically
// ════════════════════════════════════════════════════════════
client.on("message", async (topic, message) => {
  const raw = message.toString();
  console.log(`[MQTT] ← ${raw}`);

  // Parse JSON
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error("[ERROR] Invalid JSON:", raw);
    return;
  }

  // Validate
  if (data.slot1 === undefined || data.slot2 === undefined ||
      data.slot3 === undefined || data.slot4 === undefined) {
    console.error("[ERROR] Missing slot keys in payload");
    return;
  }

  const slots = [data.slot1, data.slot2, data.slot3, data.slot4];
  const now   = new Date().toISOString();

  // Update is_occupied in parking_slots for rows slot_id 1-4
  for (let i = 0; i < 4; i++) {
    const slot_id     = i + 1;
    const is_occupied = slots[i] === 1;

    const { error } = await supabase
      .from("parking_slots")
      .update({
        is_occupied,
        last_updated: now,
      })
      .eq("slot_id", slot_id);

    if (error) console.error(`[Supabase] ✗ slot_id=${slot_id}:`, error.message);
    else       console.log(`[Supabase] ✓ slot_id=${slot_id} → is_occupied=${is_occupied}`);
  }

  // Also update last_heartbeat in slot_status (hardware health)
  for (let i = 0; i < 4; i++) {
    await supabase
      .from("slot_status")
      .update({ last_heartbeat: now, physical_status: "ok" })
      .eq("slot_num", i + 1);
  }

  console.log(`[Done] Free slots: ${data.free}/4\n`);
});

// ════════════════════════════════════════════════════════════
//  GRACEFUL SHUTDOWN
// ════════════════════════════════════════════════════════════
process.on("SIGINT", () => {
  console.log("\n[BRIDGE] Shutting down...");
  client.end();
  process.exit(0);
});

// ════════════════════════════════════════════════════════════
//  STARTUP LOG
// ════════════════════════════════════════════════════════════
console.log("╔══════════════════════════════════════════════╗");
console.log("║    SPOTFINDER IOT — MQTT → Supabase Bridge  ║");
console.log("╠══════════════════════════════════════════════╣");
console.log(`║  MQTT    : ${MQTT_BROKER}`);
console.log(`║  Topic   : ${MQTT_TOPIC}`);
console.log(`║  Table   : parking_slots (is_occupied)`);
console.log(`║  Supabase: ${SUPABASE_URL}`);
console.log("╚══════════════════════════════════════════════╝\n");
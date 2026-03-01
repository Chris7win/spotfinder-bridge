// ============================================================
//  SPOTFINDER IOT — MQTT to Supabase Bridge
//  Supabase URL  : https://wvhsbojctjegijyyoqby.supabase.co
//  Table         : slot_status
//  Operation     : UPDATE rows (slot_num 1-4 already exist)
// ============================================================

const mqtt = require("mqtt");
const { createClient } = require("@supabase/supabase-js");

// ── Supabase Config ──────────────────────────────────────────
const SUPABASE_URL  = process.env.SUPABASE_URL  || "https://wvhsbojctjegijyyoqby.supabase.co";
const SUPABASE_KEY  = process.env.SUPABASE_KEY  || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2aHNib2pjdGplZ2lqeXlvcWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MjI0NjAsImV4cCI6MjA4Njk5ODQ2MH0.1EFbIFpLMxtAaw1UfQj56r8zcQaX13yb_MHtj8ZXM7A";

// ── MQTT Config ──────────────────────────────────────────────
const MQTT_BROKER   = "mqtt://broker.hivemq.com";
const MQTT_TOPIC    = "spotfinder/slots";
const MQTT_CLIENT   = `bridge_${Math.random().toString(16).slice(2, 8)}`;

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
//  Payload from Blue Pill:
//  {"id":"spotfinder_node1","slots":[0,1,0,0],"free":3}
//  slots[n]: 0 = free, 1 = occupied
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

  // Validate slots array
  if (!Array.isArray(data.slots) || data.slots.length < 4) {
    console.error("[ERROR] Missing slots array in payload");
    return;
  }

  const now = new Date().toISOString();

  // Update each slot row individually (slot_num 1 to 4)
  for (let i = 0; i < 4; i++) {
    const slot_num       = i + 1;
    const is_occupied    = data.slots[i] === 1;
    const physical_status = is_occupied ? "occupied" : "free";
    const display_status  = is_occupied ? "O" : "F";

    const { error } = await supabase
      .from("slot_status")
      .update({
        physical_status,
        display_status,
        last_updated:   now,
        last_heartbeat: now,
        is_active:      true,
      })
      .eq("slot_num", slot_num);

    if (error) {
      console.error(`[Supabase] ✗ slot_num=${slot_num} error:`, error.message);
    } else {
      console.log(`[Supabase] ✓ slot_num=${slot_num} → ${physical_status} (${display_status})`);
    }
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
console.log(`║  Table   : slot_status (UPDATE mode)`);
console.log(`║  Supabase: ${SUPABASE_URL}`);
console.log("╚══════════════════════════════════════════════╝\n");

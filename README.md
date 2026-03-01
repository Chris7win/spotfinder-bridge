# SPOTFINDER IOT — MQTT to Supabase Bridge

## What this does
Subscribes to HiveMQ MQTT broker topic `spotfinder/slots`
and UPDATEs rows in Supabase `slot_status` table on every message.

## Deploy to Render (3 steps)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "spotfinder bridge"
git remote add origin https://github.com/YOUR_USERNAME/spotfinder-bridge.git
git push -u origin main
```

### 2. Create Render Background Worker
- Go to render.com → New → Background Worker
- Connect your GitHub repo
- Build command: `npm install`
- Start command:  `npm start`

### 3. Add Environment Variables on Render
| Key           | Value                                      |
|---------------|--------------------------------------------|
| SUPABASE_URL  | https://wvhsbojctjegijyyoqby.supabase.co   |
| SUPABASE_KEY  | your anon key                              |

## Test Locally
```bash
npm install
node index.js
```

## Expected Console Output
```
╔══════════════════════════════════════════════╗
║    SPOTFINDER IOT — MQTT → Supabase Bridge  ║
╚══════════════════════════════════════════════╝

[MQTT] Connected → mqtt://broker.hivemq.com
[MQTT] Subscribed to: spotfinder/slots

[MQTT] ← {"id":"spotfinder_node1","slots":[0,1,0,0],"free":3}
[Supabase] ✓ slot_num=1 → free (F)
[Supabase] ✓ slot_num=2 → occupied (O)
[Supabase] ✓ slot_num=3 → free (F)
[Supabase] ✓ slot_num=4 → free (F)
[Done] Free slots: 3/4
```

## MQTT Payload Format (from Blue Pill)
```json
{"id":"spotfinder_node1","slots":[0,1,0,0],"free":3}
```
- `slots[n]` = 0 → free, 1 → occupied
- Maps to slot_num 1,2,3,4 in Supabase

## Supabase slot_status columns updated
| Column          | Value when free | Value when occupied |
|-----------------|-----------------|---------------------|
| physical_status | "free"          | "occupied"          |
| display_status  | "F"             | "O"                 |
| last_updated    | current time    | current time        |
| last_heartbeat  | current time    | current time        |
| is_active       | true            | true                |

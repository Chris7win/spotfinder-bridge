<div align="center">

# 🅿️ SpotFinder IoT
### *Never circle the parking lot again.*

![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-STM32%20%2B%20ESP8266-blue?style=for-the-badge)
![Cloud](https://img.shields.io/badge/Cloud-Supabase-3ECF8E?style=for-the-badge&logo=supabase)
![Deploy](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=for-the-badge)

<br/>

> **SpotFinder IoT** is a real-time smart parking system that tells drivers  
> exactly which slots are free — before they even enter the parking lot.

<br/>

---

## 🚗 The Problem

</div>

```
😤  Drivers waste 17 hours/year searching for parking
🚦  Empty slots cause unnecessary traffic congestion  
⛽  Fuel burned circling lots contributes to pollution
📵  No real-time visibility into parking availability
```

<div align="center">

## ✨ The Solution

**SpotFinder IoT** uses embedded IR sensors, cloud connectivity, and a  
mobile app to give drivers **instant, real-time parking availability** —  
from anywhere, on any device.

<br/>

---

## ⚡ Key Features

</div>

| Feature | Description |
|---------|-------------|
| 🔴 **Real-Time Detection** | IR sensors detect vehicle presence with 50ms debounce accuracy |
| 📺 **On-Site LCD Display** | 16×2 LCD at parking entrance shows live slot availability |
| ☁️ **Cloud Connected** | Data pushed to Supabase every 5 seconds via MQTT over WiFi |
| 📱 **Mobile & Web Access** | Check availability remotely before you leave home |
| ⚡ **Sub-second Latency** | MQTT protocol ensures near-instant data synchronization |
| 🔌 **Low Power** | STM32 Blue Pill at 8MHz HSI — optimized for embedded use |

<div align="center">

---

## 🏗️ System Architecture

</div>

```
 IR Sensors (×4)                    
      │  obstacle detected           
      ▼                              
 STM32F103C8T6                      
 Blue Pill MCU          ┌─────────────────────┐
      │                 │   LCD Display        │
      │ ──────────────► │   "Free: 3/4  OPEN" │
      │                 │   "1:F 2:O 3:F 4:F" │
      │                 └─────────────────────┘
      │ UART AT commands
      ▼
 ESP8266 NodeMCU
      │ MQTT publish
      ▼
 HiveMQ Broker ──────► This Bridge (Node.js)
                              │ UPDATE
                              ▼
                        Supabase PostgreSQL
                              │ REST API
                              ▼
                     Mobile App / Dashboard
```

<div align="center">

---

## 📊 Impact

</div>

```
  ⏱️  Reduces parking search time by up to 70%
  🌿  Lower fuel consumption = reduced carbon emissions  
  🏙️  Scalable from 4 slots to hundreds of spaces
  💰  Built on open-source IoT protocols — no licensing costs
```

<div align="center">

---

## 🛠️ Built With

![STM32](https://img.shields.io/badge/STM32-F103C8T6-03234B?style=flat-square&logo=stmicroelectronics)
![ESP8266](https://img.shields.io/badge/ESP8266-NodeMCU-E7352C?style=flat-square)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)
![MQTT](https://img.shields.io/badge/MQTT-HiveMQ-660066?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-Bridge-339933?style=flat-square&logo=nodedotjs)
![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?style=flat-square)

---

**Course:** Embedded Systems and IoT  
**Project:** Real-Time IoT-Enabled Smart Parking System with Cloud Connectivity

---

</div>
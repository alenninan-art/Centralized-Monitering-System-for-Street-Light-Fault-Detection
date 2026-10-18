import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, update, push, onValue, get } from "firebase/database";
import type { StreetLight, FaultRecord, AlertNotification } from "./types/iot";
import { INITIAL_STREET_LIGHTS, INITIAL_FAULTS, INITIAL_ALERTS } from "./data/mockStreetLights";

// ── Firebase project config ──────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCHLpGTfvwhHGAAyxgxeoD4DtwMNaM9OPk",
  authDomain: "centralized-streetlight.firebaseapp.com",
  databaseURL:
    "https://centralized-streetlight-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "centralized-streetlight",
  storageBucket: "centralized-streetlight.firebasestorage.app",
  messagingSenderId: "436103297445",
  appId: "1:436103297445:web:246e1569fd7fd19b28104c",
  measurementId: "G-LDG9ZSJBM9",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Seed the Firebase Realtime Database with initial mock data.
 * Only runs once — if the "streetlights" node already has data it is skipped.
 */
export async function seedDatabaseIfEmpty(): Promise<void> {
  try {
    const snap = await get(ref(db, "streetlights"));
    if (snap.exists()) {
      console.log("[Firebase] DB already seeded, skipping.");
      return;
    }

    console.log("[Firebase] Seeding initial street-light data...");
    // Convert array to keyed object (Firebase Realtime DB prefers keyed maps)
    const lightsMap: Record<string, StreetLight> = {};
    INITIAL_STREET_LIGHTS.forEach((l) => {
      lightsMap[l.id] = l;
    });
    await set(ref(db, "streetlights"), lightsMap);

    // Seed faults
    const faultsMap: Record<string, FaultRecord> = {};
    INITIAL_FAULTS.forEach((f) => {
      faultsMap[f.faultId] = f;
    });
    await set(ref(db, "faults"), faultsMap);

    // Seed alerts
    const alertsMap: Record<string, AlertNotification> = {};
    INITIAL_ALERTS.forEach((a) => {
      alertsMap[a.id] = a;
    });
    await set(ref(db, "alerts"), alertsMap);

    console.log("[Firebase] Seeding complete.");
  } catch (err) {
    console.error("[Firebase] Seed error:", err);
  }
}

// ── Street-light DB helpers ──────────────────────────────────────────────────

export function subscribeToStreetLights(
  callback: (lights: StreetLight[]) => void
) {
  const lightsRef = ref(db, "streetlights");
  return onValue(lightsRef, (snap) => {
    const val = snap.val();
    if (!val) {
      callback(INITIAL_STREET_LIGHTS);
      return;
    }
    // Normalize each record — Firebase may omit fields that weren't written
    const lights: StreetLight[] = (Object.values(val) as StreetLight[])
      .filter((l) => l && l.id)                // drop any null/partial entries
      .map((l) => ({
        ...l,
        status:          l.status          ?? 'working',
        faultType:       l.faultType       ?? 'none',
        severity:        l.severity        ?? 'none',
        location:        l.location        ?? '',
        zone:            l.zone            ?? '',
        name:            l.name            ?? l.id,
        voltage:         l.voltage         ?? 0,
        current:         l.current         ?? 0,
        power:           l.power           ?? 0,
        lightIntensity:  l.lightIntensity  ?? 0,
        temperature:     l.temperature     ?? 0,
        relayState:      l.relayState      ?? false,
        dimmingLevel:    l.dimmingLevel     ?? 100,
        lastUpdated:     l.lastUpdated      ?? 'Unknown',
        esp32DeviceId:   l.esp32DeviceId   ?? '',
        energyConsumption: l.energyConsumption ?? 0,
        installationDate:  l.installationDate  ?? '',
        lat:             l.lat             ?? 0,
        lng:             l.lng             ?? 0,
      }));
    callback(lights);
  });
}

export function subscribeToFaults(callback: (faults: FaultRecord[]) => void) {
  const faultsRef = ref(db, "faults");
  return onValue(faultsRef, (snap) => {
    const val = snap.val();
    if (!val) {
      callback(INITIAL_FAULTS);
      return;
    }
    const faults: FaultRecord[] = (Object.values(val) as FaultRecord[]).sort(
      (a, b) => b.detectedTime.localeCompare(a.detectedTime)
    );
    callback(faults);
  });
}

export function subscribeToAlerts(
  callback: (alerts: AlertNotification[]) => void
) {
  const alertsRef = ref(db, "alerts");
  return onValue(alertsRef, (snap) => {
    const val = snap.val();
    if (!val) {
      callback(INITIAL_ALERTS);
      return;
    }
    const alerts: AlertNotification[] = (Object.values(val) as AlertNotification[]).sort(
      (a, b) => b.timestamp.localeCompare(a.timestamp)
    );
    callback(alerts);
  });
}

export async function updateStreetLightInDB(
  poleId: string,
  changes: Partial<StreetLight>
): Promise<void> {
  try {
    await update(ref(db, `streetlights/${poleId}`), changes);
  } catch (err) {
    console.error("[Firebase] updateStreetLight error:", err);
  }
}

export async function addFaultToDB(fault: FaultRecord): Promise<void> {
  try {
    await set(ref(db, `faults/${fault.faultId}`), fault);
  } catch (err) {
    console.error("[Firebase] addFault error:", err);
  }
}

export async function updateFaultInDB(
  faultId: string,
  changes: Partial<FaultRecord>
): Promise<void> {
  try {
    await update(ref(db, `faults/${faultId}`), changes);
  } catch (err) {
    console.error("[Firebase] updateFault error:", err);
  }
}

export async function addAlertToDB(alert: AlertNotification): Promise<void> {
  try {
    await set(ref(db, `alerts/${alert.id}`), alert);
  } catch (err) {
    console.error("[Firebase] addAlert error:", err);
  }
}

export async function updateAlertInDB(
  alertId: string,
  changes: Partial<AlertNotification>
): Promise<void> {
  try {
    await update(ref(db, `alerts/${alertId}`), changes);
  } catch (err) {
    console.error("[Firebase] updateAlert error:", err);
  }
}

export async function clearAlertsInDB(): Promise<void> {
  try {
    await set(ref(db, "alerts"), {});
  } catch (err) {
    console.error("[Firebase] clearAlerts error:", err);
  }
}

// Re-export push for any external use
export { push };
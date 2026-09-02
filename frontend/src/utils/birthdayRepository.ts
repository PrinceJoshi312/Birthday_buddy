import { Person, PersonInput } from '../types';
import { calculateBirthdayDetails, parseBirthday } from './dateUtils';

const DB_NAME = 'BirthdayBuddyDB';
const DB_VERSION = 1;
const STORE_NAME = 'people';

export interface BirthdayBackupPayload {
  app: 'birthday-buddy';
  version: number;
  exported_at: string;
  people: {
    id?: number;
    name: string;
    birthday: string; // YYYY-MM-DD or MM-DD
    birth_year?: number | null;
    relationship: string;
    notes?: string;
    reminder_days?: string;
    reminder_time?: string;
    created_at?: string;
  }[];
}

/**
 * Initializes and opens the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported on this device/browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('birthday', 'birthday', { unique: false });
        store.createIndex('relationship', 'relationship', { unique: false });
        store.createIndex('created_at', 'created_at', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open Birthday Buddy database'));
    };
  });
}

/**
 * Executes a transaction and returns the object store
 */
async function getStore(mode: IDBTransactionMode): Promise<{ store: IDBObjectStore; tx: IDBTransaction }> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, mode);
  const store = tx.objectStore(STORE_NAME);
  return { store, tx };
}

/**
 * Retrieves all people stored in IndexedDB
 */
export async function getAllPeople(): Promise<Person[]> {
  const { store, tx } = await getStore('readonly');

  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to fetch people from database'));
    };

    tx.oncomplete = () => {
      // Transaction completed
    };
  });
}

/**
 * Retrieves all people with calculated countdowns and sorted by nearest upcoming birthday
 */
export async function getUpcomingBirthdays(): Promise<Person[]> {
  const people = await getAllPeople();

  const enrichedPeople = people.map((person) => {
    const details = calculateBirthdayDetails(person.birthday);
    return {
      ...person,
      days_remaining: details.days_remaining,
      days_until: details.days_until,
      age_turning: details.age_turning,
      has_year: details.has_year,
      is_today: details.is_today,
      next_birthday: details.next_birthday,
    };
  });

  // Sort ascending by days remaining (0 = today first, then 1, 2, ... nearest)
  enrichedPeople.sort((a, b) => (a.days_remaining ?? 999) - (b.days_remaining ?? 999));

  return enrichedPeople;
}

/**
 * Retrieves a single person by their ID
 */
export async function getPerson(id: number): Promise<Person | null> {
  const { store } = await getStore('readonly');

  return new Promise((resolve, reject) => {
    const request = store.get(id);

    request.onsuccess = () => {
      const person = request.result;
      if (!person) {
        resolve(null);
        return;
      }
      const details = calculateBirthdayDetails(person.birthday);
      resolve({
        ...person,
        days_remaining: details.days_remaining,
        days_until: details.days_until,
        age_turning: details.age_turning,
        has_year: details.has_year,
        is_today: details.is_today,
        next_birthday: details.next_birthday,
      });
    };

    request.onerror = () => {
      reject(request.error || new Error(`Failed to get person with id ${id}`));
    };
  });
}

/**
 * Creates and stores a new person in IndexedDB
 */
export async function createPerson(input: PersonInput): Promise<Person> {
  const { store, tx } = await getStore('readwrite');

  const parsed = parseBirthday(input.birthday);
  const newRecord: Omit<Person, 'id'> = {
    name: input.name.trim(),
    birthday: input.birthday.trim(),
    birth_year: parsed?.hasYear ? parsed.birthYear : null,
    relationship: input.relationship.trim(),
    notes: input.notes?.trim() || '',
    reminder_days: input.reminder_days || 'on_day,1_day_before',
    reminder_time: input.reminder_time || '09:00',
    created_at: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const request = store.add(newRecord);

    request.onsuccess = () => {
      const generatedId = request.result as number;
      const details = calculateBirthdayDetails(newRecord.birthday);
      const createdPerson: Person = {
        ...newRecord,
        id: generatedId,
        days_remaining: details.days_remaining,
        days_until: details.days_until,
        age_turning: details.age_turning,
        has_year: details.has_year,
        is_today: details.is_today,
        next_birthday: details.next_birthday,
      };
      resolve(createdPerson);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to save person to database'));
    };

    tx.onabort = () => {
      reject(new Error('Transaction aborted while adding person'));
    };
  });
}

/**
 * Updates an existing person in IndexedDB
 */
export async function updatePerson(id: number, input: Partial<PersonInput>): Promise<Person> {
  const { store, tx } = await getStore('readwrite');

  return new Promise((resolve, reject) => {
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const existing = getReq.result as Person;
      if (!existing) {
        reject(new Error(`Person with id ${id} not found in database`));
        return;
      }

      const targetBirthday = input.birthday !== undefined ? input.birthday.trim() : existing.birthday;
      const parsed = parseBirthday(targetBirthday);

      const updatedRecord: Person = {
        ...existing,
        name: input.name !== undefined ? input.name.trim() : existing.name,
        birthday: targetBirthday,
        birth_year: parsed?.hasYear ? parsed.birthYear : null,
        relationship: input.relationship !== undefined ? input.relationship.trim() : existing.relationship,
        notes: input.notes !== undefined ? input.notes.trim() : existing.notes,
        reminder_days: input.reminder_days !== undefined ? input.reminder_days : existing.reminder_days,
        reminder_time: input.reminder_time !== undefined ? input.reminder_time : existing.reminder_time,
      };

      const putReq = store.put(updatedRecord);

      putReq.onsuccess = () => {
        const details = calculateBirthdayDetails(updatedRecord.birthday);
        resolve({
          ...updatedRecord,
          days_remaining: details.days_remaining,
          days_until: details.days_until,
          age_turning: details.age_turning,
          has_year: details.has_year,
          is_today: details.is_today,
          next_birthday: details.next_birthday,
        });
      };

      putReq.onerror = () => {
        reject(putReq.error || new Error(`Failed to update person with id ${id}`));
      };
    };

    getReq.onerror = () => {
      reject(getReq.error || new Error(`Failed to read person with id ${id}`));
    };

    tx.onabort = () => {
      reject(new Error('Transaction aborted while updating person'));
    };
  });
}

/**
 * Deletes a person from IndexedDB by their ID
 */
export async function deletePerson(id: number): Promise<void> {
  const { store, tx } = await getStore('readwrite');

  return new Promise((resolve, reject) => {
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error || new Error(`Failed to delete person with id ${id}`));
    };

    tx.onabort = () => {
      reject(new Error('Transaction aborted while deleting person'));
    };
  });
}

/**
 * Clears all people records from IndexedDB
 */
export async function clearAllPeople(): Promise<void> {
  const { store, tx } = await getStore('readwrite');

  return new Promise((resolve, reject) => {
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to clear database'));
    };

    tx.onabort = () => {
      reject(new Error('Transaction aborted while clearing database'));
    };
  });
}

/**
 * Generates an exportable JSON payload of all birthdays
 */
export async function exportBackupData(): Promise<BirthdayBackupPayload> {
  const people = await getAllPeople();

  const cleanPeople = people.map((p) => {
    const parsed = parseBirthday(p.birthday);
    return {
      id: p.id,
      name: p.name,
      birthday: p.birthday,
      birth_year: parsed?.hasYear ? parsed.birthYear : null,
      relationship: p.relationship,
      notes: p.notes || '',
      reminder_days: p.reminder_days || 'on_day,1_day_before',
      reminder_time: p.reminder_time || '09:00',
      created_at: p.created_at || new Date().toISOString(),
    };
  });

  return {
    app: 'birthday-buddy',
    version: 1,
    exported_at: new Date().toISOString(),
    people: cleanPeople,
  };
}

/**
 * Triggers a client-side file download of the birthday backup
 */
export async function triggerDownloadBackup(): Promise<{ count: number; filename: string }> {
  const payload = await exportBackupData();
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const todayStr = new Date().toISOString().split('T')[0];
  const filename = `birthday-buddy-backup-${todayStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    count: payload.people.length,
    filename,
  };
}

/**
 * Validates and parses raw backup JSON text
 */
export function validateBackupPayload(rawText: string): BirthdayBackupPayload {
  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("That doesn't look like valid JSON. Please check the file.");
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error("That doesn't look like a valid Birthday Buddy backup.");
  }

  if (parsed.app !== 'birthday-buddy') {
    throw new Error("Invalid backup file: Not a Birthday Buddy backup (missing app identifier).");
  }

  if (!Array.isArray(parsed.people)) {
    throw new Error("Invalid backup format: 'people' list is missing or corrupted.");
  }

  // Validate and sanitize each person entry
  const sanitizedPeople: BirthdayBackupPayload['people'] = [];

  for (let i = 0; i < parsed.people.length; i++) {
    const item = parsed.people[i];
    if (!item || typeof item !== 'object') continue;

    const name = typeof item.name === 'string' ? item.name.trim() : '';
    const rawBirthday = typeof item.birthday === 'string' ? item.birthday.trim() : '';

    if (!name || !rawBirthday) continue;

    const parsedDate = parseBirthday(rawBirthday);
    if (!parsedDate) continue; // Skip unparseable dates

    sanitizedPeople.push({
      id: typeof item.id === 'number' ? item.id : undefined,
      name,
      birthday: rawBirthday,
      birth_year: parsedDate.hasYear ? parsedDate.birthYear : null,
      relationship: typeof item.relationship === 'string' && item.relationship.trim() ? item.relationship.trim() : 'Other',
      notes: typeof item.notes === 'string' ? item.notes.trim() : '',
      reminder_days: typeof item.reminder_days === 'string' && item.reminder_days ? item.reminder_days : 'on_day,1_day_before',
      reminder_time: typeof item.reminder_time === 'string' && item.reminder_time ? item.reminder_time : '09:00',
      created_at: typeof item.created_at === 'string' ? item.created_at : new Date().toISOString(),
    });
  }

  return {
    app: 'birthday-buddy',
    version: typeof parsed.version === 'number' ? parsed.version : 1,
    exported_at: typeof parsed.exported_at === 'string' ? parsed.exported_at : new Date().toISOString(),
    people: sanitizedPeople,
  };
}

/**
 * Computes a normalized key for duplicate matching (normalized name + month + day)
 */
function getDuplicateKey(name: string, birthdayStr: string): string {
  const parsed = parseBirthday(birthdayStr);
  const normName = name.trim().toLowerCase();
  if (parsed) {
    const mStr = String(parsed.month).padStart(2, '0');
    const dStr = String(parsed.day).padStart(2, '0');
    return `${normName}_${mStr}-${dStr}`;
  }
  return `${normName}_${birthdayStr.trim()}`;
}

/**
 * Imports backup data into IndexedDB with Merge or Replace mode
 */
export async function importBackupData(
  payload: BirthdayBackupPayload,
  mode: 'merge' | 'replace'
): Promise<{ importedCount: number; skippedDuplicates: number }> {
  if (mode === 'replace') {
    await clearAllPeople();
    let count = 0;
    for (const p of payload.people) {
      await createPerson({
        name: p.name,
        birthday: p.birthday,
        relationship: p.relationship,
        notes: p.notes,
        reminder_days: p.reminder_days,
        reminder_time: p.reminder_time,
      });
      count++;
    }
    return { importedCount: count, skippedDuplicates: 0 };
  }

  // Merge Mode: check existing records by normalized name + month + day
  const existingPeople = await getAllPeople();
  const existingSet = new Set<string>();

  for (const p of existingPeople) {
    existingSet.add(getDuplicateKey(p.name, p.birthday));
  }

  let importedCount = 0;
  let skippedDuplicates = 0;

  for (const p of payload.people) {
    const key = getDuplicateKey(p.name, p.birthday);
    if (existingSet.has(key)) {
      skippedDuplicates++;
    } else {
      await createPerson({
        name: p.name,
        birthday: p.birthday,
        relationship: p.relationship,
        notes: p.notes,
        reminder_days: p.reminder_days,
        reminder_time: p.reminder_time,
      });
      existingSet.add(key);
      importedCount++;
    }
  }

  return { importedCount, skippedDuplicates };
}

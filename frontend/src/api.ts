/**
 * Standalone Client-Side Data Service
 * 
 * Re-exports the IndexedDB repository for seamless, offline-first data operations.
 * Zero network requests or backend dependencies required.
 */
export {
  getAllPeople as fetchPeople,
  getUpcomingBirthdays as fetchUpcomingBirthdays,
  getPerson,
  createPerson,
  updatePerson,
  deletePerson,
  clearAllPeople,
  exportBackupData,
  triggerDownloadBackup,
  validateBackupPayload,
  importBackupData,
  type BirthdayBackupPayload,
} from './utils/birthdayRepository';

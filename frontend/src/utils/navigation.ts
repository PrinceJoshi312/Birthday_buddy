/**
 * Centralized Mobile & Browser History Navigation Helper
 * 
 * Provides unified, coordinated history stack synchronization for Android back gestures,
 * browser Back/Forward navigation, and modal/screen transitions.
 */

export type NavView = 
  | 'dashboard'
  | 'detail'
  | 'add'
  | 'settings'
  | 'import_confirm'
  | 'edit'
  | 'delete';

export interface AppNavState {
  view: NavView;
  personId?: number;
}

/**
 * Initializes the history state on app boot without pushing extra entries
 */
export function initHistoryState(): void {
  if (typeof window === 'undefined') return;
  if (!window.history.state || !window.history.state.view) {
    window.history.replaceState({ view: 'dashboard' } as AppNavState, '');
  }
}

/**
 * Pushes a new view state to browser history
 */
export function pushNav(view: NavView, personId?: number): void {
  if (typeof window === 'undefined') return;
  const current = window.history.state as AppNavState | null;
  // Prevent duplicate consecutive pushes
  if (current && current.view === view && current.personId === personId) {
    return;
  }
  window.history.pushState({ view, personId } as AppNavState, '');
}

/**
 * Navigates back in browser history safely
 */
export function popNav(): void {
  if (typeof window === 'undefined') return;
  window.history.back();
}

/**
 * Navigates back multiple steps (e.g. closing detail after deletion)
 */
export function popNavSteps(steps: number): void {
  if (typeof window === 'undefined') return;
  window.history.go(-steps);
}

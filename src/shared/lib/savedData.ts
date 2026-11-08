/** Every key this app saves in the browser starts with this. */
const PREFIX = 'roadtrack-';
/** The chosen language survives a reset, so the page does not switch language on the user. */
const KEEP = 'roadtrack-v3-lang';

/** Deletes everything RoadTrack saved on this device, except the language. */
export function clearSavedData() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX) && k !== KEEP)
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // Storage can be blocked (private mode). There is nothing to clear then.
  }
}

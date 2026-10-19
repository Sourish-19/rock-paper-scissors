import { deleteDoc, doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Unique usernames. Each name is reserved as `usernames/{lowercased name}` holding only the owner's uid, so names
 * can be checked before sign-up (the collection is publicly readable) without exposing anyone's email.
 */
export const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,12}$/;
export class UsernameTakenError extends Error { constructor() { super('Username taken'); } }

const key = (name: string) => name.trim().toLowerCase();
const ref = (name: string) => doc(db, 'usernames', key(name));

/** True when nobody else owns this name. */
export async function isUsernameAvailable(name: string, uid?: string) {
  const snapshot = await getDoc(ref(name));
  return !snapshot.exists() || snapshot.data().uid === uid;
}

/** Reserves `name` for `uid`, optionally releasing `previous` in the same transaction. Throws UsernameTakenError. */
export async function reserveUsername(name: string, uid: string, previous?: string) {
  await runTransaction(db, async transaction => {
    const wanted = await transaction.get(ref(name));
    if (wanted.exists() && wanted.data().uid !== uid) throw new UsernameTakenError();
    const old = previous && key(previous) !== key(name) ? await transaction.get(ref(previous)) : null;
    if (!wanted.exists()) transaction.set(ref(name), { uid, name: name.trim() });
    if (old?.exists() && old.data().uid === uid) transaction.delete(ref(previous!));
  });
}

/** Best-effort: reserve an existing account's current name if it's still free (accounts made before reservations). */
export async function claimExistingUsername(name: string | null | undefined, uid: string) {
  if (!name || !USERNAME_PATTERN.test(name.trim())) return;
  try { await reserveUsername(name, uid); } catch { /* taken by someone else, or offline: leave it */ }
}

/** Frees a name owned by `uid` (used when a just-created account is rolled back). */
export async function releaseUsername(name: string, uid: string) {
  const snapshot = await getDoc(ref(name));
  if (snapshot.exists() && snapshot.data().uid === uid) await deleteDoc(ref(name));
}

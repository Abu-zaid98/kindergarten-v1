import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, ensureSettings, updateSettings } from '../db/db';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { useAppStore } from '../store/appStore';

export function useSettings() {
  return useLiveQuery(() => db.settings.get('app_settings'), []);
}

export function useAuth() {
  const settings = useSettings();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const current = await ensureSettings();
      const rememberOk = current.rememberUntil && new Date(current.rememberUntil) > new Date();
      if (rememberOk) setAuthenticated(true);
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [setAuthenticated]);

  const needsSetup = ready && !settings?.passwordHash;

  async function setupPassword(password) {
    const passwordHash = await hashPassword(password);
    await updateSettings({ passwordHash, rememberUntil: '' });
    setAuthenticated(true);
  }

  async function login(password, remember) {
    const current = await ensureSettings();
    const ok = await verifyPassword(password, current.passwordHash);
    if (!ok) return false;
    if (remember) {
      const until = new Date();
      until.setDate(until.getDate() + 7);
      await updateSettings({ rememberUntil: until.toISOString() });
    } else {
      await updateSettings({ rememberUntil: '' });
    }
    setAuthenticated(true);
    return true;
  }

  async function changePassword(oldPassword, newPassword) {
    const current = await ensureSettings();
    const ok = await verifyPassword(oldPassword, current.passwordHash);
    if (!ok) return false;
    await updateSettings({ passwordHash: await hashPassword(newPassword) });
    return true;
  }

  async function resetPassword(newPassword) {
    await updateSettings({
      passwordHash: await hashPassword(newPassword),
      rememberUntil: '',
    });
    setAuthenticated(true);
  }

  async function logout() {
    await updateSettings({ rememberUntil: '' });
    setAuthenticated(false);
  }

  return {
    ready,
    settings,
    needsSetup,
    isAuthenticated,
    setupPassword,
    login,
    changePassword,
    resetPassword,
    logout,
  };
}

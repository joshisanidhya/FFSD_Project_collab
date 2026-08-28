import { useCallback, useRef, useState } from 'react';

// Matches the vanilla app's toast(msg) convention: a leading emoji + message,
// e.g. toast('✅ User updated') — split into { icon, text } for rendering.
// Cross-cutting: shared by any converted page that needs a toast, so the UX
// (position, timing, styling via .toast/.show in admin-dashboard.css) stays
// identical across pages instead of every page inventing its own.
export default function useToast() {
  const [toast, setToast] = useState({ visible: false, icon: '✅', text: '' });
  const timerRef = useRef(null);

  const showToast = useCallback((msg) => {
    const match = String(msg).match(/^(\S+)\s(.+)$/);
    const icon = match ? match[1] : '✅';
    const text = match ? match[2] : msg;
    setToast({ visible: true, icon, text });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2800);
  }, []);

  return { toast, showToast };
}

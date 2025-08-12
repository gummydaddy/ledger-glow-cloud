export const cleanupAuthState = () => {
  // Remove specific known keys
  try {
    localStorage.removeItem('supabase.auth.token');
  } catch {}

  // Remove all Supabase auth keys from localStorage
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  } catch {}

  // Remove from sessionStorage as well
  try {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch {}
};

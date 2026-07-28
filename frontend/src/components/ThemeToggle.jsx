import React, { useEffect } from 'react';

export default function ThemeToggle() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  return null;
}

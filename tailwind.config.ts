import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        customRed: '#FF364A ',
      },
      boxShadow: {
        'custom-strong':
          '0 -2px 8px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  daisyui: {
    themes: ['pastel'],
  },
  plugins: [daisyui],
} satisfies Config;

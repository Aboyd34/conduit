/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bg:       '#05050a',
        surface:  '#0b0b17',
        glass:    'rgba(20,20,40,0.6)',
        panel:    '#0f0e1f',
        panel2:   '#13122a',
        primary:  '#5b8cff',
        secondary:'#9b5cff',
        accent:   '#7a5cff',
        signal:   '#00ffc3',
        cyan:     '#00d4ff',
        textMain: '#f1f1f7',
        textDim:  '#8c8ca3',
        border:   'rgba(255,255,255,0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Space Grotesk', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(91,140,255,0.35)',
        'glow-signal': '0 0 10px #00ffc3',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

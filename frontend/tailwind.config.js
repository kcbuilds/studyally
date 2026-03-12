/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#F7F6F3',
        surface: '#FFFFFF',
        s2:      '#F2F1EE',
        s3:      '#E8E6E1',
        ink:     '#111110',
        ink2:    '#3B3A38',
        ink3:    '#706F6C',
        ink4:    '#A8A7A2',
        green:   '#1A5C3A',
        green2:  '#2E7D52',
        greenlt: '#EDF4F0',
        greenmd: '#C8DED4',
        amber:   '#7C4A00',
        amberlt: '#FDF3E3',
        red:     '#8B1A1A',
        redlt:   '#FDF0F0',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans:  ['"Geist"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        xs:    '0 1px 2px rgba(0,0,0,.04)',
        sm:    '0 1px 3px rgba(0,0,0,.05), 0 4px 12px rgba(0,0,0,.04)',
        md:    '0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.06)',
        lg:    '0 4px 16px rgba(0,0,0,.08), 0 16px 48px rgba(0,0,0,.10)',
        green: '0 2px 12px rgba(26,92,58,.18)',
      },
    },
  },
  plugins: [],
}

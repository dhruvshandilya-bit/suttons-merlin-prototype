/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#f6f1fa',100:'#e1d3f0',200:'#bc9fd3',300:'#a074b7',400:'#6e3785',
                 500:'#5d2f70',600:'#4c285b',700:'#3b1f46',800:'#2a1731',900:'#231428',950:'#1b101e' },
        ink:   { 0:'#ffffff',50:'#f7f7f7',100:'#f5f5f5',200:'#ebebeb',300:'#d1d1d1',400:'#a3a3a3',
                 500:'#7b7b7b',600:'#5c5c5c',700:'#333333',800:'#262626',900:'#1c1c1c',950:'#171717' },
        slate2:{ 0:'#ffffff',50:'#f5f7fa',100:'#f2f5f8',200:'#e1e4ea',300:'#cacfd8',400:'#99a0ae',
                 500:'#717784',600:'#525866',700:'#2b303b',800:'#222530',900:'#181b25',950:'#0e121b' },
        line:  '#ebebeb',
        surface:'#f7f7f7',
        ok:    { 50:'#e8f5ee',500:'#1f9254',600:'#177843',700:'#0f5c33' },
        warn:  { 50:'#fdf3e3',500:'#c9974e',600:'#a17439',700:'#6b4c24' },
        danger:{ 50:'#fdecea',500:'#d64545',600:'#b53131',700:'#8f2525' },
        info:  { 50:'#e9f1fb',500:'#2f6fb5',600:'#245a95' },
      },
      fontSize: { '2xs': ['11px', { lineHeight: '14px' }] },
      fontFamily: { sans: ['Inter','ui-sans-serif','system-ui','sans-serif'] },
    },
  },
  plugins: [],
}

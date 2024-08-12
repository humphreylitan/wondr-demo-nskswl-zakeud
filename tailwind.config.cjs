/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', 'src/**/*.tsx'],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: ({ colors }) => ({
        'media-brand': 'rgb(var(--media-brand) / <alpha-value>)',
        'media-focus': 'rgb(var(--media-focus) / <alpha-value>)',
        gray: {
          50: '#f9fafb',
          100: '#f2f2f2',
          200: '#d7d7d7',
          300: '#b3b3b3',
          400: '#9a9a9a',
          500: '#767676',
          600: '#4d4d4d',
          700: '#374151',
          800: '#222222',
          900: '#161e2e',
        },
        blue: {
          ...colors.blue,
          100: '#e6effb',
          200: '#cedff7',
          600: '#3a7fe0',
          700: '#0a5ed8',
          800: '#095fd8',
          900: '#074cad',
        },
        'solid-blue': '#284AD3',
      }),
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@vidstack/react/tailwind.cjs')({
      prefix: 'media',
    }),
    customVariants,
  ],
};

function customVariants({ addVariant, matchVariant }) {
  // Strict version of `.group` to help with nesting.
  matchVariant('parent-data', (value) => `.parent[data-${value}] > &`);

  addVariant('hocus', ['&:hover', '&:focus-visible']);
  addVariant('group-hocus', ['.group:hover &', '.group:focus-visible &']);
}

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './../common/src/components/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        kernel: {
          white: '#ffffff',
          dark: '#212144',
          yellow: {
            light: '#fff7af',
            mid: '#ffcc00',
            dark: '#ffa800'
          },
          green: {
            light: '#5bf1cd',
            mid: '#02e2ac',
            dark: '#11bc92'
          },
          eggplant: {
            light: '#8c65f7',
            mid: '#6f3ff5',
            dark: '#5932c4'
          }
        }
      }
    }
  },
  plugins: []
}

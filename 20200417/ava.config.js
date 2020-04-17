export default () => {
  return {
    files: ['src/**/*.spec.ts'],
    typescript: {
      extensions: ['ts'],
      rewritePaths: {
        'src/': 'dist/',
      },
    },
  };
};

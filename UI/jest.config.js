module.exports = {
  preset: 'ts-jest',
  verbose: true,
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  testMatch: ['**/*.test.+(ts|tsx|js|jsx)'],
  testEnvironment: 'node',
};

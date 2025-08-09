// jest.config.js
module.exports = {
  testEnvironment: 'node',
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'], // optionnel mais recommandé
};

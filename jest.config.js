/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  moduleDirectories: ['node_modules', 'views'],
  moduleNameMapper: {
    '\\.(html)$': '<rootDir>/__tests__/templateMock.ts',
  },
  roots: ['<rootDir>/app/scripts/'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/util/setup.ts'],
  testEnvironment: 'jsdom',
};

module.exports = config;

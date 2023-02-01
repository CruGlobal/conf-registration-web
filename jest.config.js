/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!app/scripts/components/**/*_angular.ts',
    // This line can be removed after tests are written for those components
    '!app/scripts/components/{ExportModal,FormStatusModal,GoogleLogin}/*',
    '!app/scripts/services/*.ts',
  ],
  moduleDirectories: ['node_modules', 'views'],
  moduleNameMapper: {
    '\\.(html)$': '<rootDir>/__tests__/templateMock.ts',
  },
  roots: ['<rootDir>/app/scripts/'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/util/setup.ts'],
  testEnvironment: 'jsdom',
};

module.exports = config;

/** Jest config — store/unit tests only.
 *  Avoids the Expo / React Native preset; we deliberately scope tests to pure
 *  TypeScript modules that don't import any RN-specific runtime.
 */
/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/store/__tests__"],
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "^@react-native-async-storage/async-storage$": "<rootDir>/src/store/__tests__/__mocks__/asyncStorage.ts",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { jsx: "react", esModuleInterop: true, module: "commonjs", target: "es2020", moduleResolution: "node", types: ["jest", "node"] } }],
  },
};

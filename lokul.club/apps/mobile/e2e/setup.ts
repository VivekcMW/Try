import { beforeAll, beforeEach, afterAll } from '@jest/globals';

beforeAll(async () => {
  await device.launchApp({
    newInstance: true,
    permissions: { location: 'always', notifications: 'YES' },
  });
});

beforeEach(async () => {
  await device.reloadReactNative();
});

afterAll(async () => {
  await device.terminateApp();
});

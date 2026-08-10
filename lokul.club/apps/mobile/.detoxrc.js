/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/Lokul.app',
      build: 'xcodebuild -workspace ios/lokul.xcworkspace -scheme Lokul -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build -destination "platform=iOS Simulator,name=iPhone 17 Pro"',
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/Lokul.app',
      build: 'xcodebuild -workspace ios/lokul.xcworkspace -scheme Lokul -configuration Release -sdk iphonesimulator -derivedDataPath ios/build -destination "platform=iOS Simulator,name=iPhone 17 Pro"',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 17 Pro',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },
  },
};

import { useRadiusStore, RADIUS_METERS, RADIUS_ORDER } from "../radiusStore";

describe("radiusStore", () => {
  beforeEach(() => {
    useRadiusStore.setState({ active: "200m" });
  });

  it("defaults to the tightest radius (200m)", () => {
    expect(useRadiusStore.getState().active).toBe("200m");
  });

  it("setRadius switches to the requested key", () => {
    useRadiusStore.getState().setRadius("2km");
    expect(useRadiusStore.getState().active).toBe("2km");
  });

  it("RADIUS_METERS is strictly monotonic in RADIUS_ORDER", () => {
    for (let i = 1; i < RADIUS_ORDER.length; i++) {
      expect(RADIUS_METERS[RADIUS_ORDER[i]]).toBeGreaterThan(RADIUS_METERS[RADIUS_ORDER[i - 1]]);
    }
  });
});

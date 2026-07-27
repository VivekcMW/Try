import { usePeerStore } from "../peerRoleStore";

describe("peerRoleStore", () => {
  beforeEach(() => {
    const fresh = Object.fromEntries(
      Object.entries(usePeerStore.getState().roles).map(([k]) => [k, { active: false, activatedAt: null, earningsPaise: 0, completedOrders: 0, rating: 0 }]),
    ) as typeof usePeerStore.getState.prototype;
    usePeerStore.setState({ roles: fresh as never, activeMode: null });
  });

  it("activate flips role.active true and stamps activatedAt", () => {
    usePeerStore.getState().activate("cook");
    const r = usePeerStore.getState().roles.cook;
    expect(r.active).toBe(true);
    expect(typeof r.activatedAt).toBe("number");
  });

  it("deactivate clears active and also clears activeMode if it matched", () => {
    usePeerStore.getState().activate("cook");
    usePeerStore.getState().setMode("cook");
    expect(usePeerStore.getState().activeMode).toBe("cook");

    usePeerStore.getState().deactivate("cook");
    expect(usePeerStore.getState().roles.cook.active).toBe(false);
    expect(usePeerStore.getState().activeMode).toBeNull();
  });

  it("deactivate keeps activeMode untouched if it points at a different role", () => {
    usePeerStore.getState().activate("cook");
    usePeerStore.getState().activate("rider");
    usePeerStore.getState().setMode("rider");
    usePeerStore.getState().deactivate("cook");
    expect(usePeerStore.getState().activeMode).toBe("rider");
  });

  it("setMode(null) exits role-mode", () => {
    usePeerStore.getState().setMode("baker");
    usePeerStore.getState().setMode(null);
    expect(usePeerStore.getState().activeMode).toBeNull();
  });
});

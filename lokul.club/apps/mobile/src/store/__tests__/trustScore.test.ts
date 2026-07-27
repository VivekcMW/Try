import { computeTrust } from "../trustScore";
import { useVerificationStore } from "../verificationStore";
import { usePeerStore } from "../peerRoleStore";
import { useWalletStore } from "../walletStore";

const resetAll = () => {
  useVerificationStore.setState({
    tier: "bronze",
    silverStatus: "none",
    silverDoc: null,
    goldStatus: "none",
    verificationSkipped: false,
  });

  const freshRoles = Object.fromEntries(
    Object.entries(usePeerStore.getState().roles).map(([k]) => [
      k,
      { active: false, activatedAt: null, earningsPaise: 0, completedOrders: 0, rating: 0 },
    ]),
  ) as never;
  usePeerStore.setState({ roles: freshRoles, activeMode: null });

  useWalletStore.setState({ userId: null, balancePaise: 0, heldPaise: 0, earningsPaise: 0, ledger: [] });
};

describe("computeTrust", () => {
  beforeEach(resetAll);

  it("bronze user with no activity lands in 'bronze' or 'silver' band, never gold/platinum", () => {
    const t = computeTrust();
    expect(t.total).toBeGreaterThanOrEqual(0);
    expect(t.total).toBeLessThan(65);
    expect(["bronze", "silver"]).toContain(t.band);
  });

  it("identity points scale with verification tier (bronze < silver < gold)", () => {
    const bronze = computeTrust().signals.find((s) => s.label === "Identity verification")!.points;

    useVerificationStore.setState({ tier: "silver" });
    const silver = computeTrust().signals.find((s) => s.label === "Identity verification")!.points;

    useVerificationStore.setState({ tier: "gold" });
    const gold = computeTrust().signals.find((s) => s.label === "Identity verification")!.points;

    expect(silver).toBeGreaterThan(bronze);
    expect(gold).toBeGreaterThan(silver);
  });

  it("activity signal is capped at 25 regardless of completed orders", () => {
    const roles = { ...usePeerStore.getState().roles };
    roles.cook = { ...roles.cook, completedOrders: 1_000 };
    usePeerStore.setState({ roles });

    const act = computeTrust().signals.find((s) => s.label === "Activity")!;
    expect(act.points).toBeLessThanOrEqual(act.maxPoints);
    expect(act.points).toBe(25);
  });

  it("each signal's points never exceed its declared maxPoints", () => {
    useVerificationStore.setState({ tier: "gold" });
    const roles = { ...usePeerStore.getState().roles };
    roles.cook  = { ...roles.cook,  completedOrders: 50, rating: 5 };
    roles.rider = { ...roles.rider, completedOrders: 50, rating: 5 };
    usePeerStore.setState({ roles });
    useWalletStore.setState({ ledger: Array.from({ length: 50 }, (_, i) => ({ id: `e${i}`, type: "earn", amountPaise: 1, description: "", ts: 0, status: "completed" } as never)) });

    const t = computeTrust();
    for (const s of t.signals) {
      expect(s.points).toBeLessThanOrEqual(s.maxPoints);
    }
    expect(t.total).toBeLessThanOrEqual(100);
  });

  it("a fully maxed-out profile reaches the platinum band (>= 85)", () => {
    useVerificationStore.setState({ tier: "gold" });
    const roles = { ...usePeerStore.getState().roles };
    roles.cook = { ...roles.cook, completedOrders: 20, rating: 5 };
    usePeerStore.setState({ roles });
    useWalletStore.setState({ ledger: Array.from({ length: 10 }, (_, i) => ({ id: `e${i}`, type: "earn", amountPaise: 1, description: "", ts: 0, status: "completed" } as never)) });

    const t = computeTrust();
    expect(t.total).toBeGreaterThanOrEqual(85);
    expect(t.band).toBe("platinum");
  });
});

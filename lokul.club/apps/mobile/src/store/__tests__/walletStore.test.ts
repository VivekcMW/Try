import { useWalletStore, rupees } from "../walletStore";

const reset = () =>
  useWalletStore.setState({
    userId: null,
    balancePaise: 100000, // ₹1,000
    heldPaise: 0,
    earningsPaise: 0,
    ledger: [],
  });

describe("walletStore", () => {
  beforeEach(reset);

  it("addMoney credits the balance and writes a topup ledger entry", () => {
    useWalletStore.getState().addMoney(50000);
    const s = useWalletStore.getState();
    expect(s.balancePaise).toBe(150000);
    expect(s.ledger[0]).toMatchObject({ type: "topup", amountPaise: 50000, status: "completed" });
  });

  it("spend debits the balance with a negative ledger amount", () => {
    useWalletStore.getState().spend(30000, "Groceries", "Kiryana");
    const s = useWalletStore.getState();
    expect(s.balancePaise).toBe(70000);
    expect(s.ledger[0]).toMatchObject({ type: "spend", amountPaise: -30000, party: "Kiryana" });
  });

  it("earn credits both balance and lifetime earnings", () => {
    useWalletStore.getState().earn(20000, "Tutoring", "Aarav");
    const s = useWalletStore.getState();
    expect(s.balancePaise).toBe(120000);
    expect(s.earningsPaise).toBe(20000);
  });

  it("hold moves money from balance into heldPaise without losing it", () => {
    useWalletStore.getState().hold(40000, "Escrow #x1");
    const s = useWalletStore.getState();
    expect(s.balancePaise).toBe(60000);
    expect(s.heldPaise).toBe(40000);
    expect(s.balancePaise + s.heldPaise).toBe(100000);
    expect(s.ledger[0]).toMatchObject({ type: "hold", status: "pending" });
  });

  it("release moves money out of heldPaise back to balance", () => {
    useWalletStore.getState().hold(40000, "Escrow #x1");
    useWalletStore.getState().release(40000, "Released");
    const s = useWalletStore.getState();
    expect(s.balancePaise).toBe(100000);
    expect(s.heldPaise).toBe(0);
  });

  it("release never lets heldPaise go negative even when over-released", () => {
    useWalletStore.getState().hold(10000, "Escrow #x1");
    useWalletStore.getState().release(50000, "Over-release");
    expect(useWalletStore.getState().heldPaise).toBe(0);
  });

  it("payout writes a pending negative ledger entry and debits balance", () => {
    useWalletStore.getState().payout(25000);
    const s = useWalletStore.getState();
    expect(s.balancePaise).toBe(75000);
    expect(s.ledger[0]).toMatchObject({ type: "payout", amountPaise: -25000, status: "pending" });
  });

  it("rupees() formats paise as Indian rupees", () => {
    expect(rupees(0)).toBe("₹0");
    expect(rupees(100)).toBe("₹1");
    expect(rupees(12345)).toBe("₹123.45");
    expect(rupees(100000)).toBe("₹1,000");
  });
});

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/dal";
import { rowToCreditLedgerEntry } from "@/lib/db-rows";

const REASON_LABEL: Record<string, string> = {
  signup_grant: "Signup bonus",
  render_charge: "Render",
  render_refund: "Refund",
  manual_adjustment: "Adjustment",
};

export default async function BillingPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  const { data } = await supabase
    .from("credits_ledger")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  const entries = (data ?? []).map(rowToCreditLedgerEntry);

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">Billing & Usage</h1>
        <p className="mt-2 text-base text-foreground/70">Render credits and your transaction history.</p>
      </header>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-6 border border-border bg-panel p-6">
        <div>
          <p className="font-display text-xs tracking-wide text-foreground/60 uppercase">Current balance</p>
          <p className="mt-1 font-mono text-4xl text-lime">{profile?.creditsBalance ?? 0}</p>
          <p className="mt-1 text-sm text-foreground/60">credits</p>
        </div>
        {/* Structure only -- no payment provider wired up yet. See README's
            "what's stubbed" section: this is the one deliberate placeholder. */}
        <button
          type="button"
          disabled
          title="Coming soon — real payments aren't wired up yet"
          className="cursor-not-allowed border border-border bg-panel-2 px-4 py-2.5 text-sm text-faint"
        >
          Buy more credits
        </button>
      </div>

      <section>
        <h2 className="mb-4 font-display text-sm uppercase tracking-wide text-foreground/70">Transaction history</h2>
        {entries.length === 0 ? (
          <p className="text-base text-foreground/70">No transactions yet.</p>
        ) : (
          <div className="overflow-hidden border border-border bg-panel">
            <table className="w-full text-sm">
              <thead className="bg-panel-2 text-left font-mono text-xs tracking-wide text-foreground/60 uppercase">
                <tr>
                  <th className="px-4 py-3 font-normal">Date</th>
                  <th className="px-4 py-3 font-normal">Reason</th>
                  <th className="px-4 py-3 text-right font-normal">Change</th>
                  <th className="px-4 py-3 text-right font-normal">Balance after</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-foreground/70">{entry.createdAt.toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-foreground">{REASON_LABEL[entry.reason] ?? entry.reason}</td>
                    <td className={`px-4 py-3 text-right font-mono font-medium ${entry.delta >= 0 ? "text-stamp" : "text-red"}`}>
                      {entry.delta >= 0 ? `+${entry.delta}` : entry.delta}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-foreground/70">{entry.balanceAfter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

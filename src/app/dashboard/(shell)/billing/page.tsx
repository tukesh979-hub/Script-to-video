import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/dal";
import { rowToCreditLedgerEntry } from "@/lib/db-rows";

const REASON_LABEL: Record<string, string> = {
  signup_grant: "Signup grant",
  render_charge: "Render",
  render_refund: "Render refund",
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
      <p className="mb-1.5 font-ui text-xs font-bold tracking-[0.08em] text-[#16181d]/40 uppercase">Billing &amp; Usage</p>
      <h1 className="mb-6 font-heading text-[26px] font-semibold tracking-tight text-[#16181d]">Billing</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.6fr]">
        <div className="glass rounded-[20px] p-6">
          <p className="font-ui text-xs font-semibold text-[#16181d]/50">Credits balance</p>
          <p className="mt-2.5 font-heading text-[40px] font-bold text-[#16181d]">{profile?.creditsBalance ?? 0}</p>
          <p className="mt-1 text-[12.5px] text-[#16181d]/45">available now</p>
          <button
            type="button"
            disabled
            title="Coming soon — real payments aren't wired up yet"
            className="mt-5 inline-block cursor-not-allowed rounded-[10px] bg-[#14171c] px-5 py-2.5 font-ui text-[13px] font-semibold text-white opacity-60"
          >
            Buy more credits
          </button>
        </div>

        <div className="glass rounded-[20px] p-5 px-6">
          <p className="mb-3.5 font-ui text-xs font-semibold text-[#16181d]/50">Recent activity</p>
          {entries.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#16181d]/50">No transactions yet.</p>
          ) : (
            <div className="flex flex-col">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between border-b border-[#16181d]/6 py-2.5 last:border-b-0">
                  <div>
                    <p className="font-ui text-[13px] font-medium text-[#16181d]">
                      {REASON_LABEL[entry.reason] ?? entry.reason}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-[#16181d]/40">
                      {entry.createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <span
                    className={`font-ui text-[13px] font-semibold ${entry.delta >= 0 ? "text-[#1a9c5b]" : "text-[#c94fd6]"}`}
                  >
                    {entry.delta >= 0 ? `+${entry.delta}` : entry.delta}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

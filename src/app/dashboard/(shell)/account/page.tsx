import { requireUser, getProfile } from "@/lib/dal";
import { ProfileForm, PasswordForm } from "./AccountForms";

export default async function AccountPage() {
  const user = await requireUser();
  const profile = await getProfile();

  const providers = [...new Set((user.identities ?? []).map((i) => i.provider))];
  const hasPassword = providers.includes("email");
  const joined = (profile?.createdAt ?? new Date(user.created_at)).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div>
      <p className="mb-1.5 font-ui text-xs font-bold tracking-[0.08em] text-[#16181d]/40 uppercase">Account</p>
      <h1 className="mb-6 font-heading text-[26px] font-semibold tracking-tight text-[#16181d]">Profile &amp; Settings</h1>

      <div className="grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
        <div className="glass rounded-[18px] p-5.5">
          <p className="mb-3.5 font-ui text-sm font-semibold text-[#16181d]">Profile</p>
          <div className="mb-4 flex flex-col gap-0">
            <div className="flex items-center justify-between border-b border-[#16181d]/6 py-2.5 text-[13px]">
              <span className="text-[#16181d]/50">Email</span>
              <span className="font-medium text-[#16181d]">{user.email}</span>
            </div>
            <div className="flex items-center justify-between py-2.5 text-[13px]">
              <span className="text-[#16181d]/50">Joined</span>
              <span className="font-medium text-[#16181d]">{joined}</span>
            </div>
          </div>
          <ProfileForm initialName={profile?.displayName ?? ""} />
        </div>

        <div className="glass rounded-[18px] p-5.5">
          <p className="mb-3.5 font-ui text-sm font-semibold text-[#16181d]">Security</p>
          <ul className="mb-4 flex flex-col gap-0">
            {providers.map((provider) => (
              <li
                key={provider}
                className="flex items-center justify-between border-b border-[#16181d]/6 py-2.5 text-[13px] capitalize last:border-b-0"
              >
                <span className="text-[#16181d]/50">{provider} account</span>
                <span className="font-medium text-[#7c6ff0]">Connected</span>
              </li>
            ))}
          </ul>
          {hasPassword && <PasswordForm />}
        </div>
      </div>
    </div>
  );
}

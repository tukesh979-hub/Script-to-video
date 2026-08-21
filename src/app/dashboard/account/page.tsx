import { requireUser, getProfile } from "@/lib/dal";
import { ProfileForm, PasswordForm } from "./AccountForms";

export default async function AccountPage() {
  const user = await requireUser();
  const profile = await getProfile();

  const providers = [...new Set((user.identities ?? []).map((i) => i.provider))];
  const hasPassword = providers.includes("email");

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">Account</h1>
        <p className="mt-2 text-base text-foreground/70">{user.email}</p>
      </header>

      <section>
        <h2 className="mb-4 font-display text-sm uppercase tracking-wide text-foreground/70">Profile</h2>
        <div className="max-w-sm border border-border bg-panel p-6">
          <ProfileForm initialName={profile?.displayName ?? ""} />
        </div>
      </section>

      {hasPassword && (
        <section>
          <h2 className="mb-4 font-display text-sm uppercase tracking-wide text-foreground/70">Password</h2>
          <div className="max-w-sm border border-border bg-panel p-6">
            <PasswordForm />
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display text-sm uppercase tracking-wide text-foreground/70">Connected accounts</h2>
        <ul className="flex max-w-sm flex-col gap-2">
          {providers.map((provider) => (
            <li
              key={provider}
              className="flex items-center justify-between border border-border bg-panel-2 px-4 py-3 text-base capitalize text-foreground"
            >
              {provider}
              <span className="text-sm text-lime-dim">Connected</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

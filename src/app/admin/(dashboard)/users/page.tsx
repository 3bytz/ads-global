import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/action-form";
import { Input, Select } from "@/components/admin/fields";
import { AdminHeader, Badge, Card } from "@/components/admin/ui";
import { changeRole, inviteAdmin } from "./actions";
import { superAdminClient } from "@/lib/admin/server";
import { formatLagosDateTime } from "@/lib/time";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const { staff, supabase } = await superAdminClient();
  const { data } = await supabase.from("profiles").select("id, email, full_name, role, created_at").order("created_at");
  const users = (data ?? []) as Array<{ id: string; email: string; full_name: string | null; role: "admin" | "super_admin" | null; created_at: string }>;

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Super admin"
        title="Users"
        description="Admins manage enquiries and content. Super admins can also manage users and delete enquiries. Every change is recorded in the audit log."
      />

      <Card title="Invite an admin" description="They receive a one-time link to set a password. Public sign-up is disabled.">
        <ActionForm action={inviteAdmin} submitLabel="Send invitation" resetOnSuccess>
          <div className="grid gap-4 md:grid-cols-3">
            <Input idPrefix="inv" name="email" label="Email" type="email" required />
            <Input idPrefix="inv" name="fullName" label="Full name" />
            <Select
              idPrefix="inv"
              name="role"
              label="Role"
              defaultValue="admin"
              options={[
                { value: "admin", label: "Admin" },
                { value: "super_admin", label: "Super admin" },
              ]}
            />
          </div>
        </ActionForm>
      </Card>

      <Card title={`Accounts (${users.length})`}>
        <ul className="divide-y divide-line">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <p className="font-semibold">
                  {u.full_name ?? u.email} {u.id === staff.id && <span className="text-sm font-normal text-muted">(you)</span>}
                </p>
                <p className="text-sm text-muted">
                  {u.email} · added {formatLagosDateTime(u.created_at)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {u.role === "super_admin" ? <Badge tone="quoted">Super admin</Badge> : u.role === "admin" ? <Badge tone="progress">Admin</Badge> : <Badge tone="closed">No access</Badge>}
                {u.id !== staff.id && (
                  <ActionForm action={changeRole.bind(null, u.id)} submitLabel="Update" compact>
                    <Select
                      idPrefix={`role-${u.id}`}
                      name="role"
                      label="Role"
                      defaultValue={u.role ?? "none"}
                      options={[
                        { value: "admin", label: "Admin" },
                        { value: "super_admin", label: "Super admin" },
                        { value: "none", label: "No access (revoke)" },
                      ]}
                    />
                  </ActionForm>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

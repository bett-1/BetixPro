import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Download,
  Eye,
  Filter,
  MoreVertical,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  UserX,
} from "lucide-react";
import { userStats } from "../../data/mock-data";
import {
  AdminButton,
  AdminCard,
  AdminSectionHeader,
  StatusBadge,
  SummaryCard,
  TableShell,
  adminCompactActionsClassName,
  adminTableCellClassName,
  adminTableClassName,
  adminTableHeadCellClassName,
} from "../../components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  banUserAction,
  suspendUserAction,
  unbanUserAction,
  unsuspendUserAction,
  updateUserAction,
  useGetUserDetail,
  useUsers,
  type User,
} from "@/hooks/useUsers";

const pageSize = 50;

type ActionType = "ban" | "unban" | "suspend" | "unsuspend";

type ActionDialogState = {
  type: ActionType;
  userId: string;
  userName: string;
} | null;

export default function Users() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "" | "active" | "suspended" | "banned"
  >("");
  const [page, setPage] = useState(1);
  const [actionDialog, setActionDialog] = useState<ActionDialogState>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    isVerified: false,
    accountStatus: "ACTIVE" as "ACTIVE" | "SUSPENDED",
  });

  const { users, total, loading, error, refetch } = useUsers({
    page,
    limit: pageSize,
    search: searchTerm,
    status: statusFilter,
  });

  const { user: selectedUser } = useGetUserDetail(selectedUserId || "");
  const { user: editingUser } = useGetUserDetail(editingUserId || "");

  useEffect(() => {
    if (!editingUser) {
      return;
    }

    setEditForm({
      fullName: editingUser.name === "Unknown" ? "" : editingUser.name,
      email: editingUser.email,
      phone: editingUser.phone,
      isVerified: editingUser.isVerified,
      accountStatus:
        editingUser.status === "suspended" ? "SUSPENDED" : "ACTIVE",
    });
  }, [editingUser]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const visibleUsers = useMemo(() => users, [users]);

  const openActionDialog = (type: ActionType, user: User) => {
    setActionDialog({
      type,
      userId: user.id,
      userName: user.name,
    });
  };

  const runAction = async () => {
    if (!actionDialog) {
      return;
    }

    setActionLoading(true);
    try {
      if (actionDialog.type === "ban") {
        await banUserAction(actionDialog.userId);
      }

      if (actionDialog.type === "unban") {
        await unbanUserAction(actionDialog.userId);
      }

      if (actionDialog.type === "suspend") {
        await suspendUserAction(actionDialog.userId);
      }

      if (actionDialog.type === "unsuspend") {
        await unsuspendUserAction(actionDialog.userId);
      }

      await refetch();
      setActionDialog(null);
    } finally {
      setActionLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!editingUserId) {
      return;
    }

    setEditLoading(true);
    try {
      await updateUserAction(editingUserId, editForm);
      await refetch();
      setEditingUserId(null);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="User Management"
        subtitle={`${total.toLocaleString()} registered accounts`}
        actions={
          <>
            <AdminButton variant="ghost">
              <Download size={13} />
              Export
            </AdminButton>
            <Dialog>
              <DialogTrigger asChild>
                <AdminButton>
                  <Plus size={13} />
                  Add User
                </AdminButton>
              </DialogTrigger>
              <DialogContent className="border-admin-border bg-admin-card">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account manually
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-admin-text-primary">
                      Full Name
                    </label>
                    <Input
                      placeholder="John Doe"
                      className="mt-1 border-admin-border bg-admin-surface text-admin-text-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-admin-text-primary">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      className="mt-1 border-admin-border bg-admin-surface text-admin-text-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-admin-text-primary">
                      Account Status
                    </label>
                    <select className="mt-1 w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-admin-text-primary">
                      <option>Active</option>
                      <option>Suspended</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1">
                      Cancel
                    </Button>
                    <Button className="flex-1 bg-admin-accent text-black hover:bg-[#00d492]">
                      Create User
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {userStats.map((stat) => (
          <SummaryCard
            key={stat.label}
            label={stat.label}
            tone={stat.tone}
            value={stat.value}
          />
        ))}
      </div>

      <AdminCard>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-70 flex-1 items-center gap-2 rounded-xl border border-admin-border bg-admin-surface px-3 py-2.5">
            <Search size={14} className="text-admin-text-muted" />
            <input
              className="w-full border-0 bg-transparent text-sm text-admin-text-primary outline-none placeholder:text-admin-text-muted"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AdminButton
              variant="ghost"
              onClick={() => {
                setStatusFilter(statusFilter === "active" ? "" : "active");
                setPage(1);
              }}
            >
              <Filter size={13} />
              {statusFilter === "active" ? "Active" : "Status"}
            </AdminButton>
            <AdminButton variant="ghost">
              <SlidersHorizontal size={13} />
              Risk Level
            </AdminButton>
            <AdminButton variant="ghost" onClick={() => void refetch()}>
              <RefreshCw size={13} />
              Refresh
            </AdminButton>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-admin-red/30 bg-admin-red-dim/20 px-4 py-3 text-sm text-admin-red">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-8 text-admin-text-muted">
            Loading users...
          </div>
        ) : (
          <TableShell>
            <table className={adminTableClassName}>
              <thead>
                <tr>
                  {[
                    "User ID",
                    "Name",
                    "Email",
                    "Balance",
                    "Bets",
                    "Phone",
                    "Verified",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th className={adminTableHeadCellClassName} key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user) => (
                  <tr key={user.id} className="even:bg-(--color-bg-elevated)">
                    <td
                      className={`${adminTableCellClassName} text-xs font-semibold text-admin-blue`}
                    >
                      {user.id.slice(0, 8)}...
                    </td>
                    <td
                      className={`${adminTableCellClassName} font-semibold text-admin-text-primary`}
                    >
                      {user.name}
                    </td>
                    <td className={adminTableCellClassName}>{user.email}</td>
                    <td
                      className={`${adminTableCellClassName} font-semibold text-admin-accent`}
                    >
                      KES {user.balance.toLocaleString()}
                    </td>
                    <td className={adminTableCellClassName}>
                      {user.totalBets}
                    </td>
                    <td className={adminTableCellClassName}>{user.phone}</td>
                    <td className={adminTableCellClassName}>
                      {user.isVerified ? (
                        <span className="text-xs text-admin-accent">Yes</span>
                      ) : (
                        <span className="text-xs text-admin-text-muted">
                          No
                        </span>
                      )}
                    </td>
                    <td className={adminTableCellClassName}>
                      <StatusBadge status={toBadgeStatus(user.status)} />
                    </td>
                    <td className={adminTableCellClassName}>
                      <div className={adminCompactActionsClassName}>
                        <Dialog
                          open={selectedUserId === user.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setSelectedUserId(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <AdminButton
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedUserId(user.id)}
                            >
                              <Eye size={11} />
                            </AdminButton>
                          </DialogTrigger>
                          <DialogContent className="border-admin-border bg-admin-card">
                            <DialogHeader>
                              <DialogTitle>User Details</DialogTitle>
                              <DialogDescription>
                                View and manage user information
                              </DialogDescription>
                            </DialogHeader>
                            {selectedUser ? (
                              <ScrollArea className="h-100 w-full pr-4">
                                <div className="space-y-4">
                                  <DetailRow
                                    label="USER ID"
                                    value={selectedUser.id}
                                    tone="blue"
                                  />
                                  <DetailRow
                                    label="NAME"
                                    value={selectedUser.name}
                                  />
                                  <DetailRow
                                    label="EMAIL"
                                    value={selectedUser.email}
                                  />
                                  <DetailRow
                                    label="PHONE"
                                    value={selectedUser.phone}
                                  />
                                  <DetailRow
                                    label="BALANCE"
                                    value={`KES ${selectedUser.balance.toLocaleString()}`}
                                    tone="accent"
                                  />
                                  <DetailRow
                                    label="TOTAL BETS"
                                    value={selectedUser.totalBets.toString()}
                                  />
                                  <DetailRow
                                    label="VERIFIED"
                                    value={
                                      selectedUser.isVerified ? "Yes" : "No"
                                    }
                                  />
                                  <div>
                                    <p className="text-xs text-admin-text-muted">
                                      STATUS
                                    </p>
                                    <StatusBadge
                                      status={toBadgeStatus(
                                        selectedUser.status,
                                      )}
                                    />
                                  </div>
                                  <DetailRow
                                    label="JOINED"
                                    value={new Date(
                                      selectedUser.createdAt,
                                    ).toLocaleDateString()}
                                  />
                                </div>
                              </ScrollArea>
                            ) : null}
                          </DialogContent>
                        </Dialog>

                        <Dialog
                          open={editingUserId === user.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setEditingUserId(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <AdminButton
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingUserId(user.id)}
                            >
                              <PencilLine size={11} />
                            </AdminButton>
                          </DialogTrigger>
                          <DialogContent className="border-admin-border bg-admin-card">
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                              <DialogDescription>
                                Update profile and account settings
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Field label="Full Name">
                                <Input
                                  value={editForm.fullName}
                                  onChange={(event) =>
                                    setEditForm((current) => ({
                                      ...current,
                                      fullName: event.target.value,
                                    }))
                                  }
                                  className="border-admin-border bg-admin-surface text-admin-text-primary"
                                />
                              </Field>
                              <Field label="Email">
                                <Input
                                  type="email"
                                  value={editForm.email}
                                  onChange={(event) =>
                                    setEditForm((current) => ({
                                      ...current,
                                      email: event.target.value,
                                    }))
                                  }
                                  className="border-admin-border bg-admin-surface text-admin-text-primary"
                                />
                              </Field>
                              <Field label="Phone">
                                <Input
                                  value={editForm.phone}
                                  onChange={(event) =>
                                    setEditForm((current) => ({
                                      ...current,
                                      phone: event.target.value,
                                    }))
                                  }
                                  className="border-admin-border bg-admin-surface text-admin-text-primary"
                                />
                              </Field>
                              <Field label="Account Status">
                                <select
                                  className="w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-admin-text-primary"
                                  value={editForm.accountStatus}
                                  onChange={(event) =>
                                    setEditForm((current) => ({
                                      ...current,
                                      accountStatus: event.target.value as
                                        | "ACTIVE"
                                        | "SUSPENDED",
                                    }))
                                  }
                                >
                                  <option value="ACTIVE">Active</option>
                                  <option value="SUSPENDED">Suspended</option>
                                </select>
                              </Field>
                              <label className="flex items-center gap-2 text-sm text-admin-text-secondary">
                                <input
                                  type="checkbox"
                                  checked={editForm.isVerified}
                                  onChange={(event) =>
                                    setEditForm((current) => ({
                                      ...current,
                                      isVerified: event.target.checked,
                                    }))
                                  }
                                />
                                Verified account
                              </label>
                              <div className="flex gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => setEditingUserId(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  className="flex-1 bg-admin-accent text-black hover:bg-[#00d492]"
                                  onClick={() => void saveEdit()}
                                  disabled={editLoading}
                                >
                                  {editLoading ? "Saving..." : "Save Changes"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <AdminButton size="sm" variant="ghost">
                              <MoreVertical size={11} />
                            </AdminButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-44 border-admin-border bg-admin-card">
                            {user.status === "active" ? (
                              <>
                                <DropdownMenuItem
                                  className="cursor-pointer text-admin-text-primary"
                                  onSelect={(event) => {
                                    event.preventDefault();
                                    openActionDialog("suspend", user);
                                  }}
                                >
                                  <ShieldCheck size={12} />
                                  Suspend user
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer text-admin-red"
                                  onSelect={(event) => {
                                    event.preventDefault();
                                    openActionDialog("ban", user);
                                  }}
                                >
                                  <UserX size={12} />
                                  Ban user
                                </DropdownMenuItem>
                              </>
                            ) : null}
                            {user.status === "suspended" ? (
                              <>
                                <DropdownMenuItem
                                  className="cursor-pointer text-admin-accent"
                                  onSelect={(event) => {
                                    event.preventDefault();
                                    openActionDialog("unsuspend", user);
                                  }}
                                >
                                  <UserCheck size={12} />
                                  Unsuspend user
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer text-admin-red"
                                  onSelect={(event) => {
                                    event.preventDefault();
                                    openActionDialog("ban", user);
                                  }}
                                >
                                  <UserX size={12} />
                                  Ban user
                                </DropdownMenuItem>
                              </>
                            ) : null}
                            {user.status === "banned" ? (
                              <DropdownMenuItem
                                className="cursor-pointer text-admin-accent"
                                onSelect={(event) => {
                                  event.preventDefault();
                                  openActionDialog("unban", user);
                                }}
                              >
                                <ShieldAlert size={12} />
                                Unban user
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-admin-text-muted">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <AdminButton
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </AdminButton>
            <AdminButton
              variant="ghost"
              size="sm"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              Next
            </AdminButton>
          </div>
        </div>
      </AdminCard>

      <Dialog
        open={Boolean(actionDialog)}
        onOpenChange={(open) => {
          if (!open) {
            setActionDialog(null);
          }
        }}
      >
        <DialogContent className="border-admin-border bg-admin-card">
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.type === "ban"
                ? "Ban User"
                : actionDialog?.type === "unban"
                  ? "Unban User"
                  : actionDialog?.type === "suspend"
                    ? "Suspend User"
                    : "Unsuspend User"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog
                ? `Confirm ${actionDialog.type} for ${actionDialog.userName}.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setActionDialog(null)}
            >
              Cancel
            </Button>
            <Button
              className={`flex-1 text-white ${
                actionDialog?.type === "ban" || actionDialog?.type === "suspend"
                  ? "bg-admin-red hover:bg-red-600"
                  : "bg-admin-accent text-black hover:bg-[#00d492]"
              }`}
              onClick={() => void runAction()}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-sm font-semibold text-admin-text-primary">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "accent" | "blue";
}) {
  return (
    <div>
      <p className="text-xs text-admin-text-muted">{label}</p>
      <p
        className={`text-sm font-semibold ${tone === "accent" ? "text-admin-accent" : tone === "blue" ? "text-admin-blue" : "text-admin-text-primary"}`}
      >
        {value}
      </p>
    </div>
  );
}

function toBadgeStatus(status: User["status"]) {
  if (status === "banned") {
    return "failed" as const;
  }

  return status;
}

import { useState, useCallback } from "react";
import {
  Download,
  MoreVertical,
  Eye,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
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
  useUsers,
  useGetUserDetail,
  banUserAction,
  unbanUserAction,
  suspendUserAction,
  unsuspendUserAction,
  type User,
} from "@/hooks/useUsers";

export default function Users() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [showActionDialog, setShowActionDialog] = useState<{
    type: "ban" | "unban" | "suspend" | "unsuspend" | null;
    userId: string;
    userName: string;
  }>({ type: null, userId: "", userName: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const { users, total, loading } = useUsers({
    page,
    limit: 50,
    search: searchTerm,
    status: statusFilter as any,
  });

  const { user: selectedUser } = useGetUserDetail(selectedUserId || "");

  const handleBanUser = useCallback(async () => {
    if (showActionDialog.type !== "ban") return;
    setActionLoading(true);
    try {
      await banUserAction(showActionDialog.userId);
      setShowActionDialog({ type: null, userId: "", userName: "" });
      // Refresh the users list
      window.location.reload();
    } catch (error) {
      console.error("Failed to ban user:", error);
    } finally {
      setActionLoading(false);
    }
  }, [showActionDialog]);

  const handleUnbanUser = useCallback(async () => {
    if (showActionDialog.type !== "unban") return;
    setActionLoading(true);
    try {
      await unbanUserAction(showActionDialog.userId);
      setShowActionDialog({ type: null, userId: "", userName: "" });
      window.location.reload();
    } catch (error) {
      console.error("Failed to unban user:", error);
    } finally {
      setActionLoading(false);
    }
  }, [showActionDialog]);

  const handleSuspendUser = useCallback(async () => {
    if (showActionDialog.type !== "suspend") return;
    setActionLoading(true);
    try {
      await suspendUserAction(showActionDialog.userId);
      setShowActionDialog({ type: null, userId: "", userName: "" });
      window.location.reload();
    } catch (error) {
      console.error("Failed to suspend user:", error);
    } finally {
      setActionLoading(false);
    }
  }, [showActionDialog]);

  const handleUnsuspendUser = useCallback(async () => {
    if (showActionDialog.type !== "unsuspend") return;
    setActionLoading(true);
    try {
      await unsuspendUserAction(showActionDialog.userId);
      setShowActionDialog({ type: null, userId: "", userName: "" });
      window.location.reload();
    } catch (error) {
      console.error("Failed to unsuspend user:", error);
    } finally {
      setActionLoading(false);
    }
  }, [showActionDialog]);

  const getActionConfig = () => {
    if (!showActionDialog.type) return null;

    const configs: Record<string, { title: string; description: string; buttonText: string; buttonColor: string }> = {
      ban: {
        title: "Ban User",
        description: `Are you sure you want to ban ${showActionDialog.userName}? They will no longer be able to access the platform.`,
        buttonText: "Ban User",
        buttonColor: "bg-admin-red hover:bg-red-600",
      },
      unban: {
        title: "Unban User",
        description: `Are you sure you want to unban ${showActionDialog.userName}? They will regain access to the platform.`,
        buttonText: "Unban User",
        buttonColor: "bg-admin-accent hover:bg-[#00d492]",
      },
      suspend: {
        title: "Suspend User",
        description: `Are you sure you want to suspend ${showActionDialog.userName}? They will be able to log in but cannot perform transactions.`,
        buttonText: "Suspend User",
        buttonColor: "bg-admin-red hover:bg-red-600",
      },
      unsuspend: {
        title: "Unsuspend User",
        description: `Are you sure you want to unsuspend ${showActionDialog.userName}? They will regain full access.`,
        buttonText: "Unsuspend User",
        buttonColor: "bg-admin-accent hover:bg-[#00d492]",
      },
    };

    return configs[showActionDialog.type];
  };

  const actionConfig = getActionConfig();

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
          <div className="flex min-w-[280px] flex-1 items-center gap-2 rounded-xl border border-admin-border bg-admin-surface px-3 py-2.5">
            <Search size={14} className="text-admin-text-muted" />
            <input
              className="w-full border-0 bg-transparent text-sm text-admin-text-primary outline-none placeholder:text-admin-text-muted"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
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
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-admin-text-muted">Loading users...</p>
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
                {users.map((user) => (
                  <tr
                    className="even:bg-[var(--color-bg-elevated)]"
                    key={user.id}
                  >
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
                    <td className={adminTableCellClassName}>{user.totalBets}</td>
                    <td className={adminTableCellClassName}>{user.phone}</td>
                    <td className={adminTableCellClassName}>
                      {user.isVerified ? (
                        <span className="text-xs text-admin-accent">Yes</span>
                      ) : (
                        <span className="text-xs text-admin-text-muted">No</span>
                      )}
                    </td>
                    <td className={adminTableCellClassName}>
                      <StatusBadge status={user.status} />
                    </td>
                    <td className={adminTableCellClassName}>
                      <div className={adminCompactActionsClassName}>
                        <Dialog>
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
                            {selectedUser && (
                              <ScrollArea className="h-[400px] w-full pr-4">
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-xs text-admin-text-muted">
                                      USER ID
                                    </p>
                                    <p className="text-sm font-semibold text-admin-blue">
                                      {selectedUser.id}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-admin-text-muted">
                                      NAME
                                    </p>
                                    <p className="text-sm font-semibold text-admin-text-primary">
                                      {selectedUser.name}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-admin-text-muted">
                                      EMAIL
                                    </p>
                                    <p className="text-sm text-admin-text-primary">
                                      {selectedUser.email}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-admin-text-muted">
                                      PHONE
                                    </p>
                                    <p className="text-sm text-admin-text-primary">
                                      {selectedUser.phone}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-admin-text-muted">
                                      BALANCE
                                    </p>
                                    <p className="text-sm font-semibold text-admin-accent">
                                      KES {selectedUser.balance.toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-admin-text-muted">
                                      TOTAL BETS
                                    </p>
                                    <p className="text-sm text-admin-text-primary">
                                      {selectedUser.totalBets}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-admin-text-muted">
                                      VERIFIED
                                    </p>
                                    <p className="text-sm text-admin-text-primary">
                                      {selectedUser.isVerified
                                        ? "Yes"
                                        : "No"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-admin-text-muted">
                                      STATUS
                                    </p>
                                    <StatusBadge
                                      status={selectedUser.status}
                                    />
                                  </div>
                                  <div>
                                    <p className="text-xs text-admin-text-muted">
                                      JOINED
                                    </p>
                                    <p className="text-sm text-admin-text-primary">
                                      {new Date(
                                        selectedUser.createdAt,
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </ScrollArea>
                            )}
                          </DialogContent>
                        </Dialog>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <AdminButton
                              size="sm"
                              variant="ghost"
                            >
                              <MoreVertical size={11} />
                            </AdminButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-32 border-admin-border bg-admin-card">
                            {user.status === "active" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setShowActionDialog({
                                      type: "suspend",
                                      userId: user.id,
                                      userName: user.name,
                                    })
                                  }
                                  className="text-admin-text-primary hover:bg-admin-surface cursor-pointer"
                                >
                                  Suspend
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setShowActionDialog({
                                      type: "ban",
                                      userId: user.id,
                                      userName: user.name,
                                    })
                                  }
                                  className="text-admin-red hover:bg-admin-surface cursor-pointer"
                                >
                                  Ban
                                </DropdownMenuItem>
                              </>
                            )}
                            {user.status === "suspended" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setShowActionDialog({
                                      type: "unsuspend",
                                      userId: user.id,
                                      userName: user.name,
                                    })
                                  }
                                  className="text-admin-accent hover:bg-admin-surface cursor-pointer"
                                >
                                  Unsuspend
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setShowActionDialog({
                                      type: "ban",
                                      userId: user.id,
                                      userName: user.name,
                                    })
                                  }
                                  className="text-admin-red hover:bg-admin-surface cursor-pointer"
                                >
                                  Ban
                                </DropdownMenuItem>
                              </>
                            )}
                            {user.status === "banned" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  setShowActionDialog({
                                    type: "unban",
                                    userId: user.id,
                                    userName: user.name,
                                  })
                                }
                                className="text-admin-accent hover:bg-admin-surface cursor-pointer"
                              >
                                Unban
                              </DropdownMenuItem>
                            )}
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
      </AdminCard>

      {/* Action Confirmation Dialog */}
      <Dialog
        open={showActionDialog.type !== null}
        onOpenChange={(open) => {
          if (!open) setShowActionDialog({ type: null, userId: "", userName: "" });
        }}
      >
        <DialogContent className="border-admin-border bg-admin-card">
          <DialogHeader>
            <DialogTitle>{actionConfig?.title}</DialogTitle>
            <DialogDescription>{actionConfig?.description}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                setShowActionDialog({ type: null, userId: "", userName: "" })
              }
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              className={`flex-1 text-white ${actionConfig?.buttonColor}`}
              onClick={() => {
                if (showActionDialog.type === "ban") handleBanUser();
                if (showActionDialog.type === "unban") handleUnbanUser();
                if (showActionDialog.type === "suspend") handleSuspendUser();
                if (showActionDialog.type === "unsuspend") handleUnsuspendUser();
              }}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : actionConfig?.buttonText}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="User Management"
        subtitle="48,291 registered accounts"
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
          <div className="flex min-w-[280px] flex-1 items-center gap-2 rounded-xl border border-admin-border bg-admin-surface px-3 py-2.5">
            <Search size={14} className="text-admin-text-muted" />
            <input
              className="w-full border-0 bg-transparent text-sm text-admin-text-primary outline-none placeholder:text-admin-text-muted"
              placeholder="Search users..."
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AdminButton variant="ghost">
              <Filter size={13} />
              KYC Status
            </AdminButton>
            <AdminButton variant="ghost">
              <SlidersHorizontal size={13} />
              Risk Level
            </AdminButton>
          </div>
        </div>

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
                  "Win Rate",
                  "KYC",
                  "Risk",
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
              {users.map((user) => (
                <tr
                  className="even:bg-[var(--color-bg-elevated)]"
                  key={user.id}
                >
                  <td
                    className={`${adminTableCellClassName} text-xs font-semibold text-admin-blue`}
                  >
                    {user.id}
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
                    {user.balance}
                  </td>
                  <td className={adminTableCellClassName}>{user.totalBets}</td>
                  <td className={adminTableCellClassName}>
                    {Math.round((user.won / user.totalBets) * 100)}%
                  </td>
                  <td className={adminTableCellClassName}>
                    <StatusBadge status={user.kyc} />
                  </td>
                  <td className={adminTableCellClassName}>
                    <StatusBadge status={user.risk} />
                  </td>
                  <td className={adminTableCellClassName}>
                    <StatusBadge status={user.status} />
                  </td>
                  <td className={adminTableCellClassName}>
                    <div className={adminCompactActionsClassName}>
                      <Dialog>
                        <DialogTrigger asChild>
                          <AdminButton
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedUser(user)}
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
                          {selectedUser && (
                            <ScrollArea className="h-[400px] w-full pr-4">
                              <div className="space-y-4">
                                <div>
                                  <p className="text-xs text-admin-text-muted">
                                    USER ID
                                  </p>
                                  <p className="text-sm font-semibold text-admin-blue">
                                    {selectedUser.id}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-admin-text-muted">
                                    NAME
                                  </p>
                                  <p className="text-sm font-semibold text-admin-text-primary">
                                    {selectedUser.name}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-admin-text-muted">
                                    EMAIL
                                  </p>
                                  <p className="text-sm text-admin-text-primary">
                                    {selectedUser.email}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-admin-text-muted">
                                    BALANCE
                                  </p>
                                  <p className="text-sm font-semibold text-admin-accent">
                                    {selectedUser.balance}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-admin-text-muted">
                                    TOTAL BETS
                                  </p>
                                  <p className="text-sm text-admin-text-primary">
                                    {selectedUser.totalBets}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-admin-text-muted">
                                    WIN RATE
                                  </p>
                                  <p className="text-sm text-admin-text-primary">
                                    {Math.round(
                                      (selectedUser.won /
                                        selectedUser.totalBets) *
                                        100,
                                    )}
                                    %
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-admin-text-muted">
                                    KYC STATUS
                                  </p>
                                  <StatusBadge status={selectedUser.kyc} />
                                </div>
                                <div>
                                  <p className="text-xs text-admin-text-muted">
                                    RISK LEVEL
                                  </p>
                                  <StatusBadge status={selectedUser.risk} />
                                </div>
                              </div>
                            </ScrollArea>
                          )}
                        </DialogContent>
                      </Dialog>
                      <AdminButton size="sm" variant="ghost">
                        <Edit size={11} />
                      </AdminButton>
                      <Dialog
                        open={confirmAction?.userId === user.id}
                        onOpenChange={(open) => {
                          if (!open) setConfirmAction(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <AdminButton
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setConfirmAction({
                                type:
                                  user.status === "active" ? "lock" : "unlock",
                                userId: user.id,
                                userName: user.name,
                              })
                            }
                          >
                            {user.status === "active" ? (
                              <Lock size={11} />
                            ) : (
                              <Unlock size={11} />
                            )}
                          </AdminButton>
                        </DialogTrigger>
                        <DialogContent className="border-admin-border bg-admin-card">
                          <DialogHeader>
                            <DialogTitle>
                              {confirmAction?.type === "lock"
                                ? "Lock User Account"
                                : "Unlock User Account"}
                            </DialogTitle>
                            <DialogDescription>
                              Are you sure you want to
                              {confirmAction?.type === "lock"
                                ? " lock"
                                : " unlock"}{" "}
                              {confirmAction?.userName}
                              's account?
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex gap-2 pt-4">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => setConfirmAction(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              className={`flex-1 text-white ${
                                confirmAction?.type === "lock"
                                  ? "bg-admin-red hover:bg-red-600"
                                  : "bg-admin-accent hover:bg-[#00d492] text-black"
                              }`}
                            >
                              {confirmAction?.type === "lock"
                                ? "Lock Account"
                                : "Unlock Account"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      </AdminCard>
    </div>
  );
}

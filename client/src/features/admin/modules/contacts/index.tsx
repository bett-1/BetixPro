import { useState, useMemo } from "react";
import { Download, Eye, Loader, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/axiosConfig";
import { useAdminContacts, type Contact } from "../../hooks/useAdminContacts";
import {
  AdminButton,
  AdminCard,
  AdminSectionHeader,
  StatusBadge,
  SummaryCard,
  TableShell,
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
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Contacts() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"" | "SUBMITTED" | "READ" | "RESOLVED">("");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const itemsPerPage = 20;

  // Fetch contacts
  const { data: contactsData, isLoading: isContactsLoading } = useAdminContacts(
    itemsPerPage,
    (currentPage - 1) * itemsPerPage,
    statusFilter,
    searchQuery,
  );

  // Mutation for updating contact status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ contactId, newStatus }: { contactId: string; newStatus: string }) => {
      const { data } = await api.patch(`/admin/contact/${contactId}`, {
        status: newStatus,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      toast.success("Contact status updated");
      if (selectedContact) {
        setDetailOpen(false);
        setSelectedContact(null);
      }
    },
    onError: () => {
      toast.error("Failed to update contact status");
    },
  });

  const contacts = contactsData?.contacts ?? [];
  const pagination = contactsData?.pagination ?? {
    total: 0,
    limit: itemsPerPage,
    pages: 1,
  };

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!contacts.length) {
      return [
        { label: "Total Messages", value: "0", tone: "blue" as const },
        { label: "Unread", value: "0", tone: "gold" as const },
        { label: "Read", value: "0", tone: "accent" as const },
        { label: "Resolved", value: "0", tone: "emerald" as const },
      ];
    }

    const submitted = contacts.filter((c) => c.status === "SUBMITTED").length;
    const read = contacts.filter((c) => c.status === "READ").length;
    const resolved = contacts.filter((c) => c.status === "RESOLVED").length;

    return [
      { label: "Total Messages", value: String(pagination.total), tone: "blue" as const },
      { label: "Unread", value: String(submitted), tone: "gold" as const },
      { label: "Read", value: String(read), tone: "accent" as const },
      { label: "Resolved", value: String(resolved), tone: "emerald" as const },
    ];
  }, [contacts, pagination.total]);

  const handleDownloadCSV = () => {
    if (!contacts.length) {
      toast.error("No contacts to export");
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Phone",
      "Email",
      "Subject",
      "Message",
      "Status",
      "Date",
    ];
    const rows = contacts.map((c) => [
      c.id,
      c.fullName,
      c.phone,
      c.user?.email || "N/A",
      c.subject,
      c.message.substring(0, 100),
      c.status,
      new Date(c.createdAt).toLocaleString(),
    ]);

    let csv = headers.join(",") + "\n";
    csv += rows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Contacts exported successfully");
  };

  const setDetailOpen = (open: boolean) => {
    setDetailsOpen(open);
    if (!open) {
      setSelectedContact(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Messages"
        subtitle="User contact messages and inquiries"
        actions={
          <AdminButton variant="ghost" onClick={handleDownloadCSV}>
            <Download size={13} />
            Export CSV
          </AdminButton>
        }
      />

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <SummaryCard
            key={stat.label}
            label={stat.label}
            tone={stat.tone}
            value={stat.value}
          />
        ))}
      </div>

      {/* Filters */}
      <AdminCard>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-admin-text-muted mb-1.5 uppercase">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name, phone, subject..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text-primary placeholder-admin-text-muted focus:outline-none focus:ring-2 focus:ring-admin-accent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(
                  e.target.value as "" | "SUBMITTED" | "READ" | "RESOLVED",
                );
                setCurrentPage(1);
              }}
              className="rounded-lg border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text-primary focus:outline-none focus:ring-2 focus:ring-admin-accent w-full sm:w-auto"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Unread</option>
              <option value="READ">Read</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div className="text-sm text-admin-text-muted">
            Showing {contacts.length} of {pagination.total} messages
          </div>
        </div>
      </AdminCard>

      {/* Contacts Table */}
      <AdminCard>
        {isContactsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="h-6 w-6 animate-spin text-admin-accent" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="py-20 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-admin-text-muted mb-3" />
            <p className="text-admin-text-muted">No messages found</p>
          </div>
        ) : (
          <TableShell>
            <table className={adminTableClassName}>
              <thead>
                <tr>
                  {["Name", "Phone", "Subject", "Status", "Date", "Actions"].map(
                    (heading) => (
                      <th className={adminTableHeadCellClassName} key={heading}>
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td className={adminTableCellClassName}>
                      <div>
                        <p className="font-semibold text-admin-text-primary">
                          {contact.fullName}
                        </p>
                        {contact.user?.email && (
                          <p className="text-xs text-admin-text-muted flex items-center gap-1">
                            <Mail size={12} />
                            {contact.user.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className={adminTableCellClassName}>
                      <p className="text-sm text-admin-text-primary">
                        {contact.phone}
                      </p>
                    </td>
                    <td className={adminTableCellClassName}>
                      <p className="text-sm text-admin-text-primary truncate max-w-xs">
                        {contact.subject}
                      </p>
                    </td>
                    <td className={adminTableCellClassName}>
                      <StatusBadge status={contact.status.toLowerCase()} />
                    </td>
                    <td className={adminTableCellClassName}>
                      <p className="text-sm text-admin-text-muted">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className={adminTableCellClassName}>
                      <Dialog open={detailsOpen && selectedContact?.id === contact.id} onOpenChange={setDetailOpen}>
                        <DialogTrigger asChild>
                          <AdminButton
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedContact(contact);
                              setDetailsOpen(true);
                            }}
                          >
                            <Eye size={14} />
                          </AdminButton>
                        </DialogTrigger>
                        {selectedContact?.id === contact.id && (
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Message Details</DialogTitle>
                              <DialogDescription>
                                From {selectedContact.fullName}
                              </DialogDescription>
                            </DialogHeader>

                            <ScrollArea className="h-[500px] pr-4">
                              <div className="space-y-6">
                                {/* Contact Info */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs font-semibold text-admin-text-muted uppercase mb-1">
                                      Name
                                    </p>
                                    <p className="text-sm text-admin-text-primary">
                                      {selectedContact.fullName}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-admin-text-muted uppercase mb-1">
                                      Phone
                                    </p>
                                    <p className="text-sm text-admin-text-primary">
                                      {selectedContact.phone}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-admin-text-muted uppercase mb-1">
                                      Email
                                    </p>
                                    <p className="text-sm text-admin-text-primary">
                                      {selectedContact.user?.email || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-admin-text-muted uppercase mb-1">
                                      Status
                                    </p>
                                    <StatusBadge
                                      status={selectedContact.status.toLowerCase()}
                                    />
                                  </div>
                                </div>

                                {/* Subject */}
                                <div>
                                  <p className="text-xs font-semibold text-admin-text-muted uppercase mb-2">
                                    Subject
                                  </p>
                                  <p className="text-sm text-admin-text-primary">
                                    {selectedContact.subject}
                                  </p>
                                </div>

                                {/* Message */}
                                <div>
                                  <p className="text-xs font-semibold text-admin-text-muted uppercase mb-2">
                                    Message
                                  </p>
                                  <p className="text-sm text-admin-text-primary whitespace-pre-wrap">
                                    {selectedContact.message}
                                  </p>
                                </div>

                                {/* Date */}
                                <div className="text-xs text-admin-text-muted">
                                  <p>
                                    Received:{" "}
                                    {new Date(selectedContact.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </ScrollArea>

                            {/* Status Update Buttons */}
                            <div className="flex gap-2 pt-4 border-t border-admin-border">
                              {selectedContact.status !== "READ" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    updateStatusMutation.mutate({
                                      contactId: selectedContact.id,
                                      newStatus: "READ",
                                    });
                                  }}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  Mark as Read
                                </Button>
                              )}
                              {selectedContact.status !== "RESOLVED" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    updateStatusMutation.mutate({
                                      contactId: selectedContact.id,
                                      newStatus: "RESOLVED",
                                    });
                                  }}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  Mark as Resolved
                                </Button>
                              )}
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        )}
      </AdminCard>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <AdminCard>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <p className="text-sm text-admin-text-muted">
              Page {currentPage} of {pagination.pages}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.pages, p + 1))
              }
              disabled={currentPage === pagination.pages}
            >
              Next
            </Button>
          </div>
        </AdminCard>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { RoleAssignmentDialog } from "@/components/admin/role-assignment-dialog";
import { AuditLogTable } from "@/components/admin/audit-log-table";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface UserRole {
  role: { code: string; name: string };
}

interface UserRow {
  ID: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
}

interface RoleOption {
  code: string;
  name: string;
}

type SortField = "name" | "email" | "role";
type SortDir = "asc" | "desc";

function parseUserRoles(raw: { user: UserRow; role: { code: string; name: string } }[]): UserRow[] {
  const userMap = new Map<string, UserRow>();
  for (const ur of raw) {
    const u = ur.user;
    if (!u) continue;
    if (!userMap.has(u.ID)) {
      userMap.set(u.ID, {
        ID: u.ID,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        roles: [],
      });
    }
    userMap.get(u.ID)!.roles.push({ role: ur.role });
  }
  return Array.from(userMap.values());
}

function sortUsers(users: UserRow[], field: SortField, dir: SortDir): UserRow[] {
  const sorted = [...users];
  const mult = dir === "asc" ? 1 : -1;
  sorted.sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case "name":
        cmp = `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
        break;
      case "email":
        cmp = a.email.localeCompare(b.email);
        break;
      case "role":
        cmp = (a.roles[0]?.role.code ?? "").localeCompare(b.roles[0]?.role.code ?? "");
        break;
    }
    return cmp * mult;
  });
  return sorted;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    const controller = new AbortController();

    const usersPromise = fetch(
      `${API_BASE}/api/rbac/UserRoles?$expand=user,role&$orderby=user/lastName asc`,
      { signal: controller.signal },
    ).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    });

    const rolesPromise = fetch(`${API_BASE}/api/rbac/Roles?$orderby=level asc`, {
      signal: controller.signal,
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch roles");
      return res.json();
    });

    Promise.all([usersPromise, rolesPromise])
      .then(([usersData, rolesData]) => {
        if (controller.signal.aborted) return;
        setUsers(parseUserRoles(usersData.value ?? usersData));
        setRoles((rolesData.value ?? rolesData) as RoleOption[]);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Impossible de charger les utilisateurs");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [refreshKey]);

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.roles.some((r) => r.role.code.toLowerCase().includes(q))
    );
  });

  const sortedUsers = sortUsers(filteredUsers, sortField, sortDir);

  const toggleSort = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDir("asc");
      return field;
    });
  }, []);

  const handleEditRole = (user: UserRow) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>

      <Input
        placeholder="Rechercher par nom, email ou role..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Chargement...
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => toggleSort("name")}>
                  Nom <ArrowUpDown className="ml-1 size-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => toggleSort("email")}>
                  Email <ArrowUpDown className="ml-1 size-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => toggleSort("role")}>
                  Role <ArrowUpDown className="ml-1 size-3" />
                </Button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map((user) => (
              <TableRow key={user.ID}>
                <TableCell>
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.roles.map((r) => r.role.name || r.role.code).join(", ")}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleEditRole(user)}>
                    Modifier
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {sortedUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Aucun utilisateur trouve
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <div className="space-y-2 pt-4">
        <h2 className="text-lg font-semibold">Journal des modifications de roles</h2>
        <AuditLogTable refreshKey={refreshKey} />
      </div>

      {selectedUser && (
        <RoleAssignmentDialog
          open={dialogOpen}
          user={{
            ID: selectedUser.ID,
            email: selectedUser.email,
            firstName: selectedUser.firstName,
            lastName: selectedUser.lastName,
            currentRole: selectedUser.roles[0]?.role.code ?? "buyer",
          }}
          roles={roles}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => {
            setDialogOpen(false);
            setLoading(true);
            setError(null);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}

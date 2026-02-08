"use client";

import { useEffect, useState } from "react";
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
import { Loader2 } from "lucide-react";
import { RoleAssignmentDialog } from "@/components/admin/role-assignment-dialog";

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const usersPromise = fetch(
      `${API_BASE}/api/rbac/UserRoles?$expand=user,role&$orderby=user/lastName asc`,
    ).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    });

    const rolesPromise = fetch(`${API_BASE}/api/rbac/Roles?$orderby=level asc`).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch roles");
      return res.json();
    });

    Promise.all([usersPromise, rolesPromise])
      .then(([usersData, rolesData]) => {
        if (cancelled) return;
        setUsers(parseUserRoles(usersData.value ?? usersData));
        setRoles((rolesData.value ?? rolesData) as RoleOption[]);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Impossible de charger les utilisateurs");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
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
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
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
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Aucun utilisateur trouv&eacute;
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

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

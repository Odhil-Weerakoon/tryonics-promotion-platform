"use client";
import { useState, useEffect } from "react";
import { Icons } from "@/components/Icons";
import { Role } from "@/lib/types";

interface ApiUser {
  id: string;
  email: string;
  role: Role;
  created_at: string;
}

function CreateUserModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Operator");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email.";
    if (!password || password.length < 6)
      e.password = "Password must be at least 6 characters.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: email.trim(), password, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create user");
      }

      onSave();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create user";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const ROLE_COLORS: Record<Role, string> = {
    Admin: "border-violet-400 bg-violet-50 text-violet-700",
    Operator: "border-blue-400 bg-blue-50 text-blue-700",
  };
  const ROLE_DESCRIPTIONS: Record<Role, string> = {
    Admin: "Full access — manage users and promotions",
    Operator: "Create and manage promotions",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-violet-500 to-indigo-500" />
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div>
            <h2
              className="text-slate-800 text-lg font-bold"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Create New User
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Add a team member and assign their access level
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-all"
          >
            <Icons.X />
          </button>
        </div>
        <div className="px-7 py-6 space-y-5">
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: "" }));
              }}
              placeholder="new.operator@tryonics.com"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all ${errors.email ? "border-red-300 bg-red-50" : "border-slate-200"}`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((p) => ({ ...p, password: "" }));
              }}
              placeholder="••••••••"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all ${errors.password ? "border-red-300 bg-red-50" : "border-slate-200"}`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">
              Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["Admin", "Operator"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`border-2 rounded-xl px-3 py-3 text-left transition-all ${role === r ? ROLE_COLORS[r] : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}
                >
                  <p className="text-sm font-semibold">{r}</p>
                  <p className="text-[11px] mt-0.5 leading-tight opacity-70">
                    {ROLE_DESCRIPTIONS[r]}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <Icons.UserPlus />
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      await fetchUsers();
    };
    loadUsers();
  }, []);

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers((u) => u.filter((usr) => usr.id !== id));
      } else {
        alert("Failed to delete user");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const ROLE_COLORS: Record<Role, string> = {
    Admin: "bg-violet-100 text-violet-700 border border-violet-200",
    Operator: "bg-blue-100 text-blue-700 border border-blue-200",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-slate-800 text-xl font-bold"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Team Members
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {users.length} users across all roles
          </p>
        </div>
        <button
          onClick={() => setUserModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <Icons.Plus />
          Create New User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Loading users from database...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["Email", "Role", "Created At", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    className={`text-slate-500 font-medium text-xs uppercase tracking-wider px-6 py-3.5 ${i === 3 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-800 font-mono text-xs">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${ROLE_COLORS[user.role]}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="Delete"
                        onClick={() => deleteUser(user.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                      >
                        <Icons.Delete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {userModalOpen && (
        <CreateUserModal
          onClose={() => setUserModalOpen(false)}
          onSave={fetchUsers}
        />
      )}
    </div>
  );
}

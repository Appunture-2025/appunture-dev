import { useState } from "react";
import {
  MagnifyingGlassIcon,
  UserIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useApi } from "../hooks/useApi";
import { DataTable, Column } from "../components";
import { getUsers, updateUser } from "../api/users";
import type { User, APIResponse, Pagination } from "../types";

export function Users() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, refetch } = useApi<APIResponse<User[]>>(
    ["users", page, search],
    () => getUsers(page, 20, search)
  );

  const users = data?.data || [];
  const pagination = data?.pagination;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const toggleAdmin = async (user: User) => {
    try {
      await updateUser(user.id, { isAdmin: !user.isAdmin });
      refetch();
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const columns: Column<User>[] = [
    {
      key: "photoUrl",
      label: "",
      className: "w-12",
      render: (user) => (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <UserIcon className="w-5 h-5 text-gray-500" />
          )}
        </div>
      ),
    },
    {
      key: "displayName",
      label: "Nome",
      render: (user) => (
        <div>
          <p className="font-medium text-gray-900">
            {user.displayName || "Sem nome"}
          </p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Cadastro",
      render: (user) =>
        user.createdAt
          ? new Date(user.createdAt).toLocaleDateString("pt-BR")
          : "-",
    },
    {
      key: "lastLoginAt",
      label: "Último Acesso",
      render: (user) =>
        user.lastLoginAt
          ? new Date(user.lastLoginAt).toLocaleDateString("pt-BR")
          : "-",
    },
    {
      key: "isAdmin",
      label: "Admin",
      render: (user) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleAdmin(user);
          }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            user.isAdmin
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          title={user.isAdmin ? "Remover admin" : "Tornar admin"}
        >
          <ShieldCheckIcon className="w-4 h-4" />
          {user.isAdmin ? "Sim" : "Não"}
        </button>
      ),
    },
    {
      key: "favoritesCount",
      label: "Favoritos",
      render: (user) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {user.favoritesCount || 0}
        </span>
      ),
    },
  ];

  const paginationConfig: Pagination | undefined = pagination
    ? {
        page,
        pageSize: pagination.pageSize,
        total: pagination.total,
        totalPages: pagination.totalPages,
        onPageChange: setPage,
      }
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="input pl-10"
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Buscar
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setPage(1);
              }}
              className="btn btn-secondary"
            >
              Limpar
            </button>
          )}
        </form>

        <DataTable
          columns={columns}
          data={users}
          loading={isLoading}
          pagination={paginationConfig}
          emptyMessage="Nenhum usuário encontrado"
        />
      </div>
    </div>
  );
}

export default Users;

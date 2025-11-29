import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useApi } from "../hooks/useApi";
import { DataTable, ConfirmModal, Column, ErrorState } from "../components";
import { getPoints, deletePoint, searchPoints } from "../api/points";
import type { Point, APIResponse, Pagination } from "../types";

export function Points() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading, error, refetch } = useApi<APIResponse<Point[]>>(
    ["points", page, search],
    () => (search ? searchPoints(search, page, 20) : getPoints(page, 20))
  );

  const points = data?.data || [];
  const pagination = data?.pagination;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await deletePoint(deleteId);
      setDeleteId(null);
      toast.success("Ponto excluído com sucesso!");
      refetch();
    } catch (error) {
      console.error("Failed to delete point:", error);
      toast.error("Erro ao excluir ponto. Por favor, tente novamente.");
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<Point>[] = [
    {
      key: "code",
      label: "Código",
      className: "font-medium",
    },
    {
      key: "namePt",
      label: "Nome (PT)",
    },
    {
      key: "nameEn",
      label: "Nome (EN)",
    },
    {
      key: "meridian.code",
      label: "Meridiano",
      render: (point) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
          {point.meridian?.code || "-"}
        </span>
      ),
    },
    {
      key: "location",
      label: "Localização",
      render: (point) => (
        <span className="truncate max-w-xs block" title={point.location}>
          {point.location?.substring(0, 50)}
          {point.location && point.location.length > 50 ? "..." : ""}
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

  // Show error state with retry
  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Pontos de Acupuntura
          </h1>
        </div>
        <div className="card">
          <ErrorState
            title="Erro ao carregar pontos"
            message="Não foi possível carregar a lista de pontos. Por favor, tente novamente."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Pontos de Acupuntura
        </h1>
        <button
          onClick={() => navigate("/points/new")}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Novo Ponto
        </button>
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por código, nome ou localização..."
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
          data={points}
          loading={isLoading}
          onRowClick={(point) => navigate(`/points/${point.id}`)}
          pagination={paginationConfig}
          emptyMessage="Nenhum ponto encontrado"
          actions={(point) => (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/points/${point.id}/edit`);
                }}
                className="text-primary-600 hover:text-primary-800 transition-colors"
                title="Editar"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(point.id);
                }}
                className="text-red-600 hover:text-red-800 transition-colors"
                title="Excluir"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        />
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir Ponto"
        message="Tem certeza que deseja excluir este ponto? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

export default Points;

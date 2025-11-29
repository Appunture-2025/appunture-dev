import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useApi } from "../hooks/useApi";
import { DataTable, ConfirmModal, Modal, Column } from "../components";
import { MeridianForm } from "../components/forms";
import {
  getMeridians,
  createMeridian,
  updateMeridian,
  deleteMeridian,
} from "../api/meridians";
import type { Meridian, APIResponse, Pagination } from "../types";

export function Meridians() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [editMeridian, setEditMeridian] = useState<Meridian | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data, isLoading, refetch } = useApi<APIResponse<Meridian[]>>(
    ["meridians", page],
    () => getMeridians(page, 20)
  );

  const meridians = data?.data || [];
  const pagination = data?.pagination;

  const handleCreate = async (meridianData: Partial<Meridian>) => {
    setSaving(true);
    try {
      await createMeridian(meridianData);
      setShowNewModal(false);
      refetch();
    } catch (error) {
      console.error("Failed to create meridian:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (meridianData: Partial<Meridian>) => {
    if (!editMeridian) return;

    setSaving(true);
    try {
      await updateMeridian(editMeridian.id, meridianData);
      setEditMeridian(null);
      refetch();
    } catch (error) {
      console.error("Failed to update meridian:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await deleteMeridian(deleteId);
      setDeleteId(null);
      refetch();
    } catch (error) {
      console.error("Failed to delete meridian:", error);
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<Meridian>[] = [
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
      key: "element",
      label: "Elemento",
      render: (meridian) =>
        meridian.element ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {meridian.element}
          </span>
        ) : (
          "-"
        ),
    },
    {
      key: "yinYang",
      label: "Yin/Yang",
      render: (meridian) =>
        meridian.yinYang ? (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              meridian.yinYang === "Yin"
                ? "bg-purple-100 text-purple-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {meridian.yinYang}
          </span>
        ) : (
          "-"
        ),
    },
    {
      key: "totalPoints",
      label: "Pontos",
      render: (meridian) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {meridian.totalPoints || 0}
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
        <h1 className="text-2xl font-bold text-gray-900">Meridianos</h1>
        <button
          onClick={() => setShowNewModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Novo Meridiano
        </button>
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          data={meridians}
          loading={isLoading}
          onRowClick={(meridian) => navigate(`/meridians/${meridian.id}`)}
          pagination={paginationConfig}
          emptyMessage="Nenhum meridiano encontrado"
          actions={(meridian) => (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditMeridian(meridian);
                }}
                className="text-primary-600 hover:text-primary-800 transition-colors"
                title="Editar"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(meridian.id);
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

      {/* New Meridian Modal */}
      <Modal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="Novo Meridiano"
        size="lg"
      >
        <MeridianForm
          onSubmit={handleCreate}
          onCancel={() => setShowNewModal(false)}
          loading={saving}
        />
      </Modal>

      {/* Edit Meridian Modal */}
      <Modal
        isOpen={!!editMeridian}
        onClose={() => setEditMeridian(null)}
        title={`Editar ${editMeridian?.code || "Meridiano"}`}
        size="lg"
      >
        <MeridianForm
          meridian={editMeridian || undefined}
          onSubmit={handleUpdate}
          onCancel={() => setEditMeridian(null)}
          loading={saving}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir Meridiano"
        message="Tem certeza que deseja excluir este meridiano? Todos os pontos associados também serão afetados. Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

export default Meridians;

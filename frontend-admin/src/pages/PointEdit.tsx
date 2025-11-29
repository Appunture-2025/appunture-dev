import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useApi } from "../hooks/useApi";
import { PointForm } from "../components/forms";
import { getPointById, createPoint, updatePoint } from "../api/points";
import { getMeridians } from "../api/meridians";
import type { Point, Meridian, APIResponse } from "../types";
import { useState } from "react";

export function PointEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const [saving, setSaving] = useState(false);

  const { data: point, isLoading: loadingPoint } = useApi<Point>(
    ["point", id],
    () => getPointById(id!),
    { enabled: !isNew && !!id }
  );

  const { data: meridiansData, isLoading: loadingMeridians } = useApi<
    APIResponse<Meridian[]>
  >(["meridians-all"], () => getMeridians(1, 100));

  const meridians = meridiansData?.data || [];

  const handleSubmit = async (data: Partial<Point>) => {
    setSaving(true);
    try {
      if (isNew) {
        await createPoint(data);
      } else {
        await updatePoint(id!, data);
      }
      navigate("/points");
    } catch (error) {
      console.error("Failed to save point:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  if (!isNew && loadingPoint) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/points")}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? "Novo Ponto" : `Editar ${point?.code || "Ponto"}`}
        </h1>
      </div>

      <div className="card">
        {loadingMeridians ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <PointForm
            point={isNew ? undefined : point}
            meridians={meridians}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/points")}
            loading={saving}
          />
        )}
      </div>
    </div>
  );
}

export default PointEdit;

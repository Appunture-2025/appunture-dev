import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Point, Meridian } from "../../types";

interface PointFormData {
  code: string;
  nameEn: string;
  namePt: string;
  nameChinese: string;
  namePinyin: string;
  meridianId: string;
  location: string;
  anatomicalLocation: string;
  functions: string;
  indications: string;
  needleDepth: string;
  techniques: string;
  cautions: string;
  notes: string;
}

interface PointFormProps {
  point?: Point;
  meridians: Meridian[];
  onSubmit: (data: Partial<Point>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function PointForm({
  point,
  meridians,
  onSubmit,
  onCancel,
  loading = false,
}: PointFormProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PointFormData>({
    defaultValues: {
      code: point?.code || "",
      nameEn: point?.nameEn || "",
      namePt: point?.namePt || "",
      nameChinese: point?.nameChinese || "",
      namePinyin: point?.namePinyin || "",
      meridianId: point?.meridian?.id || "",
      location: point?.location || "",
      anatomicalLocation: point?.anatomicalLocation || "",
      functions: point?.functions?.join("\n") || "",
      indications: point?.indications?.join("\n") || "",
      needleDepth: point?.needleDepth || "",
      techniques: point?.techniques?.join("\n") || "",
      cautions: point?.cautions?.join("\n") || "",
      notes: point?.notes || "",
    },
  });

  const handleFormSubmit = async (data: PointFormData) => {
    setError(null);
    try {
      const pointData: Partial<Point> = {
        code: data.code,
        nameEn: data.nameEn,
        namePt: data.namePt,
        nameChinese: data.nameChinese,
        namePinyin: data.namePinyin,
        meridian: meridians.find((m) => m.id === data.meridianId),
        location: data.location,
        anatomicalLocation: data.anatomicalLocation,
        functions: data.functions.split("\n").filter((f) => f.trim()),
        indications: data.indications.split("\n").filter((i) => i.trim()),
        needleDepth: data.needleDepth,
        techniques: data.techniques.split("\n").filter((t) => t.trim()),
        cautions: data.cautions.split("\n").filter((c) => c.trim()),
        notes: data.notes,
      };
      await onSubmit(pointData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar ponto");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código *
          </label>
          <input
            {...register("code", { required: "Código é obrigatório" })}
            type="text"
            className="input"
            placeholder="Ex: LU1"
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meridiano *
          </label>
          <select
            {...register("meridianId", { required: "Meridiano é obrigatório" })}
            className="input"
          >
            <option value="">Selecione...</option>
            {meridians.map((meridian) => (
              <option key={meridian.id} value={meridian.id}>
                {meridian.code} - {meridian.namePt || meridian.name}
              </option>
            ))}
          </select>
          {errors.meridianId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.meridianId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome (EN) *
          </label>
          <input
            {...register("nameEn", {
              required: "Nome em inglês é obrigatório",
            })}
            type="text"
            className="input"
          />
          {errors.nameEn && (
            <p className="mt-1 text-sm text-red-600">{errors.nameEn.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome (PT) *
          </label>
          <input
            {...register("namePt", {
              required: "Nome em português é obrigatório",
            })}
            type="text"
            className="input"
          />
          {errors.namePt && (
            <p className="mt-1 text-sm text-red-600">{errors.namePt.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome (Chinês)
          </label>
          <input {...register("nameChinese")} type="text" className="input" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pinyin
          </label>
          <input {...register("namePinyin")} type="text" className="input" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Localização *
        </label>
        <textarea
          {...register("location", { required: "Localização é obrigatória" })}
          rows={3}
          className="input"
          placeholder="Descreva a localização do ponto"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Localização Anatômica
        </label>
        <textarea
          {...register("anatomicalLocation")}
          rows={2}
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Funções (uma por linha)
        </label>
        <textarea
          {...register("functions")}
          rows={4}
          className="input"
          placeholder="Função 1&#10;Função 2&#10;..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Indicações (uma por linha)
        </label>
        <textarea
          {...register("indications")}
          rows={4}
          className="input"
          placeholder="Indicação 1&#10;Indicação 2&#10;..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profundidade da Agulha
          </label>
          <input
            {...register("needleDepth")}
            type="text"
            className="input"
            placeholder="Ex: 0.5-1.0 cun"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Técnicas (uma por linha)
        </label>
        <textarea {...register("techniques")} rows={3} className="input" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Precauções (uma por linha)
        </label>
        <textarea {...register("cautions")} rows={3} className="input" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea {...register("notes")} rows={3} className="input" />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn btn-secondary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Salvando...
            </div>
          ) : point ? (
            "Atualizar Ponto"
          ) : (
            "Criar Ponto"
          )}
        </button>
      </div>
    </form>
  );
}

export default PointForm;

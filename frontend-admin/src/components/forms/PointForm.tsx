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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" aria-label="Formulário de ponto de acupuntura">
      {error && (
        <div 
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
            Código <span aria-label="obrigatório">*</span>
          </label>
          <input
            {...register("code", { required: "Código é obrigatório" })}
            id="code"
            type="text"
            className="input"
            placeholder="Ex: LU1"
            aria-required="true"
            aria-invalid={errors.code ? "true" : "false"}
            aria-describedby={errors.code ? "code-error" : undefined}
          />
          {errors.code && (
            <p id="code-error" className="mt-1 text-sm text-red-600" role="alert">{errors.code.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="meridianId" className="block text-sm font-medium text-gray-700 mb-1">
            Meridiano <span aria-label="obrigatório">*</span>
          </label>
          <select
            {...register("meridianId", { required: "Meridiano é obrigatório" })}
            id="meridianId"
            className="input"
            aria-required="true"
            aria-invalid={errors.meridianId ? "true" : "false"}
            aria-describedby={errors.meridianId ? "meridianId-error" : undefined}
          >
            <option value="">Selecione...</option>
            {meridians.map((meridian) => (
              <option key={meridian.id} value={meridian.id}>
                {meridian.code} - {meridian.namePt || meridian.name}
              </option>
            ))}
          </select>
          {errors.meridianId && (
            <p id="meridianId-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.meridianId.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="nameEn" className="block text-sm font-medium text-gray-700 mb-1">
            Nome (EN) <span aria-label="obrigatório">*</span>
          </label>
          <input
            {...register("nameEn", {
              required: "Nome em inglês é obrigatório",
            })}
            id="nameEn"
            type="text"
            className="input"
            aria-required="true"
            aria-invalid={errors.nameEn ? "true" : "false"}
            aria-describedby={errors.nameEn ? "nameEn-error" : undefined}
          />
          {errors.nameEn && (
            <p id="nameEn-error" className="mt-1 text-sm text-red-600" role="alert">{errors.nameEn.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="namePt" className="block text-sm font-medium text-gray-700 mb-1">
            Nome (PT) <span aria-label="obrigatório">*</span>
          </label>
          <input
            {...register("namePt", {
              required: "Nome em português é obrigatório",
            })}
            id="namePt"
            type="text"
            className="input"
            aria-required="true"
            aria-invalid={errors.namePt ? "true" : "false"}
            aria-describedby={errors.namePt ? "namePt-error" : undefined}
          />
          {errors.namePt && (
            <p id="namePt-error" className="mt-1 text-sm text-red-600" role="alert">{errors.namePt.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="nameChinese" className="block text-sm font-medium text-gray-700 mb-1">
            Nome (Chinês)
          </label>
          <input {...register("nameChinese")} id="nameChinese" type="text" className="input" />
        </div>

        <div>
          <label htmlFor="namePinyin" className="block text-sm font-medium text-gray-700 mb-1">
            Pinyin
          </label>
          <input {...register("namePinyin")} id="namePinyin" type="text" className="input" />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Localização <span aria-label="obrigatório">*</span>
        </label>
        <textarea
          {...register("location", { required: "Localização é obrigatória" })}
          id="location"
          rows={3}
          className="input"
          placeholder="Descreva a localização do ponto"
          aria-required="true"
          aria-invalid={errors.location ? "true" : "false"}
          aria-describedby={errors.location ? "location-error" : undefined}
        />
        {errors.location && (
          <p id="location-error" className="mt-1 text-sm text-red-600" role="alert">{errors.location.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="anatomicalLocation" className="block text-sm font-medium text-gray-700 mb-1">
          Localização Anatômica
        </label>
        <textarea
          {...register("anatomicalLocation")}
          id="anatomicalLocation"
          rows={2}
          className="input"
        />
      </div>

      <div>
        <label htmlFor="functions" className="block text-sm font-medium text-gray-700 mb-1">
          Funções (uma por linha)
        </label>
        <textarea
          {...register("functions")}
          id="functions"
          rows={4}
          className="input"
          placeholder="Função 1&#10;Função 2&#10;..."
          aria-describedby="functions-hint"
        />
        <p id="functions-hint" className="sr-only">Digite uma função por linha</p>
      </div>

      <div>
        <label htmlFor="indications" className="block text-sm font-medium text-gray-700 mb-1">
          Indicações (uma por linha)
        </label>
        <textarea
          {...register("indications")}
          id="indications"
          rows={4}
          className="input"
          placeholder="Indicação 1&#10;Indicação 2&#10;..."
          aria-describedby="indications-hint"
        />
        <p id="indications-hint" className="sr-only">Digite uma indicação por linha</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="needleDepth" className="block text-sm font-medium text-gray-700 mb-1">
            Profundidade da Agulha
          </label>
          <input
            {...register("needleDepth")}
            id="needleDepth"
            type="text"
            className="input"
            placeholder="Ex: 0.5-1.0 cun"
          />
        </div>
      </div>

      <div>
        <label htmlFor="techniques" className="block text-sm font-medium text-gray-700 mb-1">
          Técnicas (uma por linha)
        </label>
        <textarea {...register("techniques")} id="techniques" rows={3} className="input" aria-describedby="techniques-hint" />
        <p id="techniques-hint" className="sr-only">Digite uma técnica por linha</p>
      </div>

      <div>
        <label htmlFor="cautions" className="block text-sm font-medium text-gray-700 mb-1">
          Precauções (uma por linha)
        </label>
        <textarea {...register("cautions")} id="cautions" rows={3} className="input" aria-describedby="cautions-hint" />
        <p id="cautions-hint" className="sr-only">Digite uma precaução por linha</p>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea {...register("notes")} id="notes" rows={3} className="input" />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn btn-secondary focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-busy={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" aria-hidden="true"></div>
              <span>Salvando...</span>
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

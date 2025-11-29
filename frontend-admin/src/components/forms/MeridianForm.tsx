import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Meridian } from "../../types";

interface MeridianFormData {
  code: string;
  nameEn: string;
  namePt: string;
  nameChinese: string;
  namePinyin: string;
  element: string;
  yinYang: string;
  organ: string;
  pairedMeridian: string;
  pathwayDescription: string;
  totalPoints: number;
  notes: string;
}

interface MeridianFormProps {
  meridian?: Meridian;
  onSubmit: (data: Partial<Meridian>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const ELEMENTS = ["Madeira", "Fogo", "Terra", "Metal", "Água"];
const YIN_YANG = ["Yin", "Yang"];

export function MeridianForm({
  meridian,
  onSubmit,
  onCancel,
  loading = false,
}: MeridianFormProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MeridianFormData>({
    defaultValues: {
      code: meridian?.code || "",
      nameEn: meridian?.nameEn || "",
      namePt: meridian?.namePt || "",
      nameChinese: meridian?.nameChinese || "",
      namePinyin: meridian?.namePinyin || "",
      element: meridian?.element || "",
      yinYang: meridian?.yinYang || "",
      organ: meridian?.organ || "",
      pairedMeridian: meridian?.pairedMeridian || "",
      pathwayDescription: meridian?.pathwayDescription || "",
      totalPoints: meridian?.totalPoints || 0,
      notes: meridian?.notes || "",
    },
  });

  const handleFormSubmit = async (data: MeridianFormData) => {
    setError(null);
    try {
      const meridianData: Partial<Meridian> = {
        ...data,
      };
      await onSubmit(meridianData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar meridiano");
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
            placeholder="Ex: LU"
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total de Pontos
          </label>
          <input
            {...register("totalPoints", { valueAsNumber: true })}
            type="number"
            className="input"
            min={0}
          />
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Elemento
          </label>
          <select {...register("element")} className="input">
            <option value="">Selecione...</option>
            {ELEMENTS.map((element) => (
              <option key={element} value={element}>
                {element}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Yin/Yang
          </label>
          <select {...register("yinYang")} className="input">
            <option value="">Selecione...</option>
            {YIN_YANG.map((yy) => (
              <option key={yy} value={yy}>
                {yy}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Órgão
          </label>
          <input
            {...register("organ")}
            type="text"
            className="input"
            placeholder="Ex: Pulmão"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meridiano Pareado
          </label>
          <input
            {...register("pairedMeridian")}
            type="text"
            className="input"
            placeholder="Ex: LI"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição do Trajeto
        </label>
        <textarea
          {...register("pathwayDescription")}
          rows={4}
          className="input"
          placeholder="Descreva o trajeto do meridiano"
        />
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
          ) : meridian ? (
            "Atualizar Meridiano"
          ) : (
            "Criar Meridiano"
          )}
        </button>
      </div>
    </form>
  );
}

export default MeridianForm;

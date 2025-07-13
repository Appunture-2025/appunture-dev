import React, { useState } from "react";
import { Plus, Search, Edit, Trash2, Activity } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const SymptomsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const symptoms = [
    {
      id: 1,
      name: "Dor de Cabeça",
      category: "Neurológico",
      description: "Dor na região craniana",
      relatedPoints: ["VG20", "EX-HN3", "GB20"],
      severity: "Moderada",
    },
    {
      id: 2,
      name: "Insônia",
      category: "Sono",
      description: "Dificuldade para dormir",
      relatedPoints: ["Yintang", "Shenmen", "Baihui"],
      severity: "Leve",
    },
    {
      id: 3,
      name: "Ansiedade",
      category: "Psicológico",
      description: "Estado de inquietação e nervosismo",
      relatedPoints: ["Shenmen", "Yintang", "Ear Apex"],
      severity: "Moderada",
    },
  ];

  const filteredSymptoms = symptoms.filter(
    (symptom) =>
      symptom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      symptom.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Leve":
        return "bg-green-100 text-green-800";
      case "Moderada":
        return "bg-yellow-100 text-yellow-800";
      case "Grave":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sintomas</h1>
          <p className="text-gray-600">
            Gerencie os sintomas e suas relações com pontos de acupuntura
          </p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />}>
          Adicionar Sintoma
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar sintomas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todas as Categorias</option>
              <option value="neurologico">Neurológico</option>
              <option value="sono">Sono</option>
              <option value="psicologico">Psicológico</option>
            </select>
          </div>
        </div>
      </div>

      {/* Symptoms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSymptoms.map((symptom) => (
          <div
            key={symptom.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-50 rounded-lg mr-3">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {symptom.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {symptom.category}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(
                    symptom.severity
                  )}`}
                >
                  {symptom.severity}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {symptom.description}
              </p>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Pontos Relacionados:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {symptom.relatedPoints.map((point, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Edit className="h-4 w-4" />}
                >
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  className="text-red-600 hover:text-red-700"
                >
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSymptoms.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Activity className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhum sintoma encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Tente ajustar os filtros ou adicionar um novo sintoma.
          </p>
        </div>
      )}
    </div>
  );
};

export default SymptomsPage;

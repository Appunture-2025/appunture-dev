import React, { useState } from "react";
import { Plus, Search, Edit, Trash2, MapPin } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const PointsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - posteriormente será substituído por dados reais da API
  const points = [
    {
      id: 1,
      name: "Baihui",
      code: "VG20",
      category: "Vaso Governador",
      location: "Topo da cabeça",
      indications: ["Dor de cabeça", "Tontura", "Insônia"],
      meridian: "Vaso Governador",
    },
    {
      id: 2,
      name: "Yintang",
      code: "EX-HN3",
      category: "Extra Points",
      location: "Entre as sobrancelhas",
      indications: ["Ansiedade", "Insônia", "Sinusite"],
      meridian: "Extra Points",
    },
    {
      id: 3,
      name: "Hegu",
      code: "IG4",
      category: "Intestino Grosso",
      location: "Entre polegar e indicador",
      indications: ["Dor", "Febre", "Constipação"],
      meridian: "Intestino Grosso",
    },
  ];

  const filteredPoints = points.filter(
    (point) =>
      point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      point.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      point.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pontos de Acupuntura
          </h1>
          <p className="text-gray-600">
            Gerencie os pontos de acupuntura do sistema
          </p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />}>Adicionar Ponto</Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome, código ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos os Meridianos</option>
              <option value="vaso-governador">Vaso Governador</option>
              <option value="intestino-grosso">Intestino Grosso</option>
              <option value="extra-points">Extra Points</option>
            </select>
          </div>
        </div>
      </div>

      {/* Points Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ponto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Indicações
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPoints.map((point) => (
                <tr key={point.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-50 rounded-lg mr-3">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {point.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {point.code}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {point.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {point.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {point.indications
                        .slice(0, 2)
                        .map((indication, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {indication}
                          </span>
                        ))}
                      {point.indications.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          +{point.indications.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPoints.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhum ponto encontrado
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Tente ajustar os filtros ou adicionar um novo ponto.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">1</span> a{" "}
            <span className="font-medium">{filteredPoints.length}</span> de{" "}
            <span className="font-medium">{points.length}</span> resultados
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" disabled>
              Anterior
            </Button>
            <Button variant="ghost" size="sm" disabled>
              Próximo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsPage;

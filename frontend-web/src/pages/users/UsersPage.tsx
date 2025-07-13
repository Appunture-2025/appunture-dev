import React from "react";
import { Users, Plus, Search, Edit, Trash2 } from "lucide-react";
import Button from "../../components/ui/Button";

const UsersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600">Gerencie os usuários do sistema</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />}>
          Adicionar Usuário
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Página em desenvolvimento
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Esta funcionalidade será implementada em breve.
        </p>
      </div>
    </div>
  );
};

export default UsersPage;

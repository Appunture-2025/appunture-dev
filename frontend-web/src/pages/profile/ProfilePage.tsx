import React from "react";
import { User } from "lucide-react";

const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais</p>
      </div>

      <div className="bg-white rounded-lg shadow p-12 text-center">
        <User className="mx-auto h-12 w-12 text-gray-400" />
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

export default ProfilePage;

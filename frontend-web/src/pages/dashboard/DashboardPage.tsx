import React from "react";
import {
  Users,
  MapPin,
  Activity,
  TrendingUp,
  Calendar,
  BarChart3,
} from "lucide-react";

// Componente de Card de estatística
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}> = ({ title, value, icon, trend, trendUp }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {trend && (
          <p
            className={`text-sm ${
              trendUp ? "text-green-600" : "text-red-600"
            } flex items-center mt-1`}
          >
            <TrendingUp
              className={`h-4 w-4 mr-1 ${!trendUp && "rotate-180"}`}
            />
            {trend}
          </p>
        )}
      </div>
      <div className="p-3 bg-blue-50 rounded-lg">{icon}</div>
    </div>
  </div>
);

// Componente de atividade recente
const RecentActivity: React.FC = () => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">Atividades Recentes</h3>
    </div>
    <div className="p-6">
      <div className="space-y-4">
        {[
          {
            user: "Dr. João Silva",
            action: "adicionou novo ponto de acupuntura",
            point: "Baihui (VG20)",
            time: "2 horas atrás",
          },
          {
            user: "Dra. Maria Santos",
            action: "atualizou sintoma",
            point: "Dor de Cabeça",
            time: "4 horas atrás",
          },
          {
            user: "Dr. Pedro Costa",
            action: "cadastrou novo usuário",
            point: "Ana Caroline",
            time: "1 dia atrás",
          },
        ].map((activity, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user}</span>{" "}
                {activity.action}{" "}
                <span className="font-medium">{activity.point}</span>
              </p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  const stats = [
    {
      title: "Total de Usuários",
      value: "1,247",
      icon: <Users className="h-6 w-6 text-blue-600" />,
      trend: "+12% este mês",
      trendUp: true,
    },
    {
      title: "Pontos de Acupuntura",
      value: "365",
      icon: <MapPin className="h-6 w-6 text-green-600" />,
      trend: "+5 novos",
      trendUp: true,
    },
    {
      title: "Sintomas Catalogados",
      value: "89",
      icon: <Activity className="h-6 w-6 text-purple-600" />,
      trend: "+3 este mês",
      trendUp: true,
    },
    {
      title: "Consultas Hoje",
      value: "23",
      icon: <Calendar className="h-6 w-6 text-orange-600" />,
      trend: "-5% ontem",
      trendUp: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Bem-vindo ao painel administrativo do Appunture
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Placeholder */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Consultas por Mês
            </h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Gráfico será implementado aqui</p>
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Adicionar Ponto", icon: MapPin, color: "blue" },
            { label: "Novo Sintoma", icon: Activity, color: "green" },
            { label: "Cadastrar Usuário", icon: Users, color: "purple" },
            { label: "Ver Relatórios", icon: BarChart3, color: "orange" },
          ].map((action, index) => (
            <button
              key={index}
              className={`p-4 border border-gray-200 rounded-lg hover:border-${action.color}-500 hover:bg-${action.color}-50 transition-colors text-left`}
            >
              <action.icon
                className={`h-6 w-6 text-${action.color}-600 mb-2`}
              />
              <p className="text-sm font-medium text-gray-900">
                {action.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

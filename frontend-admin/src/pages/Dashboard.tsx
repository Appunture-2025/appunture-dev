import {
  ChartBarIcon,
  MapPinIcon,
  ArrowPathIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useApi } from "../hooks/useApi";
import { getStats } from "../api/stats";
import type { Stats } from "../types";

export function Dashboard() {
  const {
    data: stats,
    isLoading,
    refetch,
  } = useApi<Stats>(["stats"], getStats);

  const cards = [
    {
      title: "Total de Pontos",
      value: stats?.totalPoints || 0,
      icon: MapPinIcon,
      color: "bg-blue-500",
    },
    {
      title: "Total de Meridianos",
      value: stats?.totalMeridians || 0,
      icon: ArrowPathIcon,
      color: "bg-green-500",
    },
    {
      title: "Usuários Ativos",
      value: stats?.totalUsers || 0,
      icon: UsersIcon,
      color: "bg-purple-500",
    },
    {
      title: "Favoritos",
      value: stats?.totalFavorites || 0,
      icon: ChartBarIcon,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => refetch()}
          className="btn btn-secondary flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Atualizar dados do dashboard"
        >
          <ArrowPathIcon className="w-4 h-4" aria-hidden="true" />
          Atualizar
        </button>
      </div>

      <section aria-label="Estatísticas gerais">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <article key={card.title} className="card" aria-label={card.title}>
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}
                  aria-hidden="true"
                >
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" role="status">
                      <span className="sr-only">Carregando...</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900" aria-live="polite">
                      {card.value.toLocaleString("pt-BR")}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="card" aria-labelledby="meridian-chart-title">
          <h2 id="meridian-chart-title" className="text-lg font-semibold text-gray-900 mb-4">
            Pontos por Meridiano
          </h2>
          {isLoading ? (
            <div className="space-y-3" role="status" aria-label="Carregando dados">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-8 bg-gray-200 rounded animate-pulse"
                  aria-hidden="true"
                ></div>
              ))}
              <span className="sr-only">Carregando dados de pontos por meridiano...</span>
            </div>
          ) : stats?.pointsPerMeridian ? (
            <div className="space-y-3" role="list" aria-label="Lista de pontos por meridiano">
              {Object.entries(stats.pointsPerMeridian)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([meridian, count]) => (
                  <div key={meridian} className="flex items-center gap-3" role="listitem">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {meridian}
                        </span>
                        <span className="text-sm text-gray-500" aria-label={`${count} pontos`}>{count}</span>
                      </div>
                      <div 
                        className="w-full bg-gray-200 rounded-full h-2"
                        role="progressbar"
                        aria-valuenow={count}
                        aria-valuemax={Math.max(...Object.values(stats.pointsPerMeridian || {}))}
                        aria-label={`${meridian}: ${count} pontos`}
                      >
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              (count /
                                Math.max(
                                  ...Object.values(
                                    stats.pointsPerMeridian || {}
                                  )
                                )) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhum dado disponível</p>
          )}
        </section>

        <section className="card" aria-labelledby="activity-title">
          <h2 id="activity-title" className="text-lg font-semibold text-gray-900 mb-4">
            Atividade Recente
          </h2>
          {isLoading ? (
            <div className="space-y-4" role="status" aria-label="Carregando atividades">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3" aria-hidden="true">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse mt-1"></div>
                  </div>
                </div>
              ))}
              <span className="sr-only">Carregando atividades recentes...</span>
            </div>
          ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <ul className="space-y-4" aria-label="Lista de atividades recentes">
              {stats.recentActivity.map((activity, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div 
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0"
                    aria-hidden="true"
                  >
                    <span className="text-xs font-medium text-gray-600">
                      {activity.userName?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">
                      <time>{activity.timestamp}</time>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Nenhuma atividade recente</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;

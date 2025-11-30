import { NavLink, useLocation } from "react-router-dom";
import {
  HomeIcon,
  CircleStackIcon,
  MapIcon,
  UsersIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Pontos", href: "/points", icon: CircleStackIcon },
  { name: "Meridianos", href: "/meridians", icon: MapIcon },
  { name: "Usuários", href: "/users", icon: UsersIcon },
  { name: "Configurações", href: "/settings", icon: Cog6ToothIcon },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside 
      className="w-64 bg-indigo-700 text-white flex flex-col"
      role="navigation"
      aria-label="Menu de navegação principal"
    >
      <div className="p-4 border-b border-indigo-600">
        <h1 className="text-xl font-bold">🌿 Appunture</h1>
        <p className="text-indigo-200 text-sm">Painel Admin</p>
      </div>

      <nav className="flex-1 mt-4" aria-label="Navegação principal">
        <ul role="list">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-800 text-white border-l-4 border-white"
                      : "text-indigo-100 hover:bg-indigo-600"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="w-5 h-5 mr-3" aria-hidden="true" />
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-indigo-600 text-xs text-indigo-200">
        Appunture Admin v0.1.0
      </div>
    </aside>
  );
}

export default Sidebar;

# Prompt – Admin Dashboard Web

## Contexto

- Backend Java com endpoints REST
- Admin endpoints existentes: `/api/admin/*`
- Necessidade de interface web para gerenciar conteúdo
- Stack sugerida: React + Vite + TailwindCSS (lightweight)

## Objetivo

Criar dashboard web simples para administradores gerenciarem:

- Pontos de acupuntura (CRUD)
- Meridianos
- Usuários (visualização)
- Estatísticas de uso

## Estrutura do Projeto

```
frontend-admin/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── api/
│   │   ├── client.ts
│   │   ├── points.ts
│   │   ├── meridians.ts
│   │   └── users.ts
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── DataTable.tsx
│   │   ├── Modal.tsx
│   │   └── forms/
│   │       ├── PointForm.tsx
│   │       └── MeridianForm.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Points.tsx
│   │   ├── PointEdit.tsx
│   │   ├── Meridians.tsx
│   │   ├── Users.tsx
│   │   └── Login.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useApi.ts
│   └── types/
│       └── index.ts
└── .env.example
```

## Implementação

### 1. Package.json

```json
{
  "name": "appunture-admin",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.17.0",
    "axios": "^1.6.5",
    "firebase": "^10.7.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.49.2",
    "react-router-dom": "^6.21.1",
    "react-hot-toast": "^2.4.1",
    "@heroicons/react": "^2.1.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.47",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.11"
  }
}
```

### 2. API Client

`src/api/client.ts`:

```typescript
import axios from "axios";
import { auth } from "../config/firebase";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para erros
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### 3. Points API

`src/api/points.ts`:

```typescript
import { apiClient } from "./client";
import { Point } from "../types";

export const pointsApi = {
  getAll: async (): Promise<Point[]> => {
    const { data } = await apiClient.get("/admin/points");
    return data;
  },

  getById: async (id: string): Promise<Point> => {
    const { data } = await apiClient.get(`/admin/points/${id}`);
    return data;
  },

  create: async (point: Omit<Point, "id">): Promise<Point> => {
    const { data } = await apiClient.post("/admin/points", point);
    return data;
  },

  update: async (id: string, point: Partial<Point>): Promise<Point> => {
    const { data } = await apiClient.put(`/admin/points/${id}`, point);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/points/${id}`);
  },

  search: async (query: string): Promise<Point[]> => {
    const { data } = await apiClient.get("/admin/points/search", {
      params: { q: query },
    });
    return data;
  },
};
```

### 4. Layout Component

`src/components/Layout.tsx`:

```tsx
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function Layout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

### 5. Sidebar Component

`src/components/Sidebar.tsx`:

```tsx
import { NavLink } from "react-router-dom";
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
  return (
    <aside className="w-64 bg-indigo-700 text-white">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Appunture Admin</h1>
      </div>
      <nav className="mt-8">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-800 text-white"
                  : "text-indigo-100 hover:bg-indigo-600"
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
```

### 6. Points Page

`src/pages/Points.tsx`:

```tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { pointsApi } from "../api/points";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import toast from "react-hot-toast";

export function Points() {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: points, isLoading } = useQuery({
    queryKey: ["points"],
    queryFn: pointsApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: pointsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["points"] });
      toast.success("Ponto excluído com sucesso");
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Erro ao excluir ponto");
    },
  });

  const filteredPoints = points?.filter(
    (point) =>
      point.name.toLowerCase().includes(search.toLowerCase()) ||
      point.id.toLowerCase().includes(search.toLowerCase()) ||
      point.meridian.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Nome" },
    { key: "chineseName", label: "Nome Chinês" },
    { key: "meridian", label: "Meridiano" },
    {
      key: "actions",
      label: "Ações",
      render: (point: any) => (
        <div className="flex gap-2">
          <Link
            to={`/points/${point.id}`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <PencilIcon className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setDeleteId(point.id)}
            className="text-red-600 hover:text-red-900"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Pontos de Acupuntura
        </h1>
        <Link
          to="/points/new"
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Novo Ponto
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar pontos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={filteredPoints || []}
          isLoading={isLoading}
        />
      </div>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirmar Exclusão"
      >
        <p className="text-gray-600 mb-4">
          Tem certeza que deseja excluir este ponto? Esta ação não pode ser
          desfeita.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setDeleteId(null)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
```

### 7. Point Edit Page

`src/pages/PointEdit.tsx`:

```tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { pointsApi } from "../api/points";
import toast from "react-hot-toast";

interface PointFormData {
  name: string;
  chineseName: string;
  meridian: string;
  number: number;
  location: string;
  functions: string;
  indications: string;
  needleDepth: string;
  cautions: string;
}

export function PointEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === "new";

  const { data: point, isLoading } = useQuery({
    queryKey: ["point", id],
    queryFn: () => pointsApi.getById(id!),
    enabled: !isNew,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PointFormData>({
    defaultValues: point,
  });

  const saveMutation = useMutation({
    mutationFn: (data: PointFormData) =>
      isNew ? pointsApi.create(data) : pointsApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["points"] });
      toast.success(
        isNew ? "Ponto criado com sucesso" : "Ponto atualizado com sucesso"
      );
      navigate("/points");
    },
    onError: () => {
      toast.error("Erro ao salvar ponto");
    },
  });

  const onSubmit = (data: PointFormData) => {
    saveMutation.mutate(data);
  };

  if (!isNew && isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isNew ? "Novo Ponto" : `Editar ${point?.name}`}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome
            </label>
            <input
              {...register("name", { required: "Nome é obrigatório" })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.name && (
              <span className="text-red-500 text-sm">
                {errors.name.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome Chinês
            </label>
            <input
              {...register("chineseName")}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Meridiano
            </label>
            <select
              {...register("meridian", { required: "Meridiano é obrigatório" })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Selecione...</option>
              <option value="LU">Pulmão (LU)</option>
              <option value="LI">Intestino Grosso (LI)</option>
              <option value="ST">Estômago (ST)</option>
              <option value="SP">Baço (SP)</option>
              <option value="HT">Coração (HT)</option>
              <option value="SI">Intestino Delgado (SI)</option>
              <option value="BL">Bexiga (BL)</option>
              <option value="KI">Rim (KI)</option>
              <option value="PC">Pericárdio (PC)</option>
              <option value="TE">Triplo Aquecedor (TE)</option>
              <option value="GB">Vesícula Biliar (GB)</option>
              <option value="LR">Fígado (LR)</option>
              <option value="GV">Vaso Governador (GV)</option>
              <option value="CV">Vaso Concepção (CV)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Número
            </label>
            <input
              type="number"
              {...register("number", { valueAsNumber: true })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Localização
          </label>
          <textarea
            {...register("location")}
            rows={3}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Funções
          </label>
          <textarea
            {...register("functions")}
            rows={3}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Indicações
          </label>
          <textarea
            {...register("indications")}
            rows={3}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/points")}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saveMutation.isPending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
```

### 8. Dashboard Page

`src/pages/Dashboard.tsx`:

```tsx
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import {
  CircleStackIcon,
  MapIcon,
  UsersIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

export function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/stats");
      return data;
    },
  });

  const cards = [
    {
      name: "Total de Pontos",
      value: stats?.totalPoints || 0,
      icon: CircleStackIcon,
      color: "bg-blue-500",
    },
    {
      name: "Meridianos",
      value: stats?.totalMeridians || 0,
      icon: MapIcon,
      color: "bg-green-500",
    },
    {
      name: "Usuários Ativos",
      value: stats?.activeUsers || 0,
      icon: UsersIcon,
      color: "bg-purple-500",
    },
    {
      name: "Favoritos Totais",
      value: stats?.totalFavorites || 0,
      icon: HeartIcon,
      color: "bg-red-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">{card.name}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Atividade Recente */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium text-gray-900">
            Atividade Recente
          </h2>
        </div>
        <div className="p-6">
          {/* Lista de atividades */}
          <p className="text-gray-500">Nenhuma atividade recente.</p>
        </div>
      </div>
    </div>
  );
}
```

### 9. App Router

`src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Points } from "./pages/Points";
import { PointEdit } from "./pages/PointEdit";
import { Meridians } from "./pages/Meridians";
import { Users } from "./pages/Users";
import { Login } from "./pages/Login";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/points" element={<Points />} />
            <Route path="/points/:id" element={<PointEdit />} />
            <Route path="/meridians" element={<Meridians />} />
            <Route path="/users" element={<Users />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
```

## Comandos

```bash
# Criar projeto
cd frontend-admin
npm install
npm run dev

# Build para produção
npm run build
```

## Critérios de Aceitação

- [ ] Login com Firebase Auth funcionando
- [ ] Dashboard com estatísticas básicas
- [ ] CRUD completo de Pontos
- [ ] Listagem de Meridianos
- [ ] Visualização de Usuários (read-only)
- [ ] Layout responsivo
- [ ] Toasts de feedback
- [ ] Loading states
- [ ] Error handling

## Deploy

Pode ser deployado em:

- Firebase Hosting
- Vercel
- Netlify
- Cloud Run (como container)

## Backend Endpoints Necessários

Verificar se existem no backend:

- `GET /api/admin/stats`
- `GET /api/admin/points`
- `GET /api/admin/points/:id`
- `POST /api/admin/points`
- `PUT /api/admin/points/:id`
- `DELETE /api/admin/points/:id`
- `GET /api/admin/meridians`
- `GET /api/admin/users`

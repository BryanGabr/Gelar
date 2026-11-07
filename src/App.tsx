
import { BrowserRouter, Routes, Route, Outlet } from 'react-router';

import { Sidebar } from './components/layout/Sidebar';

import Dashboard from './pages/Dashboard';
import Equipamentos from './pages/Equipamentos';
import Alertas from './pages/Alertas';
import Historico from './pages/Historico';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import Monitor from './pages/Monitor';

function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#090d16] text-white md:flex-row">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Páginas administrativas */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/equipamentos" element={<Equipamentos />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>

        {/* Monitor independente, sem Sidebar */}
        <Route path="/monitor" element={<Monitor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

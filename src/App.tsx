import { BrowserRouter, Routes, Route, Outlet } from 'react-router';

import { Sidebar } from './components/layout/Sidebar';

import Equipamentos from './pages/Equipamentos';
import Alertas from './pages/Alertas';
import Historico from './pages/Historico';
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
        <Route path="/" element={<Monitor />} />

        <Route element={<AppLayout />}>
          <Route path="/equipamentos" element={<Equipamentos />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
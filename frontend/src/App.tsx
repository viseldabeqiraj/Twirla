import { Routes, Route } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import ExperiencePage from './pages/ExperiencePage';
import HomePage from './pages/HomePage';
import RunnerPage from './pages/RunnerPage';
import ShopLandingPage from './pages/ShopLandingPage';

function App() {
  return (
    <>
      <Routes>
        <Route path="/admin/:slug" element={<AdminPage />} />
        <Route path="/shop/:shopSlug" element={<ShopLandingPage />} />
        <Route path="/:mode/:shopName/:uniqueId" element={<ExperiencePage />} />
        <Route path="/runner" element={<RunnerPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </>
  );
}

export default App;


import { Routes, Route, useLocation } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import ExperiencePage from './pages/ExperiencePage';
import HomePage from './pages/HomePage';
import RunnerPage from './pages/RunnerPage';
import ShopLandingPage from './pages/ShopLandingPage';
import ShopCampaignSetupPage from './pages/ShopCampaignSetupPage';
import CampaignSetupGatePage from './pages/CampaignSetupGatePage';
import ShopBuilderGatePage from './pages/ShopBuilderGatePage';
import ShopBuilderPage from './pages/ShopBuilderPage';
import ShopAdminListPage from './pages/ShopAdminListPage';
import ShopAdminEditPage from './pages/ShopAdminEditPage';
import TwirlaLandingPage from './pages/TwirlaLandingPage';
import TwirlaFooter from './components/TwirlaFooter';

function AppRoutes() {
  const { pathname } = useLocation();
  const hideFooter = pathname === '/';

  return (
    <div className="app-layout">
      <div className={`app-content${hideFooter ? ' app-content--marketing' : ''}`}>
        <Routes>
          <Route path="/admin/:slug" element={<AdminPage />} />
          <Route path="/setup/campaign" element={<CampaignSetupGatePage />} />
          <Route path="/setup/campaign/form" element={<ShopCampaignSetupPage />} />
          <Route path="/setup/shop-builder" element={<ShopBuilderGatePage />} />
          <Route path="/setup/shop-builder/form" element={<ShopBuilderPage />} />
          <Route path="/setup/shops" element={<ShopAdminListPage />} />
          <Route path="/setup/shops/:shopId" element={<ShopAdminEditPage />} />
          <Route path="/shop/:shopSlug" element={<ShopLandingPage />} />
          <Route path="/:mode/:shopName/:uniqueId" element={<ExperiencePage />} />
          <Route path="/runner" element={<RunnerPage />} />
          <Route path="/play" element={<HomePage />} />
          <Route path="/" element={<TwirlaLandingPage />} />
        </Routes>
      </div>
      {!hideFooter && <TwirlaFooter />}
    </div>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;


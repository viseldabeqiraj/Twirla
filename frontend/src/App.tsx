import { Routes, Route } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import ExperiencePage from './pages/ExperiencePage';
import HomePage from './pages/HomePage';
import RunnerPage from './pages/RunnerPage';
import ShopLandingPage from './pages/ShopLandingPage';
import ShopCampaignSetupPage from './pages/ShopCampaignSetupPage';
import CampaignSetupGatePage from './pages/CampaignSetupGatePage';
import TwirlaFooter from './components/TwirlaFooter';

function App() {
  return (
    <div className="app-layout">
      <div className="app-content">
        <Routes>
          <Route path="/admin/:slug" element={<AdminPage />} />
          <Route path="/setup/campaign" element={<CampaignSetupGatePage />} />
          <Route path="/setup/campaign/form" element={<ShopCampaignSetupPage />} />
          <Route path="/shop/:shopSlug" element={<ShopLandingPage />} />
          <Route path="/:mode/:shopName/:uniqueId" element={<ExperiencePage />} />
          <Route path="/runner" element={<RunnerPage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
      <TwirlaFooter />
    </div>
  );
}

export default App;


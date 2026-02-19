import { Routes, Route } from 'react-router-dom';
import ExperiencePage from './pages/ExperiencePage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <>
      <Routes>
        <Route path="/:mode/:shopName/:uniqueId" element={<ExperiencePage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </>
  );
}

export default App;


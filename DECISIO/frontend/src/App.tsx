import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Decisions from './pages/Decisions';
import DecisionDetail from './pages/DecisionDetail';
import ProjectContextPage from './pages/ProjectContextPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/decisions" element={<Decisions />} />
          <Route path="/decisions/:id" element={<DecisionDetail />} />
          <Route path="/project-context" element={<ProjectContextPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

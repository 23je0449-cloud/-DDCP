import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RootLayout from '../RootLayout';
import Home from '../Pages/Home';

function App() {
  return (
    <Router>
      <RootLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Add other routes if needed */}
        </Routes>
      </RootLayout>
    </Router>
  );
}

export default App;

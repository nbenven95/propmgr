import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import FilesPage from './pages/FilesPage'
import UploadPage from './pages/UploadPage'

function App() {
  return (
    <Router>
      <nav style={{ padding: '10px', gap: '10px' }}>
        <Link to='/upload'>Upload files</Link> | <Link to='/files'>View uploaded files</Link>
      </nav>
      <Routes>
        <Route path='/upload' element={<UploadPage />} />
        <Route path='/files' element={<FilesPage />} />
      </Routes>
    </Router>
  );
}

export default App;

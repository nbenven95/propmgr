import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import FilesPage from './pages/FilesPage'
import UploadPage from './pages/UploadPage'

function App() {
  return (
    <Router>
      <nav style={{ padding: '10px', gap: '10px' }}>
        <Link to='/api/files'>View uploaded files</Link> | <Link to='/api/files/upload'>Upload files</Link>
      </nav>
      <Routes>
        <Route path='/api/files' element={<FilesPage />} />
        <Route path='/api/files/upload' element={<UploadPage />} />
      </Routes>
    </Router>
  );
}

export default App;

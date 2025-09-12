import React from 'react'
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'

import Navbar from './components/Navbar';
import CreateDocForm from './pages/DocsPage/CreateDocForm';
import DocsPage from './pages/DocsPage/DocsPage';
import FilesPage from './pages/FilesPage/FilesPage';
//import UploadPage from './pages/UploadPage/UploadPage';
import UploadForm from './pages/FilesPage/UploadForm';
import PropertyProfilesPage from './pages/PropertyProfiles/PropertyProfilesPage';


function App() {
  return (
    <Box minH={ "100vh" }>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Navigate to='/properties' replace />} />
          <Route path='/docs' element={<DocsPage />} />
          <Route path='/docs/create' element={<CreateDocForm />} />
          <Route path='/files' element={<FilesPage />} />
          <Route path='/files/upload' element={<UploadForm />} />
          <Route path='/properties' element={<PropertyProfilesPage />} />
        </Routes>
      </Router>
    </Box>
  );
}

export default App;

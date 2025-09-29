import React from 'react'
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'

import Navbar from './components/Navbar';
import FilesPage from './pages/FilesPage/FilesPage';
import UploadForm from './pages/FilesPage/UploadForm';
import DocsPage from './pages/DocsPage/DocsPage';
import CreateDocForm from './pages/DocsPage/CreateDocForm';
import PropertyProfilesPage from './pages/PropertyProfiles/PropertyProfilesPage';
import CreatePropertyProfileForm from './pages/PropertyProfiles/CreatePropertyProfileForm';

import MapTest from './pages/MapTest';

// TODO: add a landing page

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
          <Route path='/properties/create' element={<CreatePropertyProfileForm />} />
          <Route path='/map' element={<MapTest />} />
        </Routes>
      </Router>
    </Box>
  );
}

export default App;

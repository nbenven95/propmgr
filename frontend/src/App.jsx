import React from 'react'
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom'
import { Box, Text } from '@chakra-ui/react'

import CreateDocForm from './pages/DocsPage/CreateDoc/CreateDocForm'
import DocsPage from './pages/DocsPage/DocsPage'
import FilesPage from './pages/FilesPage/FilesPage'
import Navbar from './components/navbar'
import PropertyProfilesPage from './pages/PropertyProfiles/PropertyProfilesPage'
import UploadPage from './pages/UploadPage/UploadPage'

function App() {
  return (
    <Box minH={ "100vh" }>
      <Router>
        <Navbar/>
        <Routes>
          <Route path='/' element={<Navigate to='/properties' replace />} />
          <Route path='/docs' element={<DocsPage />} />
          <Route path='/docs/create' element={<CreateDocForm />} />
          <Route path='/files' element={<FilesPage />} />
          <Route path='/files/upload' element={<UploadPage />} />
          <Route path='/properties' element={<PropertyProfilesPage />} />
        </Routes>
      </Router>
    </Box>
  );
}

export default App;

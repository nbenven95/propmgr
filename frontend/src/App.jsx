import React from 'react'
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'

import CreateDocPage from './pages/CreateDocPage/CreateDocPage'
import DocsPage from './pages/DocsPage/DocsPage'
import FilesPage from './pages/FilesPage/FilesPage'
import Navbar from './components/navbar'
import UploadPage from './pages/UploadPage/UploadPage'

function App() {
  return (
    <Box minH={ "100vh" }>
      <Router>
        <Navbar/>
        <Routes>
          <Route path='/' element={<Navigate to='/files' replace/>}/> {/* TODO: add an actual landing page */}
          <Route path='/docs/create' element={<CreateDocPage/>}/>
          <Route path='/docs' element={<DocsPage/>}/>
          <Route path='/files' element={<FilesPage/>}/>
          <Route path='/files/upload' element={<UploadPage/>}/>
        </Routes>
      </Router>
    </Box>
  );
}

export default App;

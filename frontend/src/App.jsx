import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'

import FilesPage from './pages/FilesPage/FilesPage'
import UploadPage from './pages/UploadPage/UploadPage'
import Navbar from './components/navbar'

function App() {
  return (
    <Box minH={ "100vh" }>
      <Router>
        <Navbar/>
        <Routes>
          <Route path='/api/files' element={<FilesPage/>}/>
          <Route path='/api/files/upload' element={<UploadPage/>}/>
        </Routes>
      </Router>
    </Box>
  );
}

export default App;

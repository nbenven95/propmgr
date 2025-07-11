import { ChakraProvider } from '@chakra-ui/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'; // global styles
import './pages/UploadPage.css'; // page-specific
import './pages/FilesPage.css';  // page-specific


const rootElement = document.getElementById('root');
createRoot(rootElement).render(
  <StrictMode>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </StrictMode>,
);

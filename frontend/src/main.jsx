import { ChakraProvider } from '@chakra-ui/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Import global styles
// TODO: add any css for map rendering
import './styles/global.css'
import 'react-phone-number-input/style.css';

createRoot(document.getElementById('root'))?.render(
  // StrictMode can cause double or quadruple re-renders -- only use for development builds
  
  <StrictMode>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </StrictMode>
  
  /*
  <ChakraProvider>
    <App />
  </ChakraProvider>
  */
);

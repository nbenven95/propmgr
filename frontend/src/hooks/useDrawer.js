import { useState, useCallback } from 'react';
import { useDisclosure } from '@chakra-ui/react';

export default function useDrawer() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [drawerContent, setDrawerContent] = useState({
    header: null,
    body  : null
  });

  /**
   * Opens the drawer and renders the given header and body content 
   */
  const handleOpen = useCallback((headerContent, bodyContent) => {
    setDrawerContent({
      header: headerContent,
      body  : bodyContent
    });
    onOpen();
  }, []);

  /**
   * Wrapper function to clear drawerContent
   * state when the drawer is closed.
   */
  const handleClose = useCallback(() => {
    setDrawerContent({
      header: null,
      body  : null
    });
    onClose();
  }, []);

  return { drawerContent, isOpen, handleOpen, handleClose };
}
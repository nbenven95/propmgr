import { useState, useCallback } from 'react';
import { useDisclosure } from '@chakra-ui/react';

export default function useDrawer() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [drawerContent, setDrawerContent] = useState({
    header: null,
    body  : null
  });

  /**
   * Open the drawer, set drawerContent state, render drawer with header and body.
   * 
   * @param {*} headerContent
   * @param {*} bodyContent
   */
  const handleOpen = useCallback((headerContent, bodyContent) => {
    setDrawerContent({
      header: headerContent,
      body  : bodyContent
    });
    onOpen();
  }, []);

  /**
   * Close the drawer, clear drawerContent state.
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
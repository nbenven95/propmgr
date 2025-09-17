import { useState, useCallback } from 'react';
import { useDisclosure } from '@chakra-ui/react';

export default function useDrawer() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [drawerContent, setDrawerContent] = useState({
    header: <></>,
    body  : <></>
  });

  /**
   * Open the drawer, set drawerContent state, render drawer with header and body.
   * 
   * @param {*} headerContent
   * @param {*} bodyContent
   */
  const onDrawerOpen = useCallback((headerContent, bodyContent) => {
    setDrawerContent(prev => {
      console.log(prev);
      return { header: headerContent, body: bodyContent };
    });
    onOpen();
  }, []);

  /**
   * Close the drawer, clear drawerContent state.
   */
  const onDrawerClose = useCallback(() => {
    setDrawerContent({
      header: <></>,
      body  : <></>
    });
    onClose();
  }, []);

  return { drawerContent, isOpen, onDrawerOpen, onDrawerClose };
}
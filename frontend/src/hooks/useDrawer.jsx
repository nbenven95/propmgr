import React, { useCallback, useEffect, useState } from 'react';
import {
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/react';

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
    setDrawerContent({ header: headerContent, body: bodyContent });
    onOpen();
  }, [onOpen]); // Including this in dependencies is probably not necessary

  /**
   * Close the drawer, clear drawerContent state.
   */
  const onDrawerClose = useCallback(() => {
    setDrawerContent({
      header: <></>,
      body  : <></>
    });
    onClose();
  }, [onClose]);

  // TODO: not sure if I'll need to use references with useEffect to update their values
  const DrawerMenu = ({
    isOpen,
    drawerContent,
    onDrawerClose: handleDrawerClose,
  }) => (
    <Drawer isOpen={isOpen} placement='top' onClose={handleDrawerClose} size='lg'>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth='1px'>{drawerContent.header}</DrawerHeader>
        <DrawerBody p={4}>
          {drawerContent.body}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );

  // TODO: should no longer need to expose drawerContent or isOpen
  return {
    isOpen,
    drawerContent,
    
    onDrawerOpen,
    onDrawerClose,
    DrawerMenu: (props) => (
      <DrawerMenu
        // Use state provided by useDisclosure()
        isOpen={isOpen}
        // Use the drawerContent state defined in the hook
        drawerContent={drawerContent}
        // Use the onDrawerClose callback defined in the hook
        onDrawerClose={onDrawerClose} 
        // Use `props` to override any of the above (at the very least, onDrawerClose)
        {...props}
      />
    )
  };
}
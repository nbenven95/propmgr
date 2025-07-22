import React, { useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom' // Prevent namespace collision
import { Button, Container, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Flex, Input, InputGroup, InputRightAddon, Link, Text, useDisclosure } from '@chakra-ui/react'
import { HamburgerIcon, PlusSquareIcon, SearchIcon } from '@chakra-ui/icons'

import './navbar.css'

/**
 * 
 * @returns
 */
const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure(); // Alternative to useState for managing global state
  const menuBtnRef = useRef();
  const textInputRef = useRef(); // Reference to text input DOM element so we can access search text from submit button onClick handler

  const handleClick = (e) => {
    e.preventDefault();
    alert(textInputRef.current.value);
    onClose();
  };

  return (
    <Container maxW='100vw' px='16px'>
      <Flex className='navbar'>

        {/* Toggle collapsible menu */}
        <Button
          _hover={{ transform: 'scale(1.05)', boxShadow: '3px 3px red,-1em 0 0.4em olive' }} 
          style={{ transition: 'transform 0.2s ease' }}
          onClick={onOpen}
          ref={menuBtnRef}
        >
          <HamburgerIcon fontSize='20'/>
        </Button>

        {/* Side-opening drawer menu */}
        <Drawer isOpen={isOpen} placement='right' onClose={onClose} finalFocusRef={menuBtnRef}>
          <DrawerOverlay/>
          <DrawerContent>
            <DrawerCloseButton/>
            
            {/* Menu header */}
            <DrawerHeader>Menu</DrawerHeader>
            
            {/* Menu body */}
            <DrawerBody>

              {/* Dummy input box */}
              <InputGroup margin='auto' p='2'>
                <Input ref={textInputRef} name='drawerSearch' placeholder='Search' padding='4'/>
                <InputRightAddon>
                  <Button onClick={handleClick}>
                    <SearchIcon/>
                  </Button>
                </InputRightAddon>
              </InputGroup>

              { /* View uploaded files */}
              <Link as={RouterLink} to='/api/files'>
                <Button
                  _hover={{ transform: 'scale(1.05)', boxShadow: '3px 3px red,-1em 0 0.4em olive' }} 
                  style={{ transition: 'transform 0.2s ease' }}
                  onClick={onClose}
                >
                  <Text>View files</Text>
                </Button>
              </Link>
              
              {/* Upload new file */}
              <Link as={ RouterLink } to='/api/files/upload'>
                <Button 
                  _hover={{ transform: 'scale(1.05)', boxShadow: '3px 3px red,-1em 0 0.4em olive' }} 
                  style={{ transition: 'transform 0.2s ease' }}
                  onClick={onClose}
                >
                  <PlusSquareIcon fontSize='20'/>
                </Button>
              </Link>
            </DrawerBody>
            
            {/* Menu footer */}
            <DrawerFooter>
              <Button variant='outline' mr='3' onClick={onClose}>Cancel</Button>
              <Button colorScheme='blue' onClick={() => alert('foobar')}>foobar</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Flex>
    </Container>
  )
}

export default Navbar;
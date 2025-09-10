import React, { useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom' // Prevent namespace collision with @chakra-ui/react
import { HamburgerIcon, PlusSquareIcon, SearchIcon } from '@chakra-ui/icons'
import { 
  Button,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Input,
  InputGroup,
  InputRightAddon,
  Link,
  Text,
  useDisclosure,
  VStack
} from '@chakra-ui/react'

import NavbarLink from '../components/NavbarLink'

import '../styles/navbar.css'

/**
 * 
 * @returns
 */
const Navbar = () => {
  /**
   * 
   */
  const { isOpen, onOpen, onClose } = useDisclosure();
  /**
   * 
   */
  const menuBtnRef = useRef();
  /**
   * Reference to text input DOM element for access
   * to input text from submit button onClick handler
   */
  const textInputRef = useRef();

  const handleSubmitBtnClicked = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleKeyPressed = (e) => {
    e.preventDefault(); // TODO: not sure if this is necessary
    const keyPressed = e.key;
    switch (keyPressed) {
      case 'Enter': handleSearch();
    }
    // TODO: handle other keys (e.g., escape to clear the form, etc.)
  };

  /**
   * 
   * @param {*} query 
   */
  const handleSearch = () => {
    // Get user input from search box via ref
    const query = textInputRef.current.value;
    // TODO: implement search logic, sanitize input, etc.
    alert(query);
    // Auto-close the navbar on successful search
    //onClose();
  };

  return (
    <Container maxW='100vw' px='16px'>
      <Flex className='navbar'>

        {/* TODO: add animation on click */}
        <Button
          _hover={{ transform: 'scale(1.05)', boxShadow: '3px 3px red,-1em 0 0.4em olive' }} 
          style={{ transition: 'transform 0.2s ease' }}
          onClick={onOpen}
          ref={menuBtnRef}
        ><HamburgerIcon fontSize='20'/></Button>

        {/* TODO: add dynamic drawer placement/resizing */}
        <Drawer size='xs' placement='right' isOpen={isOpen} onClose={onClose} finalFocusRef={menuBtnRef}>
          <DrawerOverlay/>
          <DrawerContent width='100%'>
            <DrawerCloseButton/>
            
            {/* Header */}
            <DrawerHeader><Text>Menu</Text></DrawerHeader>
            
            {/* Body content */}
            <DrawerBody width='100%'>
              <VStack spacing='8px' width='100%'>

                {/* TODO: search all collections in propmgr database */}
                <InputGroup margin='auto' p='2'>
                  <Input
                    name='drawerSearch'
                    placeholder={'Search . . .'}
                    padding='4'
                    onKeyDown={handleKeyPressed}
                    ref={textInputRef}
                  />
                  <InputRightAddon>
                    <Button onClick={handleSubmitBtnClicked}><SearchIcon/></Button>
                  </InputRightAddon>
                </InputGroup>

                { /* View uploaded files */}
                <NavbarLink route='/files' label='Files' width='100%' onClose={onClose} />

                {/* Upload new file */}
                <NavbarLink route='/files/upload' label='Upload New File' width='100%' onClose={onClose} />

                {/* View documents */}
                <NavbarLink route='/docs' label='View Documents' width='100%' onClose={onClose} />

                {/* Create documents */}
                // TODO: fix error 
                <NavbarLink route='/docs/create' label='Create New Document' width='100%' onClose={onClose} />

                {/* View Property Profiles */}
                <NavbarLink route='/properties' label='Property Profiles' width='100%' onClose={onClose} />

                {/* TODO: Create Property Profile */}

                {/* TODO: View OpSys Profiles */}

                {/* TODO: Create OpSys Profile */}

                {/* TODO: View Insurance Policies */}

                {/* TODO: Create Insurance Policy */}

              </VStack>
            </DrawerBody>
            
            {/* Menu footer */}
            <DrawerFooter>
              <Button variant='outline' colorScheme='red' mr='3' onClick={onClose} >
                <Text>Close</Text>
              </Button>
            </DrawerFooter>

          </DrawerContent>
        </Drawer>
      </Flex>
    </Container>
  )
}

export default Navbar;
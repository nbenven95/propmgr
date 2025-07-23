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
  InputLeftAddon,
  InputRightAddon,
  Link,
  Text,
  useDisclosure,
  VStack
} from '@chakra-ui/react'

import './navbar.css'

/**
 * 
 * @returns
 */
const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure(); // Alternative to useState for managing global state
  const menuBtnRef = useRef();
  const textInputRef = useRef(); // Reference to text input DOM element so we can access search text from submit button onClick handler

  const handleSubmitBtnClicked = (e) => {
    e.preventDefault();
    const inputText = textInputRef.current.value;
    alert(inputText); // TODO: implement search logic 
    //onClose();
  };

  const handleEnterKeyPressed = (e) => {
    if (e.key === 'Enter') {
      const inputText = textInputRef.current.value;
      alert(inputText); // TODO: implement search logic 
      //onClose();
    }
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
            <DrawerHeader>Menu</DrawerHeader>
            
            {/* Body content */}
            <DrawerBody width='100%'>
              <VStack spacing='8px' width='100%'>

                {/* TODO: search all collections in propmgr database */}
                <InputGroup margin='auto' p='2'>
                  <Input 
                    name='drawerSearch'
                    placeholder={'Search . . .'}
                    padding='4'
                    onKeyDown={handleEnterKeyPressed}
                    ref={textInputRef}
                  />
                  <InputRightAddon>
                    <Button onClick={handleSubmitBtnClicked}><SearchIcon/></Button>
                  </InputRightAddon>
                </InputGroup>
                
                {/* Upload new file */}
                <Link as={ RouterLink } to='/files/upload' width='100%'>
                  <Button 
                    _hover={{ transform: 'scale(1.05)', boxShadow: '3px 3px red,-1em 0 0.4em olive' }} 
                    style={{ transition: 'transform 0.2s ease' }}
                    onClick={onClose}
                    width='100%'
                  >
                    <PlusSquareIcon fontSize='20'/>
                  </Button>
                </Link>

                { /* View uploaded files */}
                <Link as={RouterLink} to='/files' width='100%'>
                  <Button
                    _hover={{ transform: 'scale(1.05)', boxShadow: '3px 3px red,-1em 0 0.4em olive' }} 
                    style={{ transition: 'transform 0.2s ease' }}
                    onClick={onClose}
                    width='100%'
                  >
                    <Text>Files</Text>
                  </Button>
                </Link>

                {/* View documents */}
                <Link as={RouterLink} to='/docs' width='100%'>
                  <Button
                    _hover={{ transform: 'scale(1.05)', boxShadow: '3px 3px red,-1em 0 0.4em olive' }} 
                    style={{ transition: 'transform 0.2s ease' }}
                    onClick={onClose}
                    width='100%'
                  >
                    <Text>Documents</Text>
                 </Button>
                </Link>

                {/* View documents */}
                <Link as={RouterLink} to='/docs/create' width='100%'>
                  <Button
                    _hover={{ transform: 'scale(1.05)', boxShadow: '3px 3px red,-1em 0 0.4em olive' }} 
                    style={{ transition: 'transform 0.2s ease' }}
                    onClick={onClose}
                    width='100%'
                  >
                    <Text>Create Document</Text>
                 </Button>
                </Link>
              </VStack>
            </DrawerBody>
            
            {/* Menu footer */}
            <DrawerFooter>
              <Button 
                variant='outline'
                colorScheme='red'
                mr='3'
                onClick={onClose}
              >
                Cancel
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Flex>
    </Container>
  )
}

export default Navbar;
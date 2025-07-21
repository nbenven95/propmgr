import React, { useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom' // Prevent namespace collision
import { Button, Container, Flex, HStack, Link, Text } from '@chakra-ui/react'
import { PlusSquareIcon } from '@chakra-ui/icons'

const Navbar = () => {

  const FILE_ICON   = '📄';
  const VIEW_MSG    = 'View Uploaded';
  const UPLOAD_MSG  = 'Upload new';
  const SCALING_FACTOR = 1.05;
  const TRANSITION = 'transform 0.2s ease'

  const iconRef = useRef(null);

  return (
    <Container maxW='100vw' px='4'>
      <Flex h='16' alignItems='center' justifyContent='space-between' flexDir={{ base: 'column', sm: 'row' }}>

        {/* View uploaded */}
        <HStack spacing='2' alignItems='center'>
          <Link 
            as={ RouterLink }
            to='/api/files'
            onMouseEnter={() => iconRef.current.style.transform = `scale(${SCALING_FACTOR})`}
            onMouseLeave={() => iconRef.current.style.transform = 'scale(1)'}
          ><Text
              fontSize={{ base: '22', sm: '28' }}
              fontWeight='bold'
              textTransform='lowercase'
              textAlign='left'
              bgGradient='linear(to-r, green.200, pink.500)'
              bgClip='text'
              _hover={{ transform: `scale(${SCALING_FACTOR})` }}
              style={{ transition: TRANSITION }} // Define transition in style (not event handlers) for smooth scaling both ways
            >{ VIEW_MSG }
            </Text>
          </Link>
          <Text
            ref={ iconRef }
            fontSize={{ base: '22', sm: '28' }}
            fontWeight='bold'
            textTransform='lowercase'
            textAlign='right'
            style={{ transition: TRANSITION }}
          >{ FILE_ICON }
          </Text>
        </HStack>

        {/* Upload new */}
        <HStack spacing='2' alignItems='center'>
          <Link as={ RouterLink } to='/api/files/upload'>
            <Button 
              _hover={{ 
                transform: `scale(${SCALING_FACTOR})`, 
                boxShadow: '3px 3px red,-1em 0 0.4em olive'
              }} 
              style={{ transition: TRANSITION }}
            ><PlusSquareIcon fontSize='20'/>
            </Button>
          </Link>
          <Text
            fontSize={{ base: '22', sm: '28' }}
            fontWeight='bold'
            textTransform='lowercase'
            textAlign='center'
            bgGradient='linear(to-r, green.200, pink.500)'
            bgClip='text'
          >{ UPLOAD_MSG }
          </Text>
          <Text
            fontSize={{ base: '22', sm: '28' }}
            fontWeight='bold'
            textTransform='lowercase'
            textAlign='center'
          >{ FILE_ICON }
          </Text>
        </HStack>

      </Flex>
    </Container>
  )
}

export default Navbar;
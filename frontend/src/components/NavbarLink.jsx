import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Text } from '@chakra-ui/react'

// TODO: fix links not displaying at correct width
const NavbarLink = ({
  route,
  label,
  width,
  onClose
}) => {
  return (
    <Link to={route} width={width}>
      <Button
        _hover={{
          transform: 'scale(1.05)',
          boxShadow: '3px 3px red,-1em 0 0.4em olive'
        }}
        style={{
          transition: 'transform 0.2s ease'
        }}
        onClick={onClose}
        width='100%'
      >
        <Text>{label}</Text>
      </Button>
    </Link>
  );
};

export default NavbarLink;
import { Box, IconButton } from '@chakra-ui/react';
import { PlusSquareIcon } from '@chakra-ui/icons';

const CreateNewItemBtn = ({
  label,
  onClick
}) => {
  return (
    <Box px={6} transform={'scale(2)'}>
      <IconButton
        colorScheme='blue'
        aria-label={label}
        size='xs'
        icon={<PlusSquareIcon />} 
        onClick={onClick}
      />
    </Box>
  );
};

export default CreateNewItemBtn;
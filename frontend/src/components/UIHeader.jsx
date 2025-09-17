import {
  Button,
  Flex,
  Heading,
  Spacer
} from '@chakra-ui/react';

import CreateNewItemBtn from './buttons/CreateNewItemBtn'

// TODO: change this to PageHeaderUI; refactor bulk delete controls to separate component (e.g., BulkDeleteUI)

const UIHeader = ({
  title,
  bulkMode,
  onClickCreate: handleClickCreate,
  onClickDelete: handleBulkDelete,
  onClickBulkModeToggle: handleToggleBulkMode
}) => {
  return (
    <Flex mb={4} align='center'>
      <Heading size='lg'>{title}</Heading>
      
      {/* 'Create New' button */}
      <CreateNewItemBtn label={title} onClick={handleClickCreate} />

      <Spacer />

      {/* Display bulk operation controls if bulk mode is enabled */}
      {bulkMode.enabled ? (
        <>
          <Button size='sm' colorScheme='red' onClick={handleToggleBulkMode} >
            Cancel Bulk Delete
          </Button>
          <Button size='sm' colorScheme='red' ml={2} onClick={handleBulkDelete} isDisabled={bulkMode.selected?.length === 0}>
            Delete Selected Items
          </Button>
        </>
      ) : (
        <Button size='sm' colorScheme='blue' onClick={handleToggleBulkMode} >
          Enable Bulk Delete
        </Button>
      )}
    </Flex>
  );
};

export default UIHeader;
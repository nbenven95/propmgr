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
  enableBulkMode,
  disableBulkMode,
  handleBulkDelete,
  handleClickCreate
}) => {

  const isBulkModeDisabled = () => bulkMode.selected.length === 0;

  return (
    <Flex mb={4} align='center'>
      <Heading size='lg'>{title}</Heading>
      
      {/* 'Create New' button */}
      <CreateNewItemBtn label={title} onClick={handleClickCreate} /> {/* TODO: should this be passed as an arrow function? */}

      <Spacer />

      {/* Display bulk operation controls if bulk mode is enabled */}
      {bulkMode.enabled ? (
        <>
          <Button size='sm' colorScheme='red' onClick={disableBulkMode}>
            Cancel Bulk Delete
          </Button>
          <Button size='sm' colorScheme='red' ml={2} onClick={handleBulkDelete} isDisabled={isBulkModeDisabled}>
            Delete Selected
          </Button>
        </>
      ) : (
        <Button size='sm' colorScheme='blue' onClick={enableBulkMode}>
          Enable Bulk Delete
        </Button>
      )}
    </Flex>
  );
};

export default UIHeader;
import { useCallback } from 'react';
import { useToast } from '@chakra-ui/react';

const StatusEnum = Object.freeze({
  INFO    : 'info',
  ERROR   : 'error',
  SUCCESS : 'success',
  WARNING : 'warning',
});

const DURATION = 3000;
const CLOSABLE = true;

/* Hook for encapsulating chakra-ui toasts */
export default function useNotify() {
  
  const toast = useToast();
  
  const notify = useCallback(({ status, title, desc }) => {
    if (!Object.values(StatusEnum).includes(status)) {
      throw new Error(`Invalid status \"${status}\"`);
    }
    toast({ 
      duration    : DURATION,
      isClosable  : CLOSABLE,
      status      : status,
      title       : title,
      description : desc,
    });
  }, []);

  return notify;
}
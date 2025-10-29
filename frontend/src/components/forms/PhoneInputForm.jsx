import React from 'react';
import { Input, VStack } from '@chakra-ui/react';
import PhoneInput, {
  formatPhoneNumber,
  formatPhoneNumberIntl,
  isPossiblePhoneNumber,
  isValidPhoneNumber
} from 'react-phone-number-input';

const DEFAULT_COUNTRY = 'US';

const PhoneInputForm = ({ value, onChange }) => {
  return (
    <>
    <PhoneInput
      international
      countryCallingCodeEditable={false}
      defaultCountry={DEFAULT_COUNTRY}
      value={value}
      onChange={onChange}
    />
    <VStack spacing={2} ml={2}>
      <Input
        isReadOnly
        name='isPossible'
        value={value && isPossiblePhoneNumber(value) ? 'true' : 'false'}
      />
      <Input
        isReadOnly
        name='isValid'
        value={value && isValidPhoneNumber(value) ? 'true' : 'false'}
      />
      <Input
        isReadOnly
        name='national'
        value={value && formatPhoneNumber(value)}
      />
      <Input
        isReadOnly
        name='intl'
        value={value && formatPhoneNumberIntl(value)}
      />
    </VStack>
    </>
  );
};

export default PhoneInputForm;
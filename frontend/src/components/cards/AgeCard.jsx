import { Box, Text } from '@chakra-ui/react';
import { plural } from '../../util/util';

const AgeCard = ({ age }) => {
  // Destructure input
  const { years, days, hours, minutes, seconds, millis } = age;
  return (
    <Box>
      <Text fontWeight='bold'>Age:</Text>
      {years && <Text>{years} {plural('year', years)}</Text>}
      {days && <Text>{days} {plural('day', days)}</Text>}
      {hours && <Text>{hours} {plural('hour', hours)}</Text>}
      {minutes && <Text>{minutes} {plural('minute', minutes)}</Text>}
      {seconds && <Text>{seconds} {plural('second', seconds)}</Text>}
      {millis && <Text>{millis} {plural('millisecond', millis)}</Text>}
    </Box>
  );
};

export default AgeCard;

import { createWidget } from 'expo-widgets';
import { size } from '@expo/ui/jetpack-compose/modifiers';
import {Column,  Image,} from '@expo/ui/jetpack-compose';

const MyWidget = () => {
  'widget';
  return (
    <Column>
      <Image
        source={{ uri: 'pri' }}
        contentDescription="Pri"
        contentScale="fit"
        modifiers={[size(80, 80)]}
      />
    </Column>
  );
};

export default createWidget('MyWidget', MyWidget, {});
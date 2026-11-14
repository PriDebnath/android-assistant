
import { createWidget } from 'expo-widgets';
import { Column, Image } from '@expo/ui/jetpack-compose';

import {
  fillMaxSize,
  cornerRadius,
} from '@expo/ui/jetpack-compose/modifiers';

const MyWidget = () => {
  'widget';

  return (
    <Column modifiers={[fillMaxSize()]}>
      <Image
        source={{ uri: 'pri' }}
        contentDescription="Pri"
        contentScale="crop"
        modifiers={[
          fillMaxSize(),
          cornerRadius(20),
        ]}
      />
    </Column>
  );
};

export default createWidget('MyWidget', MyWidget, {});

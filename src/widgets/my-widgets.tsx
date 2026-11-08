import {
  Column,
  Image,
  Text,
} from '@expo/ui/jetpack-compose';

import { size } from '@expo/ui/jetpack-compose/modifiers';
import { createWidget } from 'expo-widgets';

type MyWidgetProps = {
  count: number;
};

const MyWidget = (props: MyWidgetProps) => {
  'widget';
  return (
    <Column>
      <Image
        source={require('../../assets/images/pri.croped.png')}
        contentDescription="Pri Assistant"
        contentScale="fit"
        modifiers={[size(80, 80)]}
      />

      <Text>Pri Assistant</Text>
      {/* <Text>{props.count}</Text> */}
    </Column>
  );
};

export default createWidget('MyWidget', MyWidget, {
  count: 0,
});
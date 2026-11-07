import { Column, Text } from '@expo/ui/jetpack-compose';
import { createWidget } from 'expo-widgets';

type MyWidgetProps = {
  count: number;
};

const MyWidget = (props: MyWidgetProps) => {
  'widget';
  return (
    <Column>
      <Text>Count: {props.count}</Text>
    </Column>
  );
};

export default createWidget('MyWidget', MyWidget, { count: 0 });

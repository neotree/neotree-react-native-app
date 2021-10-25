import * as React from 'react';
import { RootStackScreenProps } from '@/types';
import { Text, Content } from '@/components/ui';
import { ScreenContainer } from '@/components/ScreenContainer';

export function NotFoundScreen({ navigation }: RootStackScreenProps<'NotFound'>) {
  return (
    <ScreenContainer>
       <Content>
        <Text>Not found</Text>
      </Content>
    </ScreenContainer>
  );
}

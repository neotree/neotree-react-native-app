import React from 'react';
import PreviewSessionForm from '@/containers/Sessions/PreviewSessionForm';
import { useScreensContext } from '@/contexts/screens';
import Content from '@/components/Content';
import Header from './Header';

const Wrapper = props => <Content {...props} padder />;

const PreviewForm = () => {
  const { state: { form } } = useScreensContext();

  return (
    <>
      <Header form={form} />
      <PreviewSessionForm
        form={form}
        Wrapper={Wrapper}
      />
    </>
  );
};

export default PreviewForm;

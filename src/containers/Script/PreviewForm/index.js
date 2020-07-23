import React from 'react';
import PreviewSessionForm from '@/containers/Sessions/PreviewSessionForm';
import { useScreensContext } from '@/contexts/screens';
import Content from '@/components/Content';
import Header from './Header';

const Wrapper = props => <Content {...props} />;

const PreviewForm = () => {
  const { getDiagnoses, state: { form } } = useScreensContext();

  return (
    <>
      <Header form={form} />
      <PreviewSessionForm
        form={form}
        diagnoses={getDiagnoses()}
        Wrapper={Wrapper}
      />
    </>
  );
};

export default PreviewForm;

import React from 'react';
import PreviewSessionForm from '@/containers/Sessions/PreviewSessionForm';
import { useScreensContext } from '@/contexts/screens';
import Content from '@/components/Content';
import Header from './Header';

const Wrapper = props => <Content {...props} />;

const PreviewForm = () => {
  const { getDiagnoses, state: { session } } = useScreensContext();

  if (!session) return null;

  return (
    <>
      <Header session={session} />
      <PreviewSessionForm
        session={session}
        diagnoses={getDiagnoses()}
        Wrapper={Wrapper}
      />
    </>
  );
};

export default PreviewForm;

import React from 'react';
import PreviewSessionForm from '@/containers/Sessions/PreviewSessionForm';
import PrintSessionForm from '@/containers/Sessions/PrintSessionForm';
import { useScreensContext } from '@/contexts/screens';
import { LayoutCard } from '@/components/Layout';
import PageTitle from '@/components/PageTitle';
import { useHistory } from 'react-router-native';
import useBackButton from '@/utils/useBackButton';

const PreviewForm = () => {
  const history = useHistory();

  const { state: { form } } = useScreensContext();

  useBackButton(() => history.push('/'));

  return (
    <>
      <PageTitle title="Summary" onBackPress={() => history.push('/')}>
        <PrintSessionForm form={form} />
      </PageTitle>
      <PreviewSessionForm
        form={form}
        Wrapper={LayoutCard}
      />
    </>
  );
};

export default PreviewForm;

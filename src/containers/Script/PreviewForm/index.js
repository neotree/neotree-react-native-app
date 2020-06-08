import React from 'react';
import Preview from '@/containers/Forms/PreviewForm';
import PrintForm from '@/containers/Forms/PrintForm';
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
        <PrintForm form={form} />
      </PageTitle>
      <Preview
        form={form}
        Wrapper={LayoutCard}
      />
    </>
  );
};

export default PreviewForm;

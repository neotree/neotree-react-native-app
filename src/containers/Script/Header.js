import React from 'react';
import { useScriptContext } from '@/contexts/script';
import { useHistory } from 'react-router-native';
import PageTitle from '@/components/PageTitle';

const Header = () => {
  const history = useHistory();
  const { state: { script } } = useScriptContext();

  return (
    <>
      <PageTitle
        title={script.data.title}
        onBackPress={() => history.goBack()}
      />
    </>
  );
};

export default Header;

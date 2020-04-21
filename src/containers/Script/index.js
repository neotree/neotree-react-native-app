import React from 'react';
import Typography from '@/ui/Typography';
import { useParams } from 'react-router-native';

const Script = () => {
  const { scriptId } = useParams();

  return (
    <>
      <Typography>Script id: {scriptId}</Typography>
    </>
  );
};

export default Script;

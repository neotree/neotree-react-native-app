import React from 'react';
import Diagnoses from './Diagnoses';
import Summary from './Summary';

const SummaryPage = props => {
  const [diagnoses, setDiagnoses] = React.useState([]);
  const [session, setSession] = React.useState(null);

  const _props = { ...props, session, setSession, diagnoses, setDiagnoses, };

  if (!session) return <Diagnoses {..._props} />;

  return <Summary {..._props} />;
};

export default SummaryPage;

import React from 'react';
import PropTypes from 'prop-types';
import Diagnoses from './Diagnoses';
import Summary from './Summary';

const SummaryPage = props => {
  const { savedSession } = props;
  const [diagnoses, setDiagnoses] = React.useState([]);

  const _props = { ...props, diagnoses, setDiagnoses, };

  if (!savedSession) return <Diagnoses {..._props} />;

  return <Summary {..._props} />;
};

SummaryPage.propTypes = {
  savedSession: PropTypes.object,
};

export default SummaryPage;

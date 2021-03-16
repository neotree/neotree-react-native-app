import React from 'react';
import PropTypes from 'prop-types';
import { LayoutScrollableContent } from '@/components/Layout';
import ScreenType from './ScreenType';

const FormPreview = ({ form, Wrapper }) => {
  Wrapper = Wrapper || React.Fragment;
  return (
    <>
      <LayoutScrollableContent>
        <Wrapper>
          {form.data.form
            .filter(({ entry }) => entry.form)
            .map(({ screen, entry }) => {
              return <ScreenType key={screen.id} screen={screen} form={entry} />;
            })}
        </Wrapper>
      </LayoutScrollableContent>
    </>
  );
};

FormPreview.propTypes = {
  form: PropTypes.object.isRequired,
  Wrapper: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object
  ]),
};

export default FormPreview;

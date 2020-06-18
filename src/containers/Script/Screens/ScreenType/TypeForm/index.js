import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Divider from '@/components/Divider';
import { fieldsTypes } from '@/constants/screen';

import Number from './Number';
import Date from './Date';
import DateTime from './DateTime';
import Text from './Text';
import DropDown from './DropDown';
import Period from './Period';
import Time from './Time';

const Form = ({ screen, value, context, onChange }) => {
  const metadata = screen.data.metadata || {};

  const { parseScreenCondition, state: { form } } = context;

  const defaultValue = (metadata.fields || []).map(f => ({
    value: null,
    field: f
  }));

  const [entry, setEntry] = React.useState(value || { value: defaultValue });

  const _onChange = (index, newVal) => setEntry(prevState => ({
    ...prevState,
    value: prevState.value.map((v, i) => {
      if (i === index) return { ...v, ...newVal };
      return v;
    })
  }));

  const evaluateCondition = f => {
    let conditionMet = true;

    if (f.condition) {
      let condition = parseScreenCondition(f.condition, [{ screen, entry }]);
      condition = parseScreenCondition(condition, form);

      try {
        conditionMet = eval(condition);
        // require('@/utils/logger')(`Evaluate screen condition ${f.condition}`, conditionMet);
      } catch (e) {
        // require('@/utils/logger')(`ERROR: Evaluate screen condition ${f.condition}`, e);
        // do nothing
      }
    }

    return conditionMet;
  };

  React.useEffect(() => {
    const completed = entry.value.reduce((acc, { value, field }) => {
      const conditionMet = evaluateCondition(field);
      if (conditionMet && !field.optional && !value) return false;
      // if (!(field.condition && field.optional && value)) acc = false;
      return acc;
    }, true);

    const hasErrors = entry.value.filter(v => v.error).length;

    onChange(hasErrors || !completed ? undefined : entry);
  }, [entry]);

  return (
    <>
      <View>
        {(metadata.fields || []).map((f, i) => {
          return (
            <React.Fragment key={f.key}>
              {(() => {
                let Component = null;
                switch (f.type) {
                  case fieldsTypes.NUMBER:
                    Component = Number;
                    break;
                  case fieldsTypes.DATE:
                    Component = Date;
                    break;
                  case fieldsTypes.DATETIME:
                    Component = DateTime;
                    break;
                  case fieldsTypes.DROPDOWN:
                    Component = DropDown;
                    break;
                  case fieldsTypes.PERIOD:
                    Component = Period;
                    break;
                  case fieldsTypes.TEXT:
                    Component = Text;
                    break;
                  case fieldsTypes.TIME:
                    Component = Time;
                    break;
                  default:
                    // do nothing
                }

                const conditionMet = evaluateCondition(f);

                return !Component ? null : (
                  <Component
                    field={f}
                    conditionMet={conditionMet}
                    value={entry.value[i].value}
                    onChange={(v, error) => {
                      _onChange(i, { value: v, error, field: f });
                    }}
                  />
                );
              })()}

              <Divider border={false} spacing={2} />
            </React.Fragment>
          );
        })}
      </View>
    </>
  );
};

Form.propTypes = {
  screen: PropTypes.object,
  context: PropTypes.object.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

export default Form;

import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Divider from '@/components/Divider';
import { fieldsTypes } from '@/constants/screen';

import FormItem from './_FormItem';
import Number from './Number';
import Date from './Date';
import DateTime from './DateTime';
import Text from './Text';
import DropDown from './DropDown';
import Period from './Period';
import Time from './Time';

const Form = ({ screen, value, context, onChange }) => {
  const metadata = screen.data.metadata || {};

  const { parseScreenCondition, } = context;

  const fields = metadata.fields || [];

  const defaultValue = fields.map(f => ({
    value: null,
    valueText: null,
    label: f.label,
    key: f.key,
    type: f.type,
    dataType: f.dataType,
    confidential: f.confidential,
  }));

  const [entry, setEntry] = React.useState(value || { values: defaultValue });
  const [entryCache, setEntryCache] = React.useState(value || { values: defaultValue });

  const _onChange = (index, newVal) => setEntry(prevState => ({
    ...prevState,
    values: prevState.values.map((v, i) => {
      if (i === index) return { ...v, ...newVal };
      return v;
    })
  }));

  const setCache = (index, newVal) => setEntryCache(prevState => ({
    ...prevState,
    values: prevState.values.map((v, i) => {
      if (i === index) return { ...v, ...newVal };
      return v;
    })
  }));

  const evaluateCondition = f => {
    let conditionMet = true;

    if (f.condition) {
      conditionMet = false;
      const condition = parseScreenCondition(f.condition, [entry]);
      try {
        conditionMet = eval(condition);
      } catch (e) {
        // do nothing
      }
    }

    return conditionMet;
  };

  React.useEffect(() => {
    const completed = entry.values.reduce((acc, { value }, i) => {
      const field = fields[i];
      const conditionMet = evaluateCondition(fields[i]);
      if (conditionMet && !field.optional && !value) return false;
      // if (!(field.condition && field.optional && value)) acc = false;
      return acc;
    }, true);

    const hasErrors = entry.values.filter(v => v.error).length;

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

                const onChange = (v, params = {}) => {
                  _onChange(i, { value: v, ...params });
                };

                return !Component ? null : (
                  <FormItem
                    setCache={v => setCache(i, { value: v })}
                    conditionMet={conditionMet}
                    value={entry.values[i].value}
                    valueCache={entryCache.values[i].value}
                    onChange={onChange}
                  >
                    <Component
                      field={f}
                      conditionMet={conditionMet}
                      value={entry.values[i].value}
                      onChange={onChange}
                      form={entry}
                    />
                  </FormItem>
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

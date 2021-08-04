import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Divider from '@/components/Divider';
import { fieldsTypes } from '@/constants/screen';
import { useContext } from '../../../Context';

import Number from './_Number';
import Date from './_Date';
import _DateTime from './_DateTime';
import Text from './Text';
import DropDown from './_DropDown';
import Period from './_Period';
import Time from './_Time';
import FormItem from './FormItem';

const TypeForm = props => {
  const { state: { autoFill } } = useContext();

  const {
    screen,
    canAutoFill,
    entry: value,
    parseCondition,
    evaluateCondition,
    setEntry: onChange
  } = props;

  const metadata = screen.data.metadata || {};

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

  const [entry, setEntry] = React.useState({ values: defaultValue, ...value });
  const [entryCache, setEntryCache] = React.useState({ values: defaultValue, ...value });

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

  const evaluateFieldCondition = f => {
    let conditionMet = true;
    if (f.condition) conditionMet = evaluateCondition(parseCondition(f.condition, [entry]));
    return conditionMet;
  };

  React.useEffect(() => {
    const completed = entry.values.reduce((acc, { value }, i) => {
      const field = fields[i];
      const conditionMet = evaluateFieldCondition(fields[i]);
      if (conditionMet && !field.optional && !value) return false;
      // if (!(field.condition && field.optional && value)) acc = false;
      return acc;
    }, true);

    const hasErrors = entry.values.filter(v => v.error).length;
    onChange(hasErrors || !completed ? undefined : entry);
  }, [entry]);

  React.useEffect(() => {
    if (canAutoFill && autoFill.session) {
      const _setEntry = prev => {
        return {
          ...prev,
          values: prev.values.map(f => {
            const autoFillObj = autoFill.session.data.entries[f.key];
            let autoFillVal = null;
            if (autoFillObj) {
              autoFillVal = autoFillObj.values.value[0];
              if (autoFillVal) {
                // if ((autoFillObj.type === 'date') || (autoFillObj.type === 'datetime') || (autoFillObj.type === 'time')) {
                //   autoFillVal = new Date(autoFillVal);
                // }
                if (autoFillObj.type === 'number') autoFillVal = `${autoFillVal}`;
              }
            }
            return { ...f, value: autoFillVal };
          }),
        };
      };
      setEntry(_setEntry);
      setEntryCache(_setEntry);
    }
  }, [canAutoFill, autoFill]);

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
                    Component = _DateTime;
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

                const conditionMet = evaluateFieldCondition(f);

                const onChange = (v, params = {}) => {
                  _onChange(i, { value: v, ...params });
                };

                const value = entry.values[i].value;

                return !Component ? null : (
                  <FormItem
                    {...props}
                    setCache={v => setCache(i, { value: v })}
                    conditionMet={conditionMet}
                    value={value}
                    valueCache={entryCache.values[i].value}
                    onChange={onChange}
                  >
                    <Component
                      {...props}
                      field={f}
                      conditionMet={conditionMet}
                      value={value}
                      valueObject={entry.values[i]}
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

TypeForm.propTypes = {
  screen: PropTypes.object,
  entry: PropTypes.object,
  setEntry: PropTypes.func.isRequired,
  evaluateCondition: PropTypes.func.isRequired,
  parseCondition: PropTypes.func.isRequired,
  canAutoFill: PropTypes.bool,
};

export default TypeForm;

import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Divider from '@/ui/Divider';
import { fieldsTypes } from '@/constants/screen';

import Number from './Number';
import Date from './Date';
import DateTime from './DateTime';
import Text from './Text';
import DropDown from './DropDown';
import Period from './Period';
import Time from './Time';

const Form = ({ screen, context }) => {
  const { metadata } = screen.data;

  const { setForm, state: { form, screens } } = context;

  const [localForm, setLocalForm] = React.useState([]);

  const onChange = (index, newVal) => setLocalForm(prevState => prevState.map((v, i) => {
    if (i === index) return { ...v, value: newVal };
    return v;
  }));

  React.useEffect(() => {
    setLocalForm(
      form[screen.id] ?
        form[screen.id]
        :
        (metadata.fields || []).map(f => ({ key: f.key, value: null }))
    );
  }, [screen]);

  React.useEffect(() => {
    const completed = localForm.reduce((acc, v, i) => {
      const f = (metadata.fields || [])[i];
      if (!f.condition && (f.optional === false) && !v.value) acc = false;
      return acc;
    }, true);

    setForm({ [screen.id]: !completed ? undefined : localForm });
  }, [localForm]);

  return (
    <>
      <View>
        {metadata.fields.map((f, i) => {
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

                const state = localForm[i];

                let conditionMet = true;
                let value = null;

                if (state && (state.key === f.key)) {
                  value = state.value;

                  if (f.condition) {
                    let condition = Object.keys(form)
                      .filter(key => form[key])
                      .map(key => screens.filter(s => `${s.id}` === `${key}`)[0])
                      .map(s => {
                        const { key } = (s.data.metadata || {});
                        return !key ? null : ({ key, value: form[s.id].value });
                      })
                      .filter(key => key)
                      .reduce((acc = '', s) => {
                        return acc.split(`$${s.key}`).join(`'${s.value}'`);
                      }, f.condition)
                      .replace(new RegExp(' and ', 'gi'), ' && ')
                      .replace(new RegExp(' or ', 'gi'), ' || ')
                      .replace(new RegExp(' = ', 'gi'), ' == ');

                    condition = localForm.reduce((acc = '', v) => {
                      return acc.replace(`$${v.key}`, `'${v.value || ''}'`);
                    }, condition);

                    try {
                      conditionMet = eval(condition);
                    } catch (e) {
                      conditionMet = true;
                    }
                  }
                }

                return !Component ? null : (
                  <Component
                    field={f}
                    form={localForm}
                    conditionMet={conditionMet}
                    value={value}
                    onChange={v => onChange(i, v)}
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
  context: PropTypes.object.isRequired
};

export default Form;

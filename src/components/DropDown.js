import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableWithoutFeedback, TouchableOpacity, } from 'react-native';
import Text from '@/components/Text';
import Modal from '@/components/Modal';
import _spacing from '@/utils/spacing';
import { Icon, ListItem, Radio, Right, Left } from 'native-base';
import Divider from '@/components/Divider';

const styles = {
  inputBox: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputBoxDisabled: {
    backgroundColor: '#ddd',
  },
  text: {
    
  },
  textDisabled: {
    color: '#999',
  },
  placeholder: {
    color: '#999',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 25,
  },
  option: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  radio: {
    marginRight: 10,
  },
};

const DropDown = ({ 
  style, 
  placeholder, 
  value, 
  options, 
  disabled, 
  title,
  onChange,
}) => {
  const [open, setOpen] = React.useState(false);

  value = typeof value === 'string' ? options.filter(o => o.value === value)[0] : value;

  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => setOpen(true)}
      >
        <View
          style={[
            styles.inputBox,
            disabled ? styles.inputBoxDisabled : null,
            ...(style ? style.map ? style : [style] : [])
          ]}
        >
          <Text
            style={[
              styles.text,
              disabled ? styles.textDisabled : null,
              value ? null : styles.placeholder,
            ]}
          >{value ? value.label : placeholder || ''}</Text>

          <View style={[{ marginLeft: 'auto' }]} />

          <Icon 
            style={[
              styles.text,
              disabled ? styles.textDisabled : null,
            ]}
            name="arrow-dropdown" 
          />
        </View>        
      </TouchableWithoutFeedback>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        style={{ width: '100%', }}
      >
        {!!title && (
          <>
            <Text 
              style={[
                styles.title
              ]}
            >{title}</Text>

            <Divider border={false} />
          </>
        )}

        {options.map((o, i) => {
          const key = `${o}${i}`;
          const selected = value && value.value === o.value;
          const onSelect = () => {
            if (onChange) onChange(o, i);
            setOpen(false);
          };

          return (
            <>
              <View style={[styles.option]} key={key}>
                <View style={[styles.radio]}>
                  <Radio
                    selected={selected}
                    onPress={onSelect}
                  />
                </View>

                <TouchableOpacity style={[{ flex: 1, }]} onPress={onSelect}>
                  <Text>{o.label}</Text>
                </TouchableOpacity>
              </View>
            </>
          );
        })}
      </Modal>
    </>
  );
};

DropDown.propTypes = {
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default DropDown;

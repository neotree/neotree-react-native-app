import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Divider from '@/components/Divider';
import Text from '@/components/Text';

const Entry = ({ entry, matched }) => { // eslint-disable-line
  const { label, values, key } = entry;

  return (
    <>
      <Text>{label}</Text>
      {!values.length ? <Text style={{ color: '#999' }}>N/A</Text> : values.map((v, i) => {
        const matches = matched.filter(e => e.key === v.key);

        return (
          <View key={i}>
            <Text style={{ color: '#999' }}>{v.valueText || v.value || 'N/A'}</Text>
            {!!matches.length && (
              <View>
                <Divider border={false} spacing={1} />
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 12,
                  }}
                >Matched Neolabs</Text>
                {matches.map((e, i) => {
                  return (
                    <View key={`${e.key}${i}`}>
                      {e.values.value.map((text, j) => (
                        <Text key={`${e.key}${i}${j}`} style={{ color: '#999' }}>{`${text}`}</Text>
                      ))}
                    </View>
                  );
                })}
              </View>
          )}
          </View>
        );
      })}
      <Divider spacing={2} />
    </>
  );
};

Entry.propTypes = {
  entry: PropTypes.object.isRequired,
  matched: PropTypes.array.isRequired,
};

export default Entry;

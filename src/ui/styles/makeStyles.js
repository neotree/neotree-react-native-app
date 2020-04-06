import useTheme from './useTheme';

export default (_styles = {}) => {
  return (props = {}) => {
    const theme = useTheme();
    const styles = typeof _styles === 'function' ? _styles(theme, props) : _styles;
    return styles;
  };
};

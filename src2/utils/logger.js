import clc from 'cli-color';

module.exports = (...args) => {
  console.log(...args.map((s, i) => { // eslint-disable-line no-console
    const color = (i !== 0) || (args.length === 1) ? 'blue' : 'cyan';
    return clc[color](s);
  }));
};

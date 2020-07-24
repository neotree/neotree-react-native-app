export default function makeUID() {
  const getRandomChars = (firstOrLast = 'first') => {
    let result = '';
    const chars = firstOrLast === 'last' ? '0123456789' : 'ABCDEF0123456789';
    const charactersLength = chars.length;
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };
  return `${getRandomChars('first')}-${getRandomChars('last')}`;
}

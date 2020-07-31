export default function getScreenLink(direction = 'next') {
  const {
    getScreen,
    router: { match: { params: { scriptId } } }
  } = this;

  direction = ['next', 'back'].includes(direction) ? direction : null;
  let s = null;
  switch (direction) {
    case 'next':
      s = getScreen({ direction: 'next' });
      break;
    case 'back':
      s = getScreen({ direction: 'back' });
      break;
    default:
      s = getScreen();
  }
  return !s ? '' : `/script/${scriptId}/screen/${s.screen.id}`;
}

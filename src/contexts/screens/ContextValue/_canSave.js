export default function canSave() {
  const {
    isLastScreen,
    state: { form, activeScreen, }
  } = this;

  if (!activeScreen) return false;

  if (!form.filter(({ screen }) => screen.id === activeScreen.id)[0]) return false;

  return isLastScreen();
}

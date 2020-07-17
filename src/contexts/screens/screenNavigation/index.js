import _getScreen from './_getScreen';
import _getScreenLink from './_getScreenLink';
import _getLastScreen from './_getLastScreen';

export default function screenNavigation(params = {}) {
    const { state, } = params;

    const getScreen = _getScreen(params);
    const getLastScreen = _getLastScreen(params);
    const isLastScreen = () => state.activeScreen && (state.activeScreen.id === getLastScreen().id);    
    const getScreenLink = _getScreenLink({ ...params, getScreen });
    
    return {
        getScreen,
        getLastScreen,
        isLastScreen,
        getScreenLink,
        canGoToNextScreen: () => {
            if (!getScreenLink('next')) return false;
            if (!state.form.filter(({ screen }) => screen.id === state.activeScreen.id)[0]) return false;
            return true;
        },
        canGoToPrevScreen: () => !!getScreenLink('back'),
    };
};

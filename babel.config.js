module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
		plugins: [
			'react-native-reanimated/plugin' // Reanimated plugin has to be the last item in the plugins array.
           
		],
    };
};

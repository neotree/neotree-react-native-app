module.exports = function(api) {
	api.cache(true);
	return {
		presets: ['babel-preset-expo',"@babel/preset-env","@babel/preset-react"],
		plugins: [
			[
				"module-resolver",
				{
					"root": ["./"],
					"alias": {
						"@": "./"
					},
					"extensions":['.js','.jsx','.ts','.tsx','.json']
				},
		
			],
			'react-native-reanimated/plugin', // Reanimated plugin has to be the last item in the plugins array.
		],
	};
};

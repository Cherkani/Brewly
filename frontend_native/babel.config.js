module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@domain': './src/lib/domain',
            '@application': './src/lib/application',
            '@infrastructure': './src/lib/infrastructure',
            '@presentation': './src/presentation',
            '@shared': './src/lib/shared',
            '@components': './src/presentation/components',
            '@screens': './src/presentation/screens',
            '@navigation': './src/presentation/navigation',
            '@theme': './src/presentation/theme',
            '@assets': './assets',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};


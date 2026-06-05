module.exports = {
  dependencies: {
    'react-native-gesture-handler': {
      platforms: {
        android: {
          packageInstance: 'new RNGestureHandlerPackage()',
          packageImportPath: 'import com.swmansion.gesturehandler.RNGestureHandlerPackage;',
        },
      },
    },
  },
  assets: ['./assets/fonts/'],
};

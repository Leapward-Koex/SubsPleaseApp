import React, {useEffect, useState} from 'react';

import {
  useColorScheme,
} from 'react-native';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import { BottomNavBar } from './components/BottomNavBar';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'tomato',
    accent: 'yellow',
  },
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <PaperProvider theme={theme}>
      <BottomNavBar />
    </PaperProvider>
  );
};

export default App;

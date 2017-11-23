import React from 'react';
import { StyleSheet, Text, View, Button, Linking} from 'react-native';

export default class App extends React.Component {

  render() {
    const url = 'http://google.com';

    const login = () => {
      console.log('Login clicked!');
      Linking.canOpenURL(url).then(supported => {
        if (!supported) {
          console.log('Can\'t handle url: ' + url);
        } else {
          return Linking.openURL(url);
        }
      }).catch(err => console.error('An error occurred', err));
    }

    return (
      <View style={styles.container}>
        <Text>Welcome to Spotipaper please login to Spotify below</Text>
        <Button
          onPress={login}
          title="Login"
          color="#841584"
          accessibilityLabel="Open window to Login to Spotify"/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

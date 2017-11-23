import React from 'react';
import { AsyncStorage, StyleSheet, Text, View, Button, Linking } from 'react-native';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.login = this.login.bind(this);
    this.windowMessage = this.windowMessage.bind(this);
    this.CLIENT_ID = '243b3ba29bd44d0dbf1f70d1a82ebc20';
    this.REDIRECT_URI = 'http://localhost:3000/callback.html';
    this.scopes = ['user-top-read'];
    this.url = 'https://accounts.spotify.com/authorize?client_id=' + this.CLIENT_ID +
      '&redirect_uri=' + encodeURIComponent(this.REDIRECT_URI) +
      '&scope=' + encodeURIComponent(this.scopes.join(' ')) +
      '&response_type=token';
  }

  componentDidMount() {
    console.log('componentDidMount');
    Linking.addEventListener('url', this._handleOpenURL);
  }

  componentWillUnmount() {
    console.log('componentWillUnmount');
    Linking.removeEventListener('url', this._handleOpenURL);
  }

  _handleOpenURL(event) {
    console.log(event);
    console.log(event.url);
  }

  login() {
    console.log('Login clicked!');
    Linking.canOpenURL(this.url).then((supported) => {
      if (!supported) {
        console.log('Can\'t handle url: ' + this.url);
      } else {
        return Linking.openURL(this.url);
      }
    }).catch(err => console.error('An error occurred', err));
  }

  windowMessage(e) {
    if (typeof e.data === 'string') {
      const data = JSON.parse(e.data);
      if (data.hasOwnProperty('access_token')) {
        AsyncStorage.setItem('Spotipaper.accessToken', data.access_token);
      }
      if (data.hasOwnProperty('expires_in')) {
        const now = new Date();
        const expires = new Date(now.getTime() + data.expires_in * 1000);
        AsyncStorage.setItem('Spotipaper.expires', expires);
      }
      this.setState({loggedIn: true});
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Welcome to Spotipaper please login to Spotify below</Text>
        <Button
          onPress={this.login}
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

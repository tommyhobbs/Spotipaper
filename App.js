import React from 'react';
import { StyleSheet, Text, View, Button, Linking } from 'react-native';
import { AuthSession } from 'expo';

const FB_APP_ID = '243b3ba29bd44d0dbf1f70d1a82ebc20';
const scopes = ['user-top-read'];

export default class App extends React.Component {
  state = {
    result: null,
  };

  render() {
    return (
      <View style={styles.container}>
        <Button title="Open FB Auth" onPress={this._handlePressAsync} />
        {this.state.result ? (
          <Text>{JSON.stringify(this.state.result)}</Text>
        ) : null}
      </View>
    );
  }

  _handlePressAsync = async () => {
    let redirectUrl = AuthSession.getRedirectUrl();
    console.log(redirectUrl);
    let result = await AuthSession.startAsync({
      authUrl:
      `https://accounts.spotify.com/authorize?response_type=token` +
      `&client_id=${FB_APP_ID}` +
      '&scope=' + encodeURIComponent(scopes.join(' ')) +
      `&redirect_uri=${encodeURIComponent(redirectUrl)}`,
    });
    this.setState({ result });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

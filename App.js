import React from 'react';
import { StyleSheet, Text, View, Button, AsyncStorage } from 'react-native';
import { AuthSession } from 'expo';

const CLIENT_ID = '1e03fbd440fe4252a70719f1950c59c3';
const scopes = ['user-top-read'];

export default class App extends React.Component {
  state = {
    result: null,
    accessToken: null,
  };

  componentDidMount() {
    const accessToken = AsyncStorage.getItem('@spotipaper:accessToken');
    this.setState(() => { return { accessToken: accessToken } });
  }

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
      `https://accounts.spotify.com/authorize?response_type=code` +
      `&client_id=${CLIENT_ID}` +
      '&scope=' + encodeURIComponent(scopes.join(' ')) +
      `&redirect_uri=${encodeURIComponent(redirectUrl)}`,
    });
    console.log(result);
    if (result.type == 'success') {
      let {params: {code}} = result;
      AsyncStorage.setItem('@spotipaper:accessToken', code);
    }

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

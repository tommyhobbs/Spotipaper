import React from 'react';
import { StyleSheet, Text, View, Button, AsyncStorage } from 'react-native';
import { AuthSession } from 'expo';
import Base64 from './Base64';

const CLIENT_ID = '1e03fbd440fe4252a70719f1950c59c3';
const CLIENT_SECRET = '1a86c6bb04b1498497e5f5a55ec6c229';
const scopes = ['user-top-read'];
const redirectUrl = AuthSession.getRedirectUrl();

export default class App extends React.Component {
  state = {
    accessToken: null,
    code: null,
    expiresIn: null,
    loggedIn:false,
    top: null,
  };

  constructor(props){
    super(props);
    this.login = this.login.bind(this);
    this.getTop = this.getTop.bind(this);
  }

  componentDidMount() {
    // AsyncStorage.getItem('@spotipaper:accessToken', (error, accessToken) => {
    //   if (accessToken !== null) {
    //     console.log(accessToken);
    //     this.setState(() => { return { accessToken: accessToken, loggedIn: true } });
    //     this.getTop();
    //   }
    // });
  }

  login = async () => {
    let call1 = await AuthSession.startAsync({
      authUrl:
      `https://accounts.spotify.com/authorize?response_type=code` +
      `&client_id=${CLIENT_ID}` +
      '&scope=' + encodeURIComponent(scopes.join(' ')) +
      `&redirect_uri=${encodeURIComponent(redirectUrl)}`,
    });
    if (call1.type == 'success') {
      let {params: {code}} = call1;
      console.log('code: ', code);
      const auth = 'Basic ' + Base64.btoa(CLIENT_ID + ':' + CLIENT_SECRET);
      const body = {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUrl
      };
      let formBody = [];
      for (let property in body) {
        const encodedKey = encodeURIComponent(property);
        const encodedValue = encodeURIComponent(body[property]);
        formBody.push(encodedKey + "=" + encodedValue);
      }
      formBody = formBody.join("&");
      try {
        let call2 = fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Authorization': auth,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formBody
        });
        let promise = await call2;
        promise.json().then((data) => {
          console.log('access_token: ', data.access_token);
          console.log('expires_in: ', data.expires_in);
          console.log('this', this);
          () => {
            console.log('this 2', this);
            this.setState({accessToken: data.access_token, expiresIn: data.expires_in});
            this.getTop();
          };
        });
      } catch(error){
        console.error(error);
      }
    }
  };

  getTop = async() => {
    console.log(this.state.accessToken);
    try {
      let response = fetch('https://api.spotify.com/v1/me/top/artists', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer ' + this.state.accessToken
        }
      });

      let data = await response;
      console.log(data);
      // this.setState(() => { return { top: resonpseJson} });
    } catch(error){
      console.error(error);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Spotipaper</Text>
        {this.state.loggedIn ? (
          <View>
            <Text>{JSON.stringify(this.state.accessToken)}</Text>
            <Text>{this.state.top}</Text>
          </View>
        ) : (
          <Button title="Login with Spotify" onPress={this.login} />
        )}
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
  title: {
    fontSize: 19,
    fontWeight: 'bold',
  },
});

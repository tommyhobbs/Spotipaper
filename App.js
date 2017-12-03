import React from 'react';
import { StyleSheet, Text, View, Button, Image, AsyncStorage } from 'react-native';
import { AuthSession } from 'expo';
import Base64 from './Base64';
import ImageGrid from './ImageGrid';

const CLIENT_ID = '1e03fbd440fe4252a70719f1950c59c3';
const CLIENT_SECRET = '1a86c6bb04b1498497e5f5a55ec6c229';
const scopes = ['user-top-read'];
const redirectUrl = AuthSession.getRedirectUrl();

export default class App extends React.Component {
  state = {
    accessToken: null,
    error: null,
    loggedIn:false,
    top: null,
  };

  constructor(props){
    super(props);
    this.login = this.login.bind(this);
    this.getTop = this.getTop.bind(this);
  }

  componentWillMount() {
    const now = new Date();
    AsyncStorage.getItem('@Spotipaper:expires', (error, expiresString) => {
      if (error) {
        console.log('no expirery time set. Likely no accessToken');
      } else if (expiresString !== null) {
        const expires = new Date(expiresString);
        if (expires.getTime() > now.getTime()) {
          console.log('token valid and expires ' + expires);
          AsyncStorage.getItem('@Spotipaper:accessToken', (error, accessToken) => {
            this.setState(() => { return {loggedIn:true, accessToken: accessToken}});
            this.getTop();
          });
        } else {
          console.log('token expired ' + expires);
          AsyncStorage.getItem('@Spotipaper:refreshToken', (error, refreshToken) => {
            this.getRefreshPromise(refreshToken)
              .then(this.parseLogin)
              .catch((error) => { this.setState(() => { return {error: error}});});
          });
        }
      }
    });
  }

  login() {
    this.getCodePromise()
      .then(this.getTokenPromise)
      .then(this.parseLogin)
      .catch((error) => { this.setState(() => { return {error: error}});});
  }

  getCodePromise = async () => {
    return await AuthSession.startAsync({
      authUrl:
      `https://accounts.spotify.com/authorize?response_type=code` +
      `&client_id=${CLIENT_ID}` +
      '&scope=' + encodeURIComponent(scopes.join(' ')) +
      `&redirect_uri=${encodeURIComponent(redirectUrl)}`,
    });
  }

  getTokenPromise = async (promise) => {
    const {params: {code}} = promise;
    let call = fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Base64.btoa(CLIENT_ID + ':' + CLIENT_SECRET),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: this.encodeToForm({
        grant_type: 'authorization_code',
        code: `${code}`,
        redirect_uri: redirectUrl
      })
    });
    let tokenPromise = await call;
    return tokenPromise.json();
  }

  getRefreshPromise = async (refreshToken) => {
    let call = fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Base64.btoa(CLIENT_ID + ':' + CLIENT_SECRET),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: this.encodeToForm({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      })
    });
    let tokenPromise = await call;
    return tokenPromise.json();
  }

  parseLogin(data) {
    if(data.hasOwnProperty('access_token')) {
      console.log('access_token: ', data.access_token);
      let expires = new Date();
      expires.setSeconds(expires.getSeconds() + data.expires_in);
      this.setState(() => { return {loggedIn:true, accessToken: data.access_token}});
      AsyncStorage.setItem('@Spotipaper:accessToken', data.access_token);
      AsyncStorage.setItem('@Spotipaper:expires', expires);
      AsyncStorage.setItem('@Spotipaper:refreshToken', data.refresh_token);
      this.getTop();
    } else {
      this.setState(() => { return {error: data.error}});
    }
  }

  encodeToForm(object) {
    let formBody = [];
    for (let property in object) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(object[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
     return formBody.join("&");
  }

  getTop = async() => {
    console.log(this.state.accessToken);
    try {
      let response = fetch('https://api.spotify.com/v1/me/top/artists', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer ' + this.state.accessToken
        }
      });

      let topPromise = await response;
      topPromise.json().then((data) => {
        this.setState(() => { return { top: data} });
      });
    } catch(error){
      console.error(error);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Spotipaper</Text>
        {this.state.top ? (
          <ImageGrid objects={this.state.top} />
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
    fontSize: 24,
    fontWeight: 'bold',
    paddingBottom: 20
  },
});

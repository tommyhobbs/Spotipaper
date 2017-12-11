import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Dimensions,
  AsyncStorage,
  Slider,
  Switch,
  StatusBar,
} from 'react-native';
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
    dimensions: Dimensions.get('window'),
    error: null,
    loggedIn: false,
    top: null,
    slider: 4,
    type: 'artists',
    showMenu: true,
  };

  constructor(props){
    super(props);
    this.login = this.login.bind(this);
    this.getTop = this.getTop.bind(this);
    this.refreshDimensions = this.refreshDimensions.bind(this);
    this.parseLogin = this.parseLogin.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  componentWillMount() {
    const now = new Date();
    AsyncStorage.getItem('@Spotipaper:expires', (error, expiresString) => {
      if (error) {
        // eslint-disable-next-line no-console
        console.log('no expirery time set. Likely no accessToken');
      } else if (expiresString !== null) {
        const expires = new Date(expiresString);
        if (expires.getTime() > now.getTime()) {
          // eslint-disable-next-line no-console
          console.log('token valid and expires ' + expires);
          AsyncStorage.getItem('@Spotipaper:accessToken', (error, accessToken) => {
            this.setState(() => { return {loggedIn:true, accessToken: accessToken}});
              this.getTop()
              .catch((error) => { this.setState(() => { return {error: error}});});
          });
        } else {
          // eslint-disable-next-line no-console
          console.log('token expired ' + expires);
          AsyncStorage.getItem('@Spotipaper:refreshToken', (error, refreshToken) => {
            this.getRefreshPromise(refreshToken)
              .then(this.parseLogin)
              .then(this.getTop)
              .catch((error) => { this.setState(() => { return {error: error}});});
          });
        }
      }
    });
  }

  refreshDimensions() {
    this.setState(() => { return {dimensions: Dimensions.get('window')}});
  }


  login() {
    this.getCodePromise()
      .then(this.getTokenPromise)
      .then(this.parseLogin)
      .then(this.getTop)
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
        this.setState(() => { return {error: error}});
      });
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
      // eslint-disable-next-line no-console
      console.log('access_token: ', data.access_token);
      let expires = new Date();
      expires.setSeconds(expires.getSeconds() + data.expires_in);
      this.setState(() => { return {loggedIn:true, accessToken: data.access_token}});
      AsyncStorage.setItem('@Spotipaper:accessToken', data.access_token);
      AsyncStorage.setItem('@Spotipaper:expires', expires);
      AsyncStorage.setItem('@Spotipaper:refreshToken', data.refresh_token);
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
    // eslint-disable-next-line no-console
    console.log('getting top: ', this.state.type)
    try {
      let response = fetch('https://api.spotify.com/v1/me/top/' + this.state.type + '?limit=50', {
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
        this.setState(() => { return {error: error}});
    }
  }

  toggleMenu() {
    this.setState((previousState) => { return { showMenu:!previousState.showMenu}});
  }

  render() {
    return (
      <View style={styles.container} onLayout={this.refreshDimensions}>
        <StatusBar hidden={!this.state.showMenu} />
        {this.state.top ? (
          <View style={styles.container}>
            <ImageGrid
              objects={this.state.top}
              dimensions={this.state.dimensions}
              slider={this.state.slider}
              onClick={this.toggleMenu} />
            { this.state.showMenu ? (
              <View style={styles.floatView}>
                <Text style={styles.title}>Spotipaper</Text>
                <Text>Tile size</Text>
                <Slider
                  width={this.state.dimensions.width-100}
                  step={1}
                  minimumValue={1}
                  maximumValue={6}
                  value={this.state.slider}
                  onValueChange={(val) => this.setState({ slider: val })} />
                <Text>Top tracks / Top artists</Text>
                <Switch
                  onValueChange={(value) => {
                    //set the type of search and only call getTop upon completion
                    this.setState(() => { return { type: value ? 'artists' : 'tracks' }},
                    () => {this.getTop()})}
                  }
                  value={this.state.type === 'artists'} />
              </View> )
              : null }
          </View>
        ) : (
          <View>
            <Text style={styles.title}>Spotipaper</Text>
            <Button title="Login with Spotify" onPress={this.login} />
            <Text style={styles.title}>{this.error}</Text>
          </View>
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
    padding: 20
  },
  floatView: {
    flex: 1,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
});

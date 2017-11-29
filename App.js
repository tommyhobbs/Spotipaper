import React from 'react';
import { StyleSheet, Text, View, Button, AsyncStorage } from 'react-native';
import { AuthSession } from 'expo';

const CLIENT_ID = '1e03fbd440fe4252a70719f1950c59c3';
const CLIENT_SECRET = '1a86c6bb04b1498497e5f5a55ec6c229';
const scopes = ['user-top-read'];
const redirectUrl = AuthSession.getRedirectUrl();
const Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}


export default class App extends React.Component {
  state = {
    accessToken: null,
    code: null,
    loggedIn:false,
    top: null,
  };

  constructor(props){
    super(props);
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
    console.log(call1);
    if (call1.type == 'success') {
      let {params: {code}} = call1;
      try {
        let call2 = fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
          },
          body: JSON.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUrl,
            client_id: Base64.encode(CLIENT_ID),
            client_secret: Base64.encode(CLIENT_SECRET)
          })
        });

        let data = await call2;
        console.log(data);
        // this.setState(() => { return { top: resonpseJson} });
      } catch(error){
        console.error(error);
      }
      this.getTop;
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

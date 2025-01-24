import packageInfo from '../../package.json';

export const environment = {
  production: true,
  appVersion: packageInfo.version,
};
export const API_GATEWAY = {
  SERVER: 'http://220.158.141.232:8080/api',
  WEBSOCKET_SERVER: 'http://220.158.141.232:8080/ws',
  ACCESS_TOKEN_KEY: "access_token",
  USER_INFORMATION: "user_information",
  ROLES: "roles",
  ACCOUNTKEY: "accountkey",
  Encryptionkey: "abcdefghijklmnopqrstuvwxyz1234567890",

  firebase: {
    apiKey: "AIzaSyB5IAUSD2rOLtTxmT35RviV2tOloDgJ42c",
    authDomain: "fir-poc-cdbf2.firebaseapp.com",
    projectId: "fir-poc-cdbf2",
    storageBucket: "fir-poc-cdbf2.appspot.com",
    messagingSenderId: "165748186452",
    appId: "1:165748186452:web:e0c542bdbbad4e0439bcc1",
    measurementId: "G-KMTH8PJ94P"
  }
};

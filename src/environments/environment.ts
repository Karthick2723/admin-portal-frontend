import packageInfo from '../../package.json';
export const environment = {
    appVersion: packageInfo.version,
    production: true
};
export const API_GATEWAY = {
    SERVER: 'http://localhost:8080/api',
    WEBSOCKET_SERVER: 'http://localhost:8080/ws',
    ACCESS_TOKEN_KEY: "access_token",
    USER_INFORMATION: "user_information",
    ROLES: "roles",
    ACCOUNTKEY: "accountkey",
    Encryptionkey: "abcdefghijklmnopqrstuvwxyz1234567890",

    firebase: {
        apiKey: "AIzaSyAuJdSTByhCvZRvovKOTwmeR3vDy1olU2w",
        authDomain: "solize-cb0fa.firebaseapp.com",
        projectId: "solize-cb0fa",
        storageBucket: "solize-cb0fa.firebasestorage.app",
        messagingSenderId: "18159392943",
        appId: "1:18159392943:web:26f218a64f642230c0dc5a",
        measurementId: "G-YW6LVVM0EZ"
    }
};


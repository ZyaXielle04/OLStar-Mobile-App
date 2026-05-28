import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  return Google.useAuthRequest({
    expoClientId: "885674115344-d9rhg849gtugja2ibmg56it1q409gr1i.apps.googleusercontent.com",
    iosClientId: "885674115344-1uf795q3ocka2gjaee938meestbo6gfq.apps.googleusercontent.com",
    androidClientId: "885674115344-o3ojb7m5olsg63radp7ppaog4nidgb1u.apps.googleusercontent.com",
    webClientId: "885674115344-d9rhg849gtugja2ibmg56it1q409gr1i.apps.googleusercontent.com",

    useProxy: false,
    redirectUri: Google.makeRedirectUri({
      native: "com.olstar.travelapp:/oauthredirect"
    }),
  });
};
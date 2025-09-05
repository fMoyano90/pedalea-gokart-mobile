import { apiFetch } from '@/lib/api';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { GOOGLE_CLIENT_IDS } from '@/constants/config';

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
    isActive: boolean;
    emailVerified: boolean;
    profilePhotoUrl?: string;
    googleId?: string;
  };
};

export interface GoogleUserInfo {
  id: string;
  name: string;
  email: string;
  photo?: string | null;
  familyName?: string | null;
  givenName?: string | null;
}

// Export GoogleSigninButton for use in components
export { GoogleSigninButton };

class AuthService {
  private isGoogleConfigured = false;

  async initializeGoogleSignIn() {
    try {
      GoogleSignin.configure({
        webClientId: GOOGLE_CLIENT_IDS.WEB_CLIENT_ID,
        iosClientId: GOOGLE_CLIENT_IDS.IOS_CLIENT_ID,
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
      });
      this.isGoogleConfigured = true;
      console.log('Google Sign-In configured successfully');
    } catch (error) {
      console.error('Error configuring Google Sign-In:', error);
      this.isGoogleConfigured = false;
    }
  }

  async signInWithGoogle(): Promise<AuthResponse> {
    if (!this.isGoogleConfigured) {
      await this.initializeGoogleSignIn();
    }

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      if (!userInfo.data?.idToken) {
        throw new Error('No se pudo obtener el token de Google');
      }

      // Send the idToken to our backend for verification and login
      const response = await apiFetch<AuthResponse>('/auth/google', {
        method: 'POST',
        body: { idToken: userInfo.data.idToken },
      });

      return response;
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Inicio de sesión cancelado');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Inicio de sesión en progreso');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services no disponible');
      } else {
        console.error('Google Sign-In error:', error);
        throw new Error('Error al iniciar sesión con Google');
      }
    }
  }

  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Error signing out from Google:', error);
    }
  }

  async revokeAccess(): Promise<void> {
    try {
      await GoogleSignin.revokeAccess();
    } catch (error) {
      console.error('Error revoking Google access:', error);
    }
  }

  async getCurrentUser(): Promise<GoogleUserInfo | null> {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      const user = userInfo.data?.user;
      if (!user) return null;
      
      return {
        id: user.id,
        name: user.name || '',
        email: user.email,
        photo: user.photo,
        familyName: user.familyName,
        givenName: user.givenName,
      };
    } catch {
      return null;
    }
  }

  async isSignedIn(): Promise<boolean> {
    try {
      const currentUser = await GoogleSignin.getCurrentUser();
      return currentUser !== null;
    } catch {
      return false;
    }
  }
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export const authService = new AuthService();
export default authService;



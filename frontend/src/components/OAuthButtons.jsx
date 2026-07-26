import React, { useState, useContext } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import Spinner from './Spinner';
import { auth, googleProvider, signInWithPopup } from '../config/firebase';

const OAuthButtons = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle successful login with user payload
  const processBackendLogin = async (userInfo, idToken = '') => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/google', {
        userInfo,
        token: idToken,
      });

      const { token, ...userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);

      toast.success(`Welcome, ${userData.name || 'User'}! Successfully logged in with Google.`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Google OAuth backend login error:', error);
      const message = error.response?.data?.message || 'Google Login failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Google OAuth flow (via @react-oauth/google)
  const handleGoogleSuccess = async (tokenResponse) => {
    setIsLoading(true);
    try {
      const googleUserRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const googleUser = await googleUserRes.json();

      await processBackendLogin({
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        sub: googleUser.sub,
      });
    } catch (error) {
      toast.error('Failed to retrieve Google user profile');
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google Sign-In failed or was cancelled.'),
  });

  // Firebase Google OAuth Flow
  const handleFirebaseGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      await processBackendLogin(
        {
          email: user.email,
          name: user.displayName,
          picture: user.photoURL,
          sub: user.uid,
        },
        idToken
      );
    } catch (error) {
      console.error('Firebase Google Sign-In Error:', error);
      toast.error(error.message || 'Firebase Google Sign-In failed.');
      setIsLoading(false);
    }
  };

  const onGoogleClick = () => {
    const firebaseKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // 1. If Firebase API Key is set, use Firebase Auth
    if (firebaseKey && !firebaseKey.includes('your_') && firebaseKey.length > 10) {
      handleFirebaseGoogleLogin();
      return;
    }

    // 2. If Google Client ID is set, use direct Google OAuth
    if (googleClientId && !googleClientId.includes('your_google_client_id_here') && !googleClientId.includes('dummy')) {
      loginWithGoogle();
      return;
    }

    // 3. Prompt user on how to configure
    toast((t) => (
      <div className="flex flex-col gap-1.5 text-xs">
        <span className="font-bold text-amber-600 dark:text-amber-400">OAuth Credentials Needed</span>
        <span>Set <code className="bg-slate-200 dark:bg-dark-800 px-1 rounded">VITE_FIREBASE_API_KEY</code> or <code className="bg-slate-200 dark:bg-dark-800 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> in <code className="bg-slate-200 dark:bg-dark-800 px-1 rounded">frontend/.env</code>.</span>
      </div>
    ), { duration: 6000, icon: '🔑' });
  };

  return (
    <div className="w-full space-y-4">
      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
        <span className="absolute bg-white dark:bg-dark-900 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Or continue with
        </span>
      </div>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={onGoogleClick}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-800 dark:bg-dark-950 dark:text-slate-200 dark:hover:bg-dark-800 dark:hover:border-slate-700 dark:focus:ring-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          <>
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </>
        )}
      </button>
    </div>
  );
};

export default OAuthButtons;

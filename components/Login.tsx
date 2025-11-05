import React, { useState } from 'react';
import { supabase } from '../supabase';

interface LoginProps {
  onNavigateToSignUp: () => void;
}

const Login: React.FC<LoginProps> = ({ onNavigateToSignUp }) => {
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error("Error signing in with Google: ", error);
       if (error.message.toLowerCase().includes('failed to fetch') || error.message.toLowerCase().includes('invalid')) {
          setError("Supabase configuration is invalid. Please replace the placeholder values in the supabase.ts file with your actual Supabase project URL and anon key.");
      } else if (error.message.toLowerCase().includes('provider is not enabled')) {
          setError("Authentication failed: The Google provider is not enabled in your Supabase project. Please go to Authentication > Providers in your Supabase dashboard and enable Google.");
      } else {
          setError(`An unexpected error occurred during sign-in: ${error.message}.`);
      }
    }
    setIsLoading(false);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-gray-900 text-gray-200 flex flex-col h-screen font-sans items-center justify-center p-4">
      <div className="text-center p-8 bg-gray-800/40 border border-gray-700/50 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 text-blue-400 mr-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846-.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.567L16.5 21.75l-.398-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.398a2.25 2.25 0 001.423-1.423L16.5 15.75l.398 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.398a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            <h1 className="text-4xl font-bold text-gray-200 tracking-wide">Welcome Back</h1>
        </div>
        <p className="text-gray-400 mb-8">Sign in to continue with Catalyst AI.</p>
        
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center px-4 py-3 text-lg font-semibold bg-white text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200 shadow-md disabled:bg-gray-300"
          disabled={isLoading}
        >
          <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6.04C45.39 40.57 48 33.19 48 24.55z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.73-6.04c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
          Sign in with Google
        </button>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="mx-4 flex-shrink text-sm text-gray-400">OR</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <form onSubmit={handleEmailSignIn}>
            <div className="space-y-4">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            
            {error && (
                <div className="mt-4 p-3 bg-red-900/40 border border-red-700/50 text-red-300 rounded-lg text-sm text-left">
                    <p>{error}</p>
                </div>
            )}

            <button type="submit" disabled={isLoading}
                className="w-full mt-6 px-4 py-2.5 text-lg font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-800 disabled:cursor-wait">
                {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={onNavigateToSignUp}
              className="font-medium text-blue-400 hover:underline focus:outline-none"
            >
              Sign Up
            </button>
        </p>

      </div>
    </div>
  );
};

export default Login;
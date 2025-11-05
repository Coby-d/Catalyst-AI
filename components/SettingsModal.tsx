import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';
import Spinner from './Spinner';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!avatarFile) {
      setError("Please select an image file first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const fileExt = avatarFile.name.split('.').pop();
      // Use a simpler, more standard filename
      const fileName = `avatar.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      // Add a timestamp to bust the cache
      const uniqueUrl = `${publicUrl}?t=${new Date().getTime()}`;

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: uniqueUrl,
        }
      });

      if (updateError) throw updateError;
      
      setSuccess("Profile picture updated successfully!");
      setAvatarFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      console.error("Error updating avatar:", err);
      const errorMessage = err.message?.toLowerCase() || '';
      
      if (errorMessage.includes('bucket not found')) {
        setError("Upload failed: The 'avatars' bucket was not found. Please create a public bucket named 'avatars' in your Supabase project's Storage settings.");
      } else if (errorMessage.includes('security policy') || errorMessage.includes('permission denied')) {
          setError(
            `Upload failed due to a permission error. The previous RLS policy seems to have a syntax error in some environments.\n\n` +
            `Please try this simpler, more robust policy instead:\n\n` +
            `1. In your Supabase dashboard, go to Storage and select the 'avatars' bucket.\n` +
            `2. Go to the 'Policies' tab and create a new policy from scratch.\n` +
            `3. **Policy Name:** "Allow authenticated uploads"\n` +
            `4. **Allowed operation:** Check "insert"\n` +
            `5. **Target roles:** Check "authenticated"\n` +
            `6. **WITH CHECK expression:** Copy and paste the following line exactly:\n` +
            `   (bucket_id = 'avatars' AND name LIKE (auth.uid()::text || '/%'))\n\n` +
            `This ensures users can only upload files into a folder matching their own user ID.`
          );
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full border border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-200">Profile Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
             <img 
                src={previewUrl || user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=random`} 
                alt="Profile" 
                className="w-28 h-28 rounded-full object-cover border-2 border-gray-600"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md"
                aria-label="Change profile picture"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
              </button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/png, image/jpeg"
            onChange={handleFileChange} 
          />
          <p className="text-lg font-semibold">{user.user_metadata?.full_name || user.email}</p>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>

        {error && <div className="mt-4 p-3 bg-red-900/40 border border-red-700/50 text-red-300 rounded-lg text-sm text-left whitespace-pre-wrap">{error}</div>}
        {success && <p className="mt-4 text-center text-green-400 text-sm">{success}</p>}

        {avatarFile && (
           <button
              onClick={handleUpdateAvatar}
              disabled={isLoading}
              className="w-full mt-6 px-4 py-2.5 text-lg font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-800 disabled:cursor-wait flex items-center justify-center"
            >
              {isLoading ? <><Spinner /> Saving...</> : 'Save Changes'}
            </button>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;
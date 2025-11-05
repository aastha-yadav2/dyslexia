// src/components/UserInfo.jsx
import React from 'react';
import { UserCircleIcon } from './icons';
import { signOutUser } from '../services/firebase';

const UserInfo = ({ userProfile, isDemo = false, onSignOutSuccess }) => {
  const handleSignOut = async () => {
    try {
      await signOutUser();
      if (onSignOutSuccess) onSignOutSuccess();
    } catch (e) {
      console.error('Sign out failed', e);
      alert('Sign out failed, please try again.');
    }
  };

  return (
    <div className="flex items-center gap-3">
      {userProfile?.avatarUrl ? (
        <img
          src={userProfile.avatarUrl}
          alt="User avatar"
          className="w-10 h-10 rounded-full"
        />
      ) : (
        <UserCircleIcon className="w-10 h-10 text-slate-500" />
      )}

      <div className="text-left">
        <p className="font-semibold text-slate-200">{userProfile?.name || 'Guest'}</p>
        {!isDemo && (
          <button
            onClick={handleSignOut}
            className="mt-1 text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-500"
          >
            Sign out
          </button>
        )}
      </div>
    </div>
  );
};

export default UserInfo;

'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/types';
import { AtSign, Mail } from 'lucide-react';
import { useState } from 'react';

interface ProfileFormData {
  username: string;
}

interface ProfileInformationProps {
  user: User;
  onProfileUpdate: (data: ProfileFormData) => Promise<void>;
  isLoading: boolean;
}

export function ProfileInformation({ user, onProfileUpdate, isLoading }: ProfileInformationProps) {
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    username: user?.username || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onProfileUpdate(profileForm);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-gray-50"
            />
          </div>
          <p className="text-xs text-gray-500">
            Email cannot be changed. Contact support if needed.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="flex items-center gap-2">
            <AtSign className="h-4 w-4 text-gray-400" />
            <Input
              id="username"
              type="text"
              value={profileForm.username}
              onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
              placeholder="Enter username"
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_]+"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-gray-500">
            Username can only contain letters, numbers, and underscores
          </p>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Update Profile
        </Button>
      </form>
    </div>
  );
}

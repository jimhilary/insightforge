import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { deleteUser } from 'firebase/auth';
import useAuthStore from '../store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, User, Mail, Shield, Trash2, AlertTriangle } from 'lucide-react';
import DarkModeToggle from '../components/DarkModeToggle';
import { useDarkMode } from '../hooks/useDarkMode';
import axios from 'axios';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isDark, toggleDark] = useDarkMode();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      // 1. Delete all user data from backend (projects, research, documents, reports)
      const token = useAuthStore.getState().token;
      const currentUser = auth.currentUser;
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const deleteUrl = `${apiUrl}/api/auth/delete-account`;
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('🗑️ CLIENT: Starting account deletion');
      console.log('📧 Current User Email:', currentUser?.email);
      console.log('🆔 Current User UID:', currentUser?.uid);
      console.log('🔗 API URL:', deleteUrl);
      console.log('🔑 Token:', token ? 'Present' : 'Missing');
      console.log('═══════════════════════════════════════════════════════');
      
      const response = await axios.delete(deleteUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Backend response:', response.data);
      console.log('📧 Deleted Email:', response.data.deletedUserEmail);
      console.log('🆔 Deleted UID:', response.data.deletedUserId);

      // 2. Firebase Auth account is deleted by backend (Admin SDK)
      // No need to delete from client - backend handles it
      console.log('✅ Backend deleted Firebase Auth account');

      // 3. Force logout and clear all auth state
      console.log('🚪 Logging out user...');
      logout();
      
      // Clear any remaining Firebase auth state
      if (auth.currentUser) {
        await auth.signOut();
      }
      
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Redirect to auth page
      console.log('✅ Account deletion complete. Redirecting to login...');
      navigate('/auth', { replace: true });
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err.response?.data?.error || 'Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur-xl transition-colors duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          <DarkModeToggle isDark={isDark} toggle={toggleDark} />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Manage your account and preferences</p>
        </div>

        {/* Profile Information */}
        <Card className="mb-6 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border border-[hsl(var(--border))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <Input
                type="email"
                value={user?.email || ''}
                disabled
                className="cursor-not-allowed"
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Email cannot be changed for security reasons
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                User ID
              </label>
              <Input
                type="text"
                value={user?.uid || ''}
                disabled
                className="cursor-not-allowed font-mono text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-2 border-red-500/50 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
              <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Account
              </h3>
              <div className="text-sm text-red-800 dark:text-red-400 mb-4">
                <p className="mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>All your projects will be deleted</li>
                  <li>All research sessions will be deleted</li>
                  <li>All uploaded documents will be deleted</li>
                  <li>All generated reports will be deleted</li>
                  <li>Your account will be permanently removed</li>
                </ul>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete My Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Delete Account Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p className="text-foreground">
                This action <strong>cannot be undone</strong>. All your data will be permanently erased:
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside text-[hsl(var(--muted-foreground))]">
                <li>All projects and research</li>
                <li>All documents and reports</li>
                <li>Your authentication credentials</li>
              </ul>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Type <span className="font-bold text-red-600 dark:text-red-400">DELETE</span> to confirm:
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => {
                    setConfirmText(e.target.value);
                    setError('');
                  }}
                  placeholder="Type DELETE here"
                  className="font-mono"
                  autoComplete="off"
                />
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setConfirmText('');
                setError('');
              }}
              disabled={deleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting || confirmText !== 'DELETE'}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete Forever'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfilePage;


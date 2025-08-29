import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface GoogleDrivePickerProps {
  onFileSelect: (file: any) => void;
}

const GoogleDrivePicker = ({ onFileSelect }: GoogleDrivePickerProps) => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAuthInProgress, setIsAuthInProgress] = useState(false);

  const handleAuthClick = async () => {
    setIsAuthInProgress(true);
    try {
      const { data, error } = await supabase.functions.invoke('drive-integration', {
        body: { action: 'start-auth' },
      });
      if (error) throw error;
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error starting Google Drive authentication:', error);
    } finally {
      setIsAuthInProgress(false);
    }
  };

  // A real implementation would need a more robust way to handle the callback
  // and securely store the token.

  return (
    <div>
      {!isAuthed ? (
        <Button onClick={handleAuthClick} disabled={isAuthInProgress}>
          {isAuthInProgress ? 'Connecting...' : 'Connect to Google Drive'}
        </Button>
      ) : (
        <p>You are connected to Google Drive.</p>
        // The file picker logic would go here
      )}
    </div>
  );
};

export default GoogleDrivePicker;
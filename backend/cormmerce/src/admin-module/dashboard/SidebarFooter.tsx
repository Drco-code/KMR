import React, { useState } from 'react';
import { Box, Button, Icon, MadeWithLove } from '@adminjs/design-system';
import { useSelector } from 'react-redux';

// AdminJS's own logout button (frontend/components/app/logged-in.js) only
// renders when redux state.session.email is set — that state is populated
// by @adminjs/express's buildAuthenticatedRouter, which this app doesn't
// use (see the comment at the top of admin-module.service.ts: staff share
// the SAME Better Auth session cookie as the rest of the API, checked by a
// plain custom middleware instead). AdminJS therefore never sees a
// "session", so its built-in logout link never appears. This overrides the
// sidebar footer to add a working one, signing out of Better Auth directly.
export default function SidebarFooter() {
  const branding = useSelector((state: { branding: { withMadeWithLove: boolean } }) => state.branding);
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      window.location.href = '/admin/login';
    }
  };

  return (
    <Box mt="lg" mb="md">
      <Box px="lg" pb="default">
        <Button
          type="button"
          variant="text"
          size="sm"
          onClick={handleLogout}
          disabled={signingOut}
        >
          <Icon icon="LogOut" mr="default" />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </Button>
      </Box>
      {branding.withMadeWithLove && <MadeWithLove />}
    </Box>
  );
}

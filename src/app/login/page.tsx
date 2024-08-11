'use client';

import { Box, Button, FormControl, Paper, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function Login() {
  const HOSTNAME = process.env.NEXT_PUBLIC_MEDIAMINE_API_HOSTNAME;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<{ username?: string; password?: string }>({});

  const referrer = searchParams?.get('referrer');

  async function onSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    axios
      .post(`${HOSTNAME}/login`, form)
      .then(({ data }) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('editor', data.editor);
        localStorage.setItem('username', data.username);
        if (referrer) {
          router.push(referrer);
        } else {
          // TODO: remove after more pages are added
          router.push('/journalist');
        }
      })
      .catch((err) => console.error(err));
  }

  return (
    <Paper className="flex justify-center p-16 h-screen">
      <form onClick={onSubmit} className="content-center">
        <Box className="flex flex-col gap-4 p-4">
          <Typography variant="h4" gutterBottom>
            Login to Mediamine
          </Typography>
          <FormControl size="small" className="w-full">
            <TextField
              id="username"
              variant="outlined"
              color="primary"
              size="small"
              label="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </FormControl>
          <FormControl size="small" className="w-full">
            <TextField
              id="password"
              variant="outlined"
              color="primary"
              size="small"
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </FormControl>
          <Button type="submit" variant="contained" onClick={onSubmit}>
            Log In
          </Button>
        </Box>
      </form>
    </Paper>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let result;
    if (isRegister) {
      result = await supabase.auth.signUp({ email, password });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (!result.error && result.data.user) {
      // Ensure the user exists in the Users table with Author role
      const { data: existingUser } = await supabase.from('Users').select('id').eq('id', result.data.user.id).single();
      if (!existingUser) {
        await supabase.from('Users').insert([{ id: result.data.user.id, email, role: 'Author', name: email.split('@')[0] }]);
      }
    }

    if (result.error) {
      alert(result.error.message);
    } else {
      router.push('/');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h1>{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        {isRegister ? 'Sign up to read and comment.' : 'Sign in to access your account.'}
      </p>

      <form onSubmit={handleAuth} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email</label>
          <input 
            type="email" 
            required
            className="input-field" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Password</label>
          <input 
            type="password" 
            required
            className="input-field" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Sign In')}
        </button>
      </form>

      <div style={{ marginTop: '2rem' }}>
        <button onClick={() => setIsRegister(!isRegister)} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
          {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}

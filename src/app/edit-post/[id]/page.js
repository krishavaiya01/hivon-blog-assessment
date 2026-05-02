'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function EditPost({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: userData } = await supabase.from('Users').select('role').eq('id', user.id).single();
      
      const { data: postData } = await supabase
        .from('Posts')
        .select('*')
        .eq('id', params.id)
        .single();
      
      if (postData) {
        if (!userData || (userData.role !== 'Admin' && (userData.role !== 'Author' || postData.author_id !== user.id))) {
          alert('You do not have permission to edit this post.');
          router.push('/');
          return;
        }
        setTitle(postData.title);
        setBody(postData.body);
        setImageUrl(postData.image_url || '');
      } else {
        alert('Post not found');
        router.push('/');
        return;
      }
      setAuthChecking(false);
      setLoadingData(false);
    }
    checkAuth();
  }, [params.id, router, supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('Posts')
      .update({ title, body, image_url: imageUrl })
      .eq('id', params.id);

    if (error) {
      alert(`Error updating post`);
      setLoading(false);
    } else {
      router.push(`/posts/${params.id}`);
    }
  };

  if (loadingData || authChecking) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Edit Post</h1>
      
      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Title</label>
          <input 
            type="text" 
            required
            className="input-field" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Featured Image URL</label>
          <input 
            type="url" 
            className="input-field" 
            value={imageUrl} 
            onChange={e => setImageUrl(e.target.value)} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Body Content</label>
          <textarea 
            required
            rows={10}
            className="input-field" 
            value={body} 
            onChange={e => setBody(e.target.value)} 
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

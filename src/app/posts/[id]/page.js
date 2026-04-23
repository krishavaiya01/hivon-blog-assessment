'use client';

import { useEffect, useState, use; } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function PostPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [newComment, setNewComment] = useState('');
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data: userData } = await supabase.from('Users').select('role').eq('id', user.id).single();
        if (userData) setUserRole(userData.role);
      }

      const { data: postData } = await supabase
        .from('Posts')
        .select('*, Users(name)')
        .eq('id', params.id)
        .single();
      
      setPost(postData);

      const { data: commentsData } = await supabase
        .from('Comments')
        .select('*, Users(name)')
        .eq('post_id', params.id)
        .order('id', { ascending: true });
      
      setComments(commentsData || []);
    }
    load();
  }, [params.id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert('Please log in to comment.');

    const { data, error } = await supabase
      .from('Comments')
      .insert([{ post_id: params.id, user_id: currentUser.id, comment_text: newComment }])
      .select('*, Users(name)')
      .single();
    
    if (error) {
      alert('Failed to post comment');
    } else {
      setComments([...comments, data]);
      setNewComment('');
    }
  };

  const handleEditClick = () => {
    router.push(`/edit-post/${params.id}`);
  };

  if (!post) return <p>Loading...</p>;

  // Only Admin can edit any post, Author can edit their own.
  const canEdit = userRole === 'Admin' || (userRole === 'Author' && post.author_id === currentUser?.id);

  return (
    <div className="card" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      {canEdit && (
        <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
          <div></div>
          <button className="btn btn-secondary" onClick={handleEditClick}>Edit Post</button>
        </div>
      )}
      
      {post.image_url && (
        <img src={post.image_url} alt={post.title} style={{ width: '100%', height: 'auto', borderRadius: '12px', marginBottom: '2rem' }} />
      )}
      
      <h1 style={{ marginBottom: '0.5rem' }}>{post.title}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>By {post.Users?.name || 'Unknown Author'}</p>
      
      <div style={{ background: 'var(--surface-alt)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--accent)', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent)' }}>AI Summary</h3>
        <p style={{ whiteSpace: 'pre-wrap' }}>{post.summary}</p>
      </div>

      <div style={{ fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', marginBottom: '3rem' }}>
        {post.body}
      </div>

      <hr style={{ borderColor: 'var(--border)', marginBottom: '2rem' }} />

      <h3>Comments ({comments.length})</h3>
      
      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {comments.map(comment => (
          <div key={comment.id} style={{ background: 'var(--background)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <strong>{comment.Users?.name || 'Anonymous'}</strong>
            <p style={{ marginTop: '0.5rem' }}>{comment.comment_text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleCommentSubmit} style={{ marginTop: '2rem' }}>
        <textarea 
          required
          rows={4}
          placeholder="Add a comment..."
          className="input-field"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          style={{ marginBottom: '1rem' }}
        />
        <button type="submit" className="btn btn-primary">Post Comment</button>
      </form>
    </div>
  );
}

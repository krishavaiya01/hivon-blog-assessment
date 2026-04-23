import { createClient } from '@/lib/supabaseServer';
import { generateSummary } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role
    const { data: userData } = await supabase
      .from('Users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || (userData.role !== 'Author' && userData.role !== 'Admin')) {
      return NextResponse.json({ error: 'Forbidden. Must be an Author or Admin.' }, { status: 403 });
    }

    const { title, body, image_url } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    // Cost optimization step: Call the Google AI API only ONCE at creation time.
    // The resulting summary is stored permanently in the database so it never has to be generated again.
    const summary = await generateSummary(body);

    const { data: post, error } = await supabase
      .from('Posts')
      .insert([
        {
          title,
          body,
          image_url,
          author_id: user.id,
          summary
        }
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

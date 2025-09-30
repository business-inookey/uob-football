import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireLeadCoach } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const CreateNoteSchema = z.object({
  playerId: z.string().uuid(),
  teamId: z.string().uuid(),
  note: z.string().min(1).max(1000),
});

const UpdateNoteSchema = z.object({
  noteId: z.string().uuid(),
  note: z.string().min(1).max(1000),
});

export async function GET(request: NextRequest) {
  try {
    await requireLeadCoach();
    const supabase = await createClient();
    
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('player_id');
    const teamId = searchParams.get('team_id');

    if (!playerId || !teamId) {
      return NextResponse.json({ error: 'player_id and team_id are required' }, { status: 400 });
    }

    // Fetch notes for the specific player and team
    const { data: notes, error } = await supabase
      .from('player_notes')
      .select(`
        id,
        note,
        created_at,
        created_by
      `)
      .eq('player_id', playerId)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    // If we have notes, fetch the profile names separately
    let notesWithProfiles = notes || [];
    if (notes && notes.length > 0) {
      const createdByIds = [...new Set(notes.map(note => note.created_by))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', createdByIds);

      // Map profile names to notes
      notesWithProfiles = notes.map(note => ({
        ...note,
        profiles: {
          full_name: profiles?.find(p => p.id === note.created_by)?.full_name || 'Unknown'
        }
      }));
    }

    if (error) {
      console.error('Error fetching player notes:', error);
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }

    return NextResponse.json({ notes: notesWithProfiles });

  } catch (error) {
    console.error('Player notes GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, profile } = await requireLeadCoach();
    const supabase = await createClient();
    
    const body = await request.json();
    const { playerId, teamId, note } = CreateNoteSchema.parse(body);

    // Create new note
    const { data: newNote, error } = await supabase
      .from('player_notes')
      .insert({
        player_id: playerId,
        team_id: teamId,
        note: note.trim(),
        created_by: profile.id,
      })
      .select(`
        id,
        note,
        created_at,
        created_by
      `)
      .single();

    // Add profile name to the response
    const noteWithProfile = {
      ...newNote,
      profiles: {
        full_name: profile.full_name || 'Unknown'
      }
    };

    if (error) {
      console.error('Error creating player note:', error);
      return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }

    return NextResponse.json({ note: noteWithProfile });

  } catch (error) {
    console.error('Player notes POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, profile } = await requireLeadCoach();
    const supabase = await createClient();
    
    const body = await request.json();
    const { noteId, note } = UpdateNoteSchema.parse(body);

    // Update existing note
    const { data: updatedNote, error } = await supabase
      .from('player_notes')
      .update({
        note: note.trim(),
        created_by: profile.id, // Update the author
      })
      .eq('id', noteId)
      .select(`
        id,
        note,
        created_at,
        created_by
      `)
      .single();

    // Add profile name to the response
    const noteWithProfile = {
      ...updatedNote,
      profiles: {
        full_name: profile.full_name || 'Unknown'
      }
    };

    if (error) {
      console.error('Error updating player note:', error);
      return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
    }

    return NextResponse.json({ note: noteWithProfile });

  } catch (error) {
    console.error('Player notes PUT error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireLeadCoach();
    const supabase = await createClient();
    
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('id');

    if (!noteId) {
      return NextResponse.json({ error: 'note id is required' }, { status: 400 });
    }

    // Delete note
    const { error } = await supabase
      .from('player_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('Error deleting player note:', error);
      return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Player notes DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireLeadCoach } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { withErrorHandling, handleSupabaseError, createSuccessResponse } from '@/lib/api-helpers';
import { PlayerNote, UUID } from '@/lib/zod';

const CreateNoteSchema = z.object({
  playerId: UUID,
  teamId: UUID,
  note: z.string().min(1).max(1000),
});

const UpdateNoteSchema = z.object({
  noteId: UUID,
  note: z.string().min(1).max(1000),
});

async function getPlayerNotes(request: NextRequest) {
  await requireLeadCoach();
  const supabase = await createClient();
  
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get('player_id');
  const teamId = searchParams.get('team_id');

  if (!playerId || !teamId) {
    handleSupabaseError(new Error('player_id and team_id are required'), 'validating query parameters');
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
    handleSupabaseError(error, 'fetching player notes');
  }

  return createSuccessResponse({ notes: notesWithProfiles });
}

async function postPlayerNote(request: NextRequest) {
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
    handleSupabaseError(error, 'creating player note');
  }

  return createSuccessResponse({ note: noteWithProfile });
}

async function putPlayerNote(request: NextRequest) {
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
    handleSupabaseError(error, 'updating player note');
  }

  return createSuccessResponse({ note: noteWithProfile });
}

async function deletePlayerNote(request: NextRequest) {
  await requireLeadCoach();
  const supabase = await createClient();
  
  const { searchParams } = new URL(request.url);
  const noteId = searchParams.get('id');

  if (!noteId) {
    handleSupabaseError(new Error('note id is required'), 'validating delete request');
  }

    // Delete note
    const { error } = await supabase
      .from('player_notes')
      .delete()
      .eq('id', noteId);

  if (error) {
    handleSupabaseError(error, 'deleting player note');
  }

  return createSuccessResponse({ success: true });
}

export const GET = withErrorHandling(getPlayerNotes);
export const POST = withErrorHandling(postPlayerNote);
export const PUT = withErrorHandling(putPlayerNote);
export const DELETE = withErrorHandling(deletePlayerNote);

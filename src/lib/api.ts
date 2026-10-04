import {
  Meeting,
  JoinMeetingResponse,
  JoinStatusResponse,
  Participant,
  TokenResponse,
  PaginatedMeetings,
} from '@/types/meeting';
import { format, parseISO } from 'date-fns';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Request failed (${res.status})`;
    try {
      const errorData = await res.json();
      if (errorData.detail) {
        errorMsg = typeof errorData.detail === 'string'
          ? errorData.detail
          : JSON.stringify(errorData.detail);
      }
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

/**
 * Ensures any UTC datetime string (whether ending with 'Z' or naive)
 * is parsed correctly as UTC and accurately converted to user's local time.
 */
export function parseUtcDate(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  // If string already has Z or timezone offset (+XX:XX or -XX:XX), parse directly
  const hasTimezone = /Z|[+-]\d{2}:?\d{2}$/i.test(dateStr);
  const normalized = hasTimezone ? dateStr : `${dateStr}Z`;
  try {
    return parseISO(normalized);
  } catch {
    return new Date(normalized);
  }
}

export function formatUtcDate(dateStr?: string | null, formatPattern: string = 'MMM d, yyyy • hh:mm a'): string {
  if (!dateStr) return '';
  const date = parseUtcDate(dateStr);
  if (!date || isNaN(date.getTime())) return dateStr;
  try {
    return format(date, formatPattern);
  } catch {
    return dateStr;
  }
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE_URL}/api/health`, { cache: 'no-store' });
  return handleResponse<{ status: string; database: string; livekit_configured: boolean }>(res);
}

export async function createInstantMeeting(title?: string, waitingRoomEnabled: boolean = false): Promise<Meeting> {
  const res = await fetch(`${API_BASE_URL}/api/meetings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: title || 'Instant Meeting',
      duration_minutes: 45,
      waiting_room_enabled: waitingRoomEnabled,
    }),
  });
  return handleResponse<Meeting>(res);
}

export async function scheduleMeeting(data: {
  title: string;
  description?: string;
  scheduled_time?: string;
  scheduled_start_at?: string;
  duration_minutes: number;
  waiting_room_enabled?: boolean;
}): Promise<Meeting> {
  const res = await fetch(`${API_BASE_URL}/api/meetings/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Meeting>(res);
}

export async function getMeeting(meetingCode: string): Promise<Meeting> {
  const cleanCode = encodeURIComponent(meetingCode.trim());
  const res = await fetch(`${API_BASE_URL}/api/meetings/${cleanCode}`, {
    cache: 'no-store',
  });
  return handleResponse<Meeting>(res);
}

export async function joinMeeting(
  meetingCode: string,
  displayName: string,
  identity?: string,
  userId?: string
): Promise<JoinMeetingResponse> {
  const cleanCode = encodeURIComponent(meetingCode.trim());
  const res = await fetch(`${API_BASE_URL}/api/meetings/${cleanCode}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      display_name: displayName,
      identity,
      user_id: userId,
    }),
  });
  return handleResponse<JoinMeetingResponse>(res);
}

export async function getJoinStatus(meetingCode: string, identity: string): Promise<JoinStatusResponse> {
  const cleanCode = encodeURIComponent(meetingCode.trim());
  const res = await fetch(
    `${API_BASE_URL}/api/meetings/${cleanCode}/join-status?identity=${encodeURIComponent(identity)}`,
    { cache: 'no-store' }
  );
  return handleResponse<JoinStatusResponse>(res);
}

export async function getWaitingParticipants(meetingCode: string): Promise<Participant[]> {
  const cleanCode = encodeURIComponent(meetingCode.trim());
  const res = await fetch(`${API_BASE_URL}/api/meetings/${cleanCode}/waiting-participants`, {
    cache: 'no-store',
  });
  return handleResponse<Participant[]>(res);
}

export async function admitParticipant(meetingCode: string, identity: string): Promise<{ status: string; identity: string }> {
  const cleanCode = encodeURIComponent(meetingCode.trim());
  const res = await fetch(`${API_BASE_URL}/api/meetings/${cleanCode}/participants/${encodeURIComponent(identity)}/admit`, {
    method: 'POST',
  });
  return handleResponse<{ status: string; identity: string }>(res);
}

export async function admitAllParticipants(meetingCode: string): Promise<{ status: string; count: number }> {
  const cleanCode = encodeURIComponent(meetingCode.trim());
  const res = await fetch(`${API_BASE_URL}/api/meetings/${cleanCode}/admit-all`, {
    method: 'POST',
  });
  return handleResponse<{ status: string; count: number }>(res);
}

export async function updateMeetingSecurity(
  meetingCode: string,
  settings: { waiting_room_enabled?: boolean; is_locked?: boolean }
): Promise<Meeting> {
  const cleanCode = encodeURIComponent(meetingCode.trim());
  const res = await fetch(`${API_BASE_URL}/api/meetings/${cleanCode}/security`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  return handleResponse<Meeting>(res);
}

export async function muteAllParticipants(meetingCode: string): Promise<{ status: string }> {
  const cleanCode = encodeURIComponent(meetingCode.trim());
  const res = await fetch(`${API_BASE_URL}/api/meetings/${cleanCode}/mute-all`, {
    method: 'POST',
  });
  return handleResponse<{ status: string }>(res);
}

export async function getMeetingToken(
  meetingCode: string,
  displayName: string,
  isHost = false
): Promise<TokenResponse> {
  const cleanCode = encodeURIComponent(meetingCode.trim());
  const res = await fetch(`${API_BASE_URL}/api/meetings/${cleanCode}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      display_name: displayName,
      is_host: isHost,
    }),
  });
  return handleResponse<TokenResponse>(res);
}

export async function getUpcomingMeetings(): Promise<Meeting[]> {
  const res = await fetch(`${API_BASE_URL}/api/meetings/upcoming`, {
    cache: 'no-store',
  });
  return handleResponse<Meeting[]>(res);
}

export async function getRecentMeetings(): Promise<Meeting[]> {
  const res = await fetch(`${API_BASE_URL}/api/meetings/recent`, {
    cache: 'no-store',
  });
  return handleResponse<Meeting[]>(res);
}

export async function getRecentMeetingsPaginated(page = 1, pageSize = 10): Promise<PaginatedMeetings> {
  const res = await fetch(`${API_BASE_URL}/api/meetings/recent?page=${page}&page_size=${pageSize}`, {
    cache: 'no-store',
  });
  return handleResponse<PaginatedMeetings>(res);
}

export async function endMeeting(meetingCode: string): Promise<Meeting> {
  const cleanCode = encodeURIComponent(meetingCode.trim());
  const res = await fetch(`${API_BASE_URL}/api/meetings/${cleanCode}/end`, {
    method: 'POST',
  });
  return handleResponse<Meeting>(res);
}

export async function leaveMeeting(meetingCode: string, identity: string): Promise<void> {
  const cleanCode = encodeURIComponent(meetingCode.trim());
  await fetch(`${API_BASE_URL}/api/meetings/${cleanCode}/leave?identity=${encodeURIComponent(identity)}`, {
    method: 'POST',
  });
}

export async function removeParticipant(meetingCode: string, identity: string): Promise<void> {
  const cleanCode = encodeURIComponent(meetingCode.trim());
  const res = await fetch(
    `${API_BASE_URL}/api/meetings/${cleanCode}/participants/${encodeURIComponent(identity)}/remove`,
    {
      method: 'POST',
    }
  );
  return handleResponse<void>(res);
}

export async function deleteMeeting(meetingId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to delete meeting');
  }
}

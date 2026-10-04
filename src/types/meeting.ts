export type MeetingStatus = 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
export type AdmissionStatus = 'ADMITTED' | 'WAITING' | 'REMOVED';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

export interface Participant {
  id: string;
  meeting_id: string;
  user_id?: string;
  identity: string;
  display_name: string;
  role: 'HOST' | 'CO_HOST' | 'PARTICIPANT';
  is_muted: boolean;
  is_video_off: boolean;
  admission_status: AdmissionStatus;
  waiting_since?: string;
  joined_at: string;
  left_at?: string;
}

export interface Meeting {
  id: string;
  meeting_code: string;
  room_name: string;
  title: string;
  description?: string;
  host_id: string;
  host?: User;
  scheduled_time?: string;
  scheduled_start_at?: string;
  duration_minutes: number;
  actual_duration_minutes?: number;
  status: MeetingStatus;
  created_at: string;
  started_at?: string;
  actual_started_at?: string;
  ended_at?: string;
  actual_ended_at?: string;
  waiting_room_enabled: boolean;
  is_locked: boolean;
  mute_new_participants: boolean;
  participant_count: number;
  shareable_url?: string;
}

export interface PaginatedMeetings {
  items: Meeting[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface JoinMeetingResponse {
  meeting: Meeting;
  participant: Participant;
  token?: string | null;
  livekit_url: string;
  admission_status: AdmissionStatus;
}

export interface JoinStatusResponse {
  admission_status: AdmissionStatus;
  token?: string | null;
  livekit_url: string;
  meeting?: Meeting;
}

export interface TokenResponse {
  token: string;
  livekit_url: string;
  room_name: string;
  identity: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  identity: string;
  text: string;
  timestamp: string;
  isSelf?: boolean;
}

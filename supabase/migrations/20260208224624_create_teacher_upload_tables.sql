/*
  # Teacher Manual Upload Support - Database Schema

  1. New Tables
    - `exam_sessions`
      - `id` (uuid, primary key) - unique session identifier
      - `exam_name` (text) - display name of the exam
      - `status` (text) - session status: active, completed, archived
      - `created_at` (timestamptz) - when the session was created

    - `exam_participants`
      - `id` (uuid, primary key) - unique participant identifier
      - `session_id` (uuid, FK -> exam_sessions) - which session this student belongs to
      - `student_name` (text) - student's display name
      - `student_email` (text) - student's email address
      - `exam_status` (text) - student's progress: in_progress, completed, submitted
      - `joined_at` (timestamptz) - when the student started the exam

    - `frq_submissions`
      - `id` (uuid, primary key) - unique submission identifier
      - `participant_id` (uuid, FK -> exam_participants) - which participant this submission belongs to
      - `question_id` (text) - which FRQ question this is for
      - `page_key` (text) - which page (page1, page2) of the FRQ
      - `file_url` (text) - URL to the uploaded file in storage
      - `file_name` (text) - original file name
      - `submitted_by` (text) - who submitted: 'student' or 'teacher_manual_support'
      - `uploaded_at` (timestamptz) - when the file was uploaded

  2. Security
    - RLS enabled on all tables
    - Policies for authenticated users to manage their data
    - Anon read/write policies scoped to specific operations for demo functionality

  3. Realtime
    - Enabled on frq_submissions for live updates
*/

-- Exam Sessions
CREATE TABLE IF NOT EXISTS exam_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view exam sessions"
  ON exam_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anon can view active exam sessions"
  ON exam_sessions FOR SELECT
  TO anon
  USING (status = 'active' OR status = 'completed');

-- Exam Participants
CREATE TABLE IF NOT EXISTS exam_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES exam_sessions(id),
  student_name text NOT NULL DEFAULT '',
  student_email text NOT NULL DEFAULT '',
  exam_status text NOT NULL DEFAULT 'in_progress',
  joined_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE exam_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view participants"
  ON exam_participants FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anon can view participants in their session"
  ON exam_participants FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM exam_sessions
      WHERE exam_sessions.id = exam_participants.session_id
      AND (exam_sessions.status = 'active' OR exam_sessions.status = 'completed')
    )
  );

-- FRQ Submissions
CREATE TABLE IF NOT EXISTS frq_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES exam_participants(id),
  question_id text NOT NULL DEFAULT '',
  page_key text NOT NULL DEFAULT '',
  file_url text NOT NULL DEFAULT '',
  file_name text NOT NULL DEFAULT '',
  submitted_by text NOT NULL DEFAULT 'student',
  uploaded_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT unique_submission UNIQUE (participant_id, question_id, page_key)
);

ALTER TABLE frq_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all frq submissions"
  ON frq_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert frq submissions"
  ON frq_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update frq submissions"
  ON frq_submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anon can view frq submissions"
  ON frq_submissions FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM exam_participants
      JOIN exam_sessions ON exam_sessions.id = exam_participants.session_id
      WHERE exam_participants.id = frq_submissions.participant_id
      AND (exam_sessions.status = 'active' OR exam_sessions.status = 'completed')
    )
  );

CREATE POLICY "Anon can insert frq submissions"
  ON frq_submissions FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exam_participants
      JOIN exam_sessions ON exam_sessions.id = exam_participants.session_id
      WHERE exam_participants.id = frq_submissions.participant_id
      AND exam_sessions.status = 'active'
    )
  );

CREATE POLICY "Anon can update frq submissions"
  ON frq_submissions FOR UPDATE
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM exam_participants
      JOIN exam_sessions ON exam_sessions.id = exam_participants.session_id
      WHERE exam_participants.id = frq_submissions.participant_id
      AND exam_sessions.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exam_participants
      JOIN exam_sessions ON exam_sessions.id = exam_participants.session_id
      WHERE exam_participants.id = frq_submissions.participant_id
      AND exam_sessions.status = 'active'
    )
  );

-- Enable realtime on frq_submissions for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE frq_submissions;

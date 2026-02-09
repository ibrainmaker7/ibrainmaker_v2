/*
  # Create Exam Attempts and Answers Tables

  1. New Tables
    - `exam_attempts`
      - `id` (uuid, primary key) - unique attempt identifier
      - `participant_id` (uuid, FK -> exam_participants) - which participant took this attempt
      - `exam_id` (text) - identifier for which exam was taken
      - `status` (text) - attempt status: in_progress, completed, reviewed
      - `raw_score` (integer) - number of correct MCQ answers
      - `total_mcq` (integer) - total number of MCQ questions
      - `started_at` (timestamptz) - when the attempt began
      - `submitted_at` (timestamptz) - when the attempt was submitted

    - `exam_answers`
      - `id` (uuid, primary key) - unique answer identifier
      - `attempt_id` (uuid, FK -> exam_attempts) - which attempt this answer belongs to
      - `question_id` (text) - which question this answer is for
      - `selected_option` (text) - the option chosen (A, B, C, D) or null for FRQ
      - `correct_option` (text) - the correct answer for scoring
      - `is_correct` (boolean) - whether the answer was correct
      - `confidence_level` (text) - student's confidence: low, medium, high
      - `time_spent` (integer) - seconds spent on this question
      - `question_type` (text) - mcq or frq

  2. Security
    - RLS enabled on both tables
    - Policies for authenticated and anon access scoped to session participation
*/

CREATE TABLE IF NOT EXISTS exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES exam_participants(id),
  exam_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'in_progress',
  raw_score integer NOT NULL DEFAULT 0,
  total_mcq integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz
);

ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view exam attempts"
  ON exam_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anon can view own attempts"
  ON exam_attempts FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM exam_participants
      JOIN exam_sessions ON exam_sessions.id = exam_participants.session_id
      WHERE exam_participants.id = exam_attempts.participant_id
      AND (exam_sessions.status = 'active' OR exam_sessions.status = 'completed')
    )
  );

CREATE POLICY "Anon can insert attempts"
  ON exam_attempts FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exam_participants
      JOIN exam_sessions ON exam_sessions.id = exam_participants.session_id
      WHERE exam_participants.id = exam_attempts.participant_id
    )
  );

CREATE POLICY "Anon can update own attempts"
  ON exam_attempts FOR UPDATE
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM exam_participants
      JOIN exam_sessions ON exam_sessions.id = exam_participants.session_id
      WHERE exam_participants.id = exam_attempts.participant_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exam_participants
      JOIN exam_sessions ON exam_sessions.id = exam_participants.session_id
      WHERE exam_participants.id = exam_attempts.participant_id
    )
  );

CREATE TABLE IF NOT EXISTS exam_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES exam_attempts(id),
  question_id text NOT NULL DEFAULT '',
  selected_option text,
  correct_option text,
  is_correct boolean DEFAULT false,
  confidence_level text NOT NULL DEFAULT 'medium',
  time_spent integer NOT NULL DEFAULT 0,
  question_type text NOT NULL DEFAULT 'mcq',

  CONSTRAINT unique_attempt_question UNIQUE (attempt_id, question_id)
);

ALTER TABLE exam_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view exam answers"
  ON exam_answers FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anon can view answers for accessible attempts"
  ON exam_answers FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM exam_attempts
      JOIN exam_participants ON exam_participants.id = exam_attempts.participant_id
      JOIN exam_sessions ON exam_sessions.id = exam_participants.session_id
      WHERE exam_attempts.id = exam_answers.attempt_id
      AND (exam_sessions.status = 'active' OR exam_sessions.status = 'completed')
    )
  );

CREATE POLICY "Anon can insert answers"
  ON exam_answers FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exam_attempts
      JOIN exam_participants ON exam_participants.id = exam_attempts.participant_id
      JOIN exam_sessions ON exam_sessions.id = exam_participants.session_id
      WHERE exam_attempts.id = exam_answers.attempt_id
    )
  );

CREATE POLICY "Anon can update answers"
  ON exam_answers FOR UPDATE
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM exam_attempts
      JOIN exam_participants ON exam_participants.id = exam_attempts.participant_id
      JOIN exam_sessions ON exam_sessions.id = exam_participants.session_id
      WHERE exam_attempts.id = exam_answers.attempt_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exam_attempts
      JOIN exam_participants ON exam_participants.id = exam_attempts.participant_id
      JOIN exam_sessions ON exam_sessions.id = exam_participants.session_id
      WHERE exam_attempts.id = exam_answers.attempt_id
    )
  );

/*
  # Create Questions Bank and Exam-Questions Link Tables

  1. New Tables
    - `questions`
      - `id` (uuid, primary key)
      - `content_text` (text) - the question prompt with LaTeX
      - `content_images` (text[]) - optional image URLs
      - `structure_type` (text) - 'mcq' or 'frq'
      - `structure_data` (jsonb) - options for MCQ, metadata for FRQ
      - `grading_logic` (jsonb) - correct_answer, explanation, etc.
      - `explanation` (text) - detailed explanation
      - `passage` (text) - optional passage/context
      - `difficulty` (integer) - 1-5
      - `created_at` (timestamptz)

    - `exam_questions`
      - `exam_id` (text) - links to an exam identifier
      - `question_id` (uuid) - references questions(id)
      - `sequence_order` (integer) - display order
      - `points` (integer) - point value
      - Primary key: (exam_id, question_id)

  2. Security
    - Enable RLS on both tables
    - Allow authenticated users to read questions (for exam-taking)
    - Allow authenticated users to read exam_questions (for exam-taking)

  3. Seed Data
    - 6 AP Calculus BC questions (4 MCQ + 2 FRQ)
    - Linked to demo exam 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
*/

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_text TEXT,
  content_images TEXT[] DEFAULT '{}',
  structure_type TEXT DEFAULT 'mcq',
  structure_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  grading_logic JSONB NOT NULL DEFAULT '{}'::jsonb,
  explanation TEXT,
  passage TEXT,
  difficulty INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read questions"
  ON questions FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Exam Questions link table
CREATE TABLE IF NOT EXISTS exam_questions (
  exam_id TEXT NOT NULL,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  sequence_order INTEGER DEFAULT 0,
  points INTEGER DEFAULT 1,
  PRIMARY KEY (exam_id, question_id)
);

ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read exam questions"
  ON exam_questions FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Seed: Insert 6 AP Calculus BC demo questions
INSERT INTO questions (id, content_text, content_images, structure_type, structure_data, grading_logic, explanation, passage, difficulty)
VALUES
  (
    'a1000000-0000-0000-0000-000000000001',
    'If $f(x) = \int_{0}^{x} (t^2 + 2t) dt$, what is $f''(3)$?',
    ARRAY['https://images.pexels.com/photos/3729557/pexels-photo-3729557.jpeg?auto=compress&cs=tinysrgb&w=600'],
    'mcq',
    '{"options": [{"key": "A", "text": "$9$"}, {"key": "B", "text": "$15$"}, {"key": "C", "text": "$21$"}, {"key": "D", "text": "$27$"}]}'::jsonb,
    '{"correct_answer": "B"}'::jsonb,
    'By the Fundamental Theorem of Calculus, $f''(x) = x^2 + 2x$. Substituting $x = 3$: $f''(3) = 3^2 + 2(3) = 9 + 6 = 15$.',
    NULL,
    3
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'Evaluate the definite integral: $$\int_{0}^{1} x^2 dx$$',
    '{}',
    'mcq',
    '{"options": [{"key": "A", "text": "$\\frac{1}{4}$"}, {"key": "B", "text": "$\\frac{1}{3}$"}, {"key": "C", "text": "$\\frac{1}{2}$"}, {"key": "D", "text": "$1$"}]}'::jsonb,
    '{"correct_answer": "B"}'::jsonb,
    'Using the power rule for integration: $\int_{0}^{1} x^2 dx = \left[\frac{x^3}{3}\right]_0^1 = \frac{1}{3} - 0 = \frac{1}{3}$.',
    NULL,
    2
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'Find the derivative of $f(x) = e^{x^2}$ using the chain rule.',
    '{}',
    'mcq',
    '{"options": [{"key": "A", "text": "$e^{x^2}$"}, {"key": "B", "text": "$2xe^{x^2}$"}, {"key": "C", "text": "$x^2e^{x^2}$"}, {"key": "D", "text": "$2e^{x^2}$"}]}'::jsonb,
    '{"correct_answer": "B"}'::jsonb,
    'Let $u = x^2$, so $f(x) = e^u$. By the chain rule: $f''(x) = e^u \cdot \frac{du}{dx} = e^{x^2} \cdot 2x = 2xe^{x^2}$.',
    'The chain rule states that if $y = f(g(x))$, then $\frac{dy}{dx} = f''(g(x)) \cdot g''(x)$.',
    3
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    'What is the limit: $$\lim_{x \to 0} \frac{\sin(x)}{x}$$',
    '{}',
    'mcq',
    '{"options": [{"key": "A", "text": "$0$"}, {"key": "B", "text": "$1$"}, {"key": "C", "text": "$\\infty$"}, {"key": "D", "text": "Does not exist"}]}'::jsonb,
    '{"correct_answer": "B"}'::jsonb,
    'This is a fundamental limit in calculus. By L''Hopital''s Rule or the Squeeze Theorem, $\displaystyle\lim_{x \to 0} \frac{\sin(x)}{x} = 1$. As $x \to 0$, $\sin(x) \approx x$, so the ratio approaches $1$.',
    NULL,
    2
  ),
  (
    'a1000000-0000-0000-0000-000000000005',
    'Let $g$ be a continuous function defined on the interval $[0, 8]$. The function and its derivatives have the properties indicated in the table above. Find all values of $x$ for which $g$ has a relative extremum on the open interval $(0, 8)$. Determine whether $g$ has a relative maximum or minimum at each of these values. Justify your answers.',
    '{}',
    'frq',
    '{"parts": ["a", "b", "c"], "total_points": 9}'::jsonb,
    '{}'::jsonb,
    NULL,
    NULL,
    4
  ),
  (
    'a1000000-0000-0000-0000-000000000006',
    'The rate at which water flows into a tank, in gallons per hour, is given by $R(t) = 200e^{-0.5t}$. The tank initially contains 100 gallons of water. Write, but do not evaluate, an expression involving an integral for the total amount of water in the tank at time $t = 4$ hours.',
    '{}',
    'frq',
    '{"parts": ["a", "b"], "total_points": 9}'::jsonb,
    '{}'::jsonb,
    NULL,
    NULL,
    3
  );

-- Link questions to the demo exam
INSERT INTO exam_questions (exam_id, question_id, sequence_order, points)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a1000000-0000-0000-0000-000000000001', 1, 1),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a1000000-0000-0000-0000-000000000002', 2, 1),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a1000000-0000-0000-0000-000000000003', 3, 1),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a1000000-0000-0000-0000-000000000004', 4, 1),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a1000000-0000-0000-0000-000000000005', 5, 9),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a1000000-0000-0000-0000-000000000006', 6, 9);

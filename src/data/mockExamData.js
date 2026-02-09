export const ALL_QUESTIONS = [
  {
    id: 'q1',
    question_number: 1,
    question_type: 'mcq',
    question_text: 'If $f(x) = \\int_{0}^{x} (t^2 + 2t) dt$, what is $f\'(3)$?',
    passage: null,
    image_url: 'https://images.pexels.com/photos/3729557/pexels-photo-3729557.jpeg?auto=compress&cs=tinysrgb&w=600',
    options: [
      { key: 'A', text: '$9$' },
      { key: 'B', text: '$15$' },
      { key: 'C', text: '$21$' },
      { key: 'D', text: '$27$' }
    ],
    correct_answer: 'B',
    explanation: 'By the Fundamental Theorem of Calculus, $f\'(x) = x^2 + 2x$. Substituting $x = 3$: $f\'(3) = 3^2 + 2(3) = 9 + 6 = 15$.'
  },
  {
    id: 'q2',
    question_number: 2,
    question_type: 'mcq',
    question_text: 'Evaluate the definite integral: $$\\int_{0}^{1} x^2 dx$$',
    passage: null,
    image_url: null,
    options: [
      { key: 'A', text: '$\\frac{1}{4}$' },
      { key: 'B', text: '$\\frac{1}{3}$' },
      { key: 'C', text: '$\\frac{1}{2}$' },
      { key: 'D', text: '$1$' }
    ],
    correct_answer: 'B',
    explanation: 'Using the power rule for integration: $\\int_{0}^{1} x^2 dx = \\left[\\frac{x^3}{3}\\right]_0^1 = \\frac{1}{3} - 0 = \\frac{1}{3}$.'
  },
  {
    id: 'q3',
    question_number: 3,
    question_type: 'mcq',
    question_text: 'Find the derivative of $f(x) = e^{x^2}$ using the chain rule.',
    passage: 'The chain rule states that if $y = f(g(x))$, then $\\frac{dy}{dx} = f\'(g(x)) \\cdot g\'(x)$.',
    image_url: null,
    options: [
      { key: 'A', text: '$e^{x^2}$' },
      { key: 'B', text: '$2xe^{x^2}$' },
      { key: 'C', text: '$x^2e^{x^2}$' },
      { key: 'D', text: '$2e^{x^2}$' }
    ],
    correct_answer: 'B',
    explanation: 'Let $u = x^2$, so $f(x) = e^u$. By the chain rule: $f\'(x) = e^u \\cdot \\frac{du}{dx} = e^{x^2} \\cdot 2x = 2xe^{x^2}$.'
  },
  {
    id: 'q4',
    question_number: 4,
    question_type: 'mcq',
    question_text: 'What is the limit: $$\\lim_{x \\to 0} \\frac{\\sin(x)}{x}$$',
    passage: null,
    image_url: null,
    options: [
      { key: 'A', text: '$0$' },
      { key: 'B', text: '$1$' },
      { key: 'C', text: '$\\infty$' },
      { key: 'D', text: 'Does not exist' }
    ],
    correct_answer: 'B',
    explanation: 'This is a fundamental limit in calculus. By L\'Hopital\'s Rule or the Squeeze Theorem, $\\displaystyle\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1$. As $x \\to 0$, $\\sin(x) \\approx x$, so the ratio approaches $1$.'
  },
  {
    id: 'q5',
    question_number: 1,
    question_type: 'frq',
    question_text: 'Let $g$ be a continuous function defined on the interval $[0, 8]$. The function and its derivatives have the properties indicated in the table above. Find all values of $x$ for which $g$ has a relative extremum on the open interval $(0, 8)$. Determine whether $g$ has a relative maximum or minimum at each of these values. Justify your answers.',
    passage: null,
    image_url: null,
    options: [],
    correct_answer: null,
    explanation: null
  },
  {
    id: 'q6',
    question_number: 2,
    question_type: 'frq',
    question_text: 'The rate at which water flows into a tank, in gallons per hour, is given by $R(t) = 200e^{-0.5t}$. The tank initially contains 100 gallons of water. Write, but do not evaluate, an expression involving an integral for the total amount of water in the tank at time $t = 4$ hours.',
    passage: null,
    image_url: null,
    options: [],
    correct_answer: null,
    explanation: null
  }
];

export const EXAM_PHASES = [
  {
    id: 'intro',
    type: 'intro',
    duration: 60
  },
  {
    id: 's1_part_a',
    type: 'section',
    sectionInfo: 'Section I: Multiple Choice, Part A',
    calculatorAllowed: false,
    hasReference: false,
    questionRange: [0, 1],
    duration: 3600
  },
  {
    id: 'break_1',
    type: 'break',
    duration: 60,
    label: 'Break 1 - 1 Minute'
  },
  {
    id: 's1_part_b',
    type: 'section',
    sectionInfo: 'Section I: Multiple Choice, Part B',
    calculatorAllowed: true,
    hasReference: false,
    questionRange: [2, 3],
    duration: 2700
  },
  {
    id: 'break_2',
    type: 'break',
    duration: 180,
    label: 'Break 2 - 3 Minutes'
  },
  {
    id: 's2',
    type: 'section',
    sectionInfo: 'Section II: Free Response',
    calculatorAllowed: true,
    hasReference: true,
    questionRange: [4, 5],
    duration: 5400
  }
];

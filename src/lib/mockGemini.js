const MOCK_GRADING_DATA = {
  q5: {
    score: 7,
    maxScore: 9,
    feedback:
      'The student correctly identified that $g$ has relative extrema where $g\'$ changes sign. The analysis at $x = 2$ (relative maximum) and $x = 6$ (relative minimum) was well-justified using the First Derivative Test. However, the student did not fully address the behavior of $g\'$ at $x = 4$, where $g\'$ is undefined. A complete justification should mention that $g\'$ changes from negative to positive at $x = 6$, confirming the relative minimum. Minor notation issues were noted but did not affect the mathematical validity.',
    rubric: [
      { criterion: 'Identifies critical points where $g\'(x) = 0$ or $g\'(x)$ is undefined', met: true },
      { criterion: 'Correctly identifies relative maximum at $x = 2$', met: true },
      { criterion: 'Justifies maximum using sign change of $g\'$ (positive to negative)', met: true },
      { criterion: 'Correctly identifies relative minimum at $x = 6$', met: true },
      { criterion: 'Justifies minimum using sign change of $g\'$ (negative to positive)', met: true },
      { criterion: 'Addresses behavior at $x = 4$ where $g\'$ is undefined', met: false },
      { criterion: 'Uses First Derivative Test language correctly', met: true },
      { criterion: 'Provides complete justification for each extremum', met: false },
      { criterion: 'Clear and organized presentation', met: true }
    ]
  },
  q6: {
    score: 8,
    maxScore: 9,
    feedback:
      'The student correctly set up the integral expression $100 + \\int_{0}^{4} 200e^{-0.5t}\\,dt$ for the total amount of water in the tank at $t = 4$. The initial condition of 100 gallons was properly incorporated. The integral bounds and integrand are correct. The student lost one point for not explicitly stating that $R(t)$ represents the rate of inflow, which is needed to justify why the integral of $R(t)$ gives the accumulated volume. Overall, a strong response demonstrating solid understanding of the Fundamental Theorem of Calculus in an applied context.',
    rubric: [
      { criterion: 'Identifies initial amount of 100 gallons', met: true },
      { criterion: 'Sets up integral with correct integrand $200e^{-0.5t}$', met: true },
      { criterion: 'Uses correct bounds of integration $[0, 4]$', met: true },
      { criterion: 'Adds initial condition to integral (100 + integral)', met: true },
      { criterion: 'Expression is in correct "write but do not evaluate" form', met: true },
      { criterion: 'Justifies integral as accumulated volume from rate function', met: false },
      { criterion: 'Correct use of integral notation', met: true },
      { criterion: 'Includes units or acknowledges gallon context', met: true },
      { criterion: 'Clear mathematical presentation', met: true }
    ]
  }
};

export function simulateAIGrading(questionId) {
  return new Promise((resolve) => {
    const delay = 1500 + Math.random() * 1500;
    setTimeout(() => {
      const result = MOCK_GRADING_DATA[questionId];
      if (result) {
        resolve(result);
      } else {
        resolve({
          score: Math.floor(Math.random() * 5) + 4,
          maxScore: 9,
          feedback: 'The student demonstrated a reasonable understanding of the core concepts. Some steps could benefit from more detailed justification.',
          rubric: [
            { criterion: 'Problem setup', met: true },
            { criterion: 'Core method applied correctly', met: true },
            { criterion: 'Intermediate calculations', met: true },
            { criterion: 'Final answer', met: false },
            { criterion: 'Justification and reasoning', met: false }
          ]
        });
      }
    }, delay);
  });
}

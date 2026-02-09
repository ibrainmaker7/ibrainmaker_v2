export const MOCK_STUDENTS = [
  {
    id: 'p-001',
    student_name: 'Alice Chen',
    student_email: 'alice.chen@school.edu',
    exam_status: 'submitted',
    mcq_score: 4,
    mcq_total: 4,
    frq_grades: {
      q5: { score: 7, maxScore: 9, status: 'graded' },
      q6: { score: 8, maxScore: 9, status: 'graded' }
    },
    total_score: null,
    grade_status: 'ai_graded',
    frq_submissions: {
      q5: {
        page1: { file_url: 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg?auto=compress&cs=tinysrgb&w=600', file_name: 'frq1_page1.jpg' },
        page2: { file_url: 'https://images.pexels.com/photos/6238120/pexels-photo-6238120.jpeg?auto=compress&cs=tinysrgb&w=600', file_name: 'frq1_page2.jpg' }
      },
      q6: {
        page1: { file_url: 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg?auto=compress&cs=tinysrgb&w=600', file_name: 'frq2_page1.jpg' },
        page2: null
      }
    }
  },
  {
    id: 'p-002',
    student_name: 'Brian Kim',
    student_email: 'brian.kim@school.edu',
    exam_status: 'submitted',
    mcq_score: 3,
    mcq_total: 4,
    frq_grades: {
      q5: { score: 5, maxScore: 9, status: 'graded' },
      q6: { score: 6, maxScore: 9, status: 'graded' }
    },
    total_score: null,
    grade_status: 'ai_graded',
    frq_submissions: {
      q5: {
        page1: { file_url: 'https://images.pexels.com/photos/6238120/pexels-photo-6238120.jpeg?auto=compress&cs=tinysrgb&w=600', file_name: 'frq1_page1.jpg' },
        page2: { file_url: 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg?auto=compress&cs=tinysrgb&w=600', file_name: 'frq1_page2.jpg' }
      },
      q6: {
        page1: { file_url: 'https://images.pexels.com/photos/6238120/pexels-photo-6238120.jpeg?auto=compress&cs=tinysrgb&w=600', file_name: 'frq2_page1.jpg' },
        page2: { file_url: 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg?auto=compress&cs=tinysrgb&w=600', file_name: 'frq2_page2.jpg' }
      }
    }
  },
  {
    id: 'p-003',
    student_name: 'Carol Martinez',
    student_email: 'carol.martinez@school.edu',
    exam_status: 'submitted',
    mcq_score: 2,
    mcq_total: 4,
    frq_grades: {
      q5: { score: null, maxScore: 9, status: 'pending' },
      q6: { score: null, maxScore: 9, status: 'pending' }
    },
    total_score: null,
    grade_status: 'pending',
    frq_submissions: {
      q5: {
        page1: { file_url: 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg?auto=compress&cs=tinysrgb&w=600', file_name: 'frq1_page1.jpg' },
        page2: null
      },
      q6: {
        page1: null,
        page2: null
      }
    }
  },
  {
    id: 'p-004',
    student_name: 'David Lee',
    student_email: 'david.lee@school.edu',
    exam_status: 'in_progress',
    mcq_score: null,
    mcq_total: 4,
    frq_grades: {},
    total_score: null,
    grade_status: 'in_progress',
    frq_submissions: {}
  },
  {
    id: 'p-005',
    student_name: 'Emily Watson',
    student_email: 'emily.watson@school.edu',
    exam_status: 'submitted',
    mcq_score: 4,
    mcq_total: 4,
    frq_grades: {
      q5: { score: 9, maxScore: 9, status: 'confirmed' },
      q6: { score: 9, maxScore: 9, status: 'confirmed' }
    },
    total_score: 22,
    grade_status: 'released',
    frq_submissions: {
      q5: {
        page1: { file_url: 'https://images.pexels.com/photos/6238120/pexels-photo-6238120.jpeg?auto=compress&cs=tinysrgb&w=600', file_name: 'frq1_page1.jpg' },
        page2: { file_url: 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg?auto=compress&cs=tinysrgb&w=600', file_name: 'frq1_page2.jpg' }
      },
      q6: {
        page1: { file_url: 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg?auto=compress&cs=tinysrgb&w=600', file_name: 'frq2_page1.jpg' },
        page2: { file_url: 'https://images.pexels.com/photos/6238120/pexels-photo-6238120.jpeg?auto=compress&cs=tinysrgb&w=600', file_name: 'frq2_page2.jpg' }
      }
    }
  }
];

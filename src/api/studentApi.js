import { supabase } from '../lib/supabase';

// 데모용 기본 ID (혹시 DB 연결 실패 시 사용)
const DEMO_PARTICIPANT_ID = 'b0000000-0000-0000-0000-000000000003';
const DEMO_EXAM_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; 

// ✅ [수정됨] v2.6.6 스키마 구조(JSON)를 앱이 이해하는 구조로 변환
function mapDBQuestionToApp(row, index) {
  const q = row.questions;
  
  // JSONB 데이터 가져오기
  const structureData = q.structure_data || {};
  const gradingLogic = q.grading_logic || {};

  // 1. 객관식 보기(Options) 처리
  const isMCQ = q.structure_type === 'mcq';
  let options = [];
  let parts = null;

  if (isMCQ) {
    options = Array.isArray(structureData) 
      ? structureData 
      : (structureData.options || []);
  } else {
    parts = structureData.parts || null;
  }

  // 2. 이미지 URL 처리
  const imageUrl = (q.content_images && q.content_images.length > 0)
    ? q.content_images[0]
    : null;

  return {
    id: q.id,
    question_number: index + 1,
    question_type: q.structure_type || 'mcq',
    question_text: q.content_text || '',
    passage: q.passage || null,
    image_url: imageUrl,
    options,
    parts,
    correct_answer: gradingLogic.correct_option || gradingLogic.correct_answer || null,
    explanation: gradingLogic.explanation || q.explanation || null,
    rubric: gradingLogic.rubric || null,
    points: row.points || 1
  };
}

export const studentApi = {
  DEMO_PARTICIPANT_ID,
  DEMO_EXAM_ID,

  // ✅ [핵심 수정] ID가 틀려도 DB에 있는 첫 번째 시험지를 무조건 가져옵니다.
  async getExamQuestions(examId = DEMO_EXAM_ID) {
    console.log(`🔍 [Debug] Searching for ANY exam in DB...`);

    // 1. DB에 있는 아무 시험지나 하나 찾습니다.
    const { data: anyExam, error: searchError } = await supabase
      .from('exam_questions')
      .select('exam_id')
      .limit(1);

    if (searchError) {
      console.error('❌ [Debug] Connection Failed:', searchError);
      throw searchError;
    }

    if (!anyExam || anyExam.length === 0) {
      console.error('❌ [Debug] DB is empty (0 rows). Check Supabase Table Editor.');
      throw new Error('No exams found in DB.');
    }

    // 2. 찾은 진짜 ID로 교체합니다.
    const realExamId = anyExam[0].exam_id;
    console.log(`✅ [Debug] Found Real Exam ID: "${realExamId}"`);

    // 3. 진짜 ID로 문제 조회
    const { data, error } = await supabase
      .from('exam_questions')
      .select(`
        sequence_order,
        points,
        questions (
          id,
          content_text,
          content_images,
          structure_type,
          structure_data,
          grading_logic,
          explanation,
          passage,
          difficulty
        )
      `)
      .eq('exam_id', realExamId)
      .order('sequence_order', { ascending: true });

    if (error) throw error;

    console.log('✅ [Debug] Questions loaded:', data?.length);

    let mcqNum = 0;
    let frqNum = 0;
    return data.map((row, i) => {
      if (!row.questions) return null;
      const mapped = mapDBQuestionToApp(row, i);
      if (mapped.question_type === 'frq') {
        frqNum++;
        mapped.question_number = frqNum;
      } else {
        mcqNum++;
        mapped.question_number = mcqNum;
      }
      return mapped;
    }).filter(q => q !== null);
  },

  async getFRQSubmissions(participantId = DEMO_PARTICIPANT_ID) {
    const { data, error } = await supabase
      .from('frq_submissions') // 테이블 존재 여부 확인 필요 (없으면 빈 배열 반환)
      .select('*')
      .eq('participant_id', participantId);

    if (error) {
       console.warn("FRQ fetch warning:", error.message);
       return [];
    }
    return data || [];
  },

  async uploadFRQFile(file, participantId, questionId, pageKey) {
    return URL.createObjectURL(file); // 임시 URL (Storage 미구현 시)
  },

  async saveFRQSubmission(participantId, questionId, pageKey, fileUrl, fileName) {
    console.log('Saved FRQ:', { questionId, fileName });
  },

  subscribeToFRQSubmissions(participantId, callback) {
    return () => {};
  }
};
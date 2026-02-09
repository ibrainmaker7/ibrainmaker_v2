import { supabase } from './supabaseClient';

const DEMO_PARTICIPANT_ID = 'b0000000-0000-0000-0000-000000000003';
const DEMO_EXAM_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

function mapDBQuestionToApp(row, index) {
  const q = row.questions;
  
  // JSONB 데이터 안전하게 가져오기
  const structureData = q.structure_data || {};
  const gradingLogic = q.grading_logic || {};

  // 1. 객관식 보기 처리 (DB는 structure_data 자체가 배열일 수 있음)
  const isMCQ = q.structure_type === 'mcq';
  let options = [];
  let parts = null;

  if (isMCQ) {
    // 배열이면 그대로 쓰고, 아니면 .options를 찾음
    options = Array.isArray(structureData) ? structureData : (structureData.options || []);
  } else {
    // 주관식은 parts 정보 가져오기 (예: ["page1", "page2"])
    parts = structureData.parts || null;
  }

  // 2. 이미지 URL 처리
  const imageUrl = (q.content_images && q.content_images.length > 0)
    ? q.content_images[0]
    : null;

  return {
    id: q.id,
    question_number: index + 1, // (나중에 호출부에서 재설정됨)
    question_type: q.structure_type || 'mcq',
    question_text: q.content_text || '', // DB 컬럼명 매핑
    passage: q.passage || null,
    image_url: imageUrl,
    
    // 매핑된 데이터들
    options,
    parts, 
    
    // 정답 및 해설 매핑 (DB 컬럼명 차이 해결)
    correct_answer: gradingLogic.correct_option || gradingLogic.correct_answer || null,
    explanation: gradingLogic.explanation || q.explanation || null,
    rubric: gradingLogic.rubric || null, // 주관식 채점 기준
    
    points: row.points || 1
  };
}

export const studentApi = {
  DEMO_PARTICIPANT_ID,
  DEMO_EXAM_ID,

  async getExamQuestions(examId = DEMO_EXAM_ID) {
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
      .eq('exam_id', examId)
      .order('sequence_order', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No questions found for this exam');

    // 문제 번호 매기기 로직 (유지)
    let mcqNum = 0;
    let frqNum = 0;
    return data.map((row, i) => {
      const mapped = mapDBQuestionToApp(row, i);
      
      // 번호 체계: FRQ와 MCQ를 따로 카운트
      if (mapped.question_type === 'frq') {
        frqNum++;
        mapped.question_number = frqNum;
      } else {
        mcqNum++;
        mapped.question_number = mcqNum;
      }
      return mapped;
    });
  },

  async getFRQSubmissions(participantId = DEMO_PARTICIPANT_ID) {
    const { data, error } = await supabase
      .from('frq_submissions')
      .select('*')
      .eq('participant_id', participantId);

    if (error) throw error;
    return data || [];
  },

  async uploadFRQFile(file, participantId, questionId, pageKey) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${participantId}/${questionId}/${pageKey}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('frq-uploads')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('frq-uploads')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async saveFRQSubmission(participantId, questionId, pageKey, fileUrl, fileName) {
    const { data, error } = await supabase
      .from('frq_submissions')
      .upsert({
        participant_id: participantId,
        question_id: questionId,
        page_key: pageKey,
        file_url: fileUrl,
        file_name: fileName,
        submitted_by: 'student',
        uploaded_at: new Date().toISOString()
      }, {
        onConflict: 'participant_id,question_id,page_key'
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  subscribeToFRQSubmissions(participantId = DEMO_PARTICIPANT_ID, callback) {
    const channel = supabase
      .channel(`student-frq-${participantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'frq_submissions',
          filter: `participant_id=eq.${participantId}`
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};

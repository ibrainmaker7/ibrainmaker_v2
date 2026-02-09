import { createClient } from '@supabase/supabase-js';

// .env 파일에 있는 설정값을 가져옵니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase 연결 클라이언트 생성 (이게 없어서 에러가 났던 것입니다!)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
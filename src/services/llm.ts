import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface LLMResponse {
  content: string;
  references?: string[];
  documents?: { title: string; url: string }[];
}

export async function generateLegalResponse(query: string): Promise<LLMResponse> {
  try {
    // Call Supabase Edge Function that handles the LLM interaction
    const { data, error } = await supabase.functions.invoke('generate-legal-response', {
      body: { query }
    });

    if (error) throw error;

    return {
      content: data.content,
      references: data.references,
      documents: data.documents
    };
  } catch (error) {
    console.error('Error generating legal response:', error);
    return {
      content: 'I apologize, but I encountered an error processing your request. Please try again.',
      references: [],
      documents: []
    };
  }
}
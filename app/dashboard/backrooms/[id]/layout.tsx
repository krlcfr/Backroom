import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const supabase = await createClient();
  const { data } = await supabase.from('backrooms').select('nombre').eq('id', id).single();

  return {
    title: data?.nombre || 'BackRoom',
  };
}

export default function BackroomLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

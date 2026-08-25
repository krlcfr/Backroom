import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ salaId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const salaId = resolvedParams.salaId;
  const supabase = await createClient();
  const { data } = await supabase.from('salas').select('nombre').eq('id', salaId).single();

  return {
    title: data?.nombre || 'Sala',
  };
}

export default function SalaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

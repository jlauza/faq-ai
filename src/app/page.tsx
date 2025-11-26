import { BrainCircuit } from 'lucide-react';
import { FaqAiClient } from '@/components/FaqAiClient';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
      <div className="flex w-full max-w-3xl flex-col items-center">
        <header className="mb-8 flex items-center gap-4 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <BrainCircuit className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl">
              FAQ-AI
            </h1>
            <p className="text-muted-foreground">Your intelligent question-answering assistant</p>
          </div>
        </header>
        <FaqAiClient />
      </div>
    </main>
  );
}

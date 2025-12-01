import { BrainCircuit } from 'lucide-react';
import { FaqAiClient } from '@/components/FaqAiClient';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
      <div className="flex w-full max-w-3xl flex-col items-center">
        <header className="mb-8 flex flex-col items-center gap-4 text-center">
          <Image
            src="/assets/focused-logo.webp"
            alt="FAQ-AI Logo"
            width={120}
            height={120}
            className="mb-4"
          />
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <BrainCircuit className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl">
                FAQ-AI
              </h1>
              {/* <small className='text-sm text-center text-muted-foreground'>Created by Jayson Lauza</small> */}
              <p className="text-muted-foreground">
                Your intelligent question-answering assistant
              </p>
            </div>
          </div>
        </header>
        <FaqAiClient />
      </div>
    </main>
  );
}

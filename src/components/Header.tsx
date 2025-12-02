'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { BrainCircuit } from 'lucide-react';
import logoDark from '../public/assets/focused-logo.webp';
import logoLight from '../public/assets/focused-logo.png';
import { useEffect, useState } from 'react';

export function Header() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = theme === 'light' ? logoLight : logoDark;

  if (!mounted) {
    return (
        <header className="mb-8 flex flex-col items-center gap-4 text-center">
             <div style={{width: 120, height: 120}} />
             <div className="flex items-center gap-4">
               <div className="rounded-full bg-primary/10 p-3 hidden">
                 <BrainCircuit className="h-10 w-10 text-primary" />
               </div>
               <div>
                 <h3 className="font-headline font-bold tracking-tighter text-foreground sm:text-4xl text-3xl">
                   AI Powered FAQ
                 </h3>
                 <p className="text-muted-foreground">
                   Your intelligent question-answering assistant
                 </p>
               </div>
             </div>
           </header>
    )
  }

  return (
    <header className="mb-8 flex flex-col items-center gap-4 text-center">
      <Image
        src={logoSrc}
        alt="FAQ-AI Logo"
        width={120}
        height={120}
        className="mb-4"
        priority
      />
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-primary/10 p-3 hidden">
          <BrainCircuit className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h3 className="font-headline font-bold tracking-tighter text-foreground sm:text-4xl text-3xl">
            AI Powered FAQ
          </h3>
          <p className="text-muted-foreground">
            Your intelligent question-answering assistant
          </p>
        </div>
      </div>
    </header>
  );
}

import { BrainCircuit } from 'lucide-react';
import { FaqAiClient } from '@/components/FaqAiClient';
import Image from 'next/image';
import logo from "../public/assets/focused-logo.webp";
import { FaqList } from '@/components/FaqList';
import { fetchFaqs, Faq } from '@/lib/firebase/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Home() {
  const faqs: Faq[] = await fetchFaqs();

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
      <div className="flex w-full max-w-3xl flex-col items-center">
        <header className="mb-8 flex flex-col items-center gap-4 text-center">
          <Image
            src={logo}
            alt="FAQ-AI Logo"
            width={120}
            height={120}
            className="mb-4"
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
        <FaqAiClient />

        <Card className="w-full shadow-lg border-primary/20 mt-8">
            <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                    Browse the most frequently asked questions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <FaqList faqs={faqs} />
            </CardContent>
        </Card>
      </div>
    </main>
  );
}


import { FaqList } from '@/components/FaqList';
import { fetchFaqs, Faq } from '@/lib/firebase/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from '@/components/ThemeToggle';
import { Header } from '@/components/Header';
import { FaqAiClient } from '@/components/FaqAiClient';


export default async function Home() {
  const faqs: Faq[] = (await fetchFaqs()).slice(0, 5);

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
       <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
      <div className="flex w-full max-w-3xl flex-col items-center">
        <Header />
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

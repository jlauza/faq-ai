
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
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';


export default async function Home() {
  const faqs: Faq[] = await fetchFaqs();

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
       <div className="absolute top-4 right-4 flex items-center gap-2">
          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
          {/* Mobile Menu */}
          <div className="sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-8">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Toggle Theme</span>
                    <ThemeToggle />
                  </div>
                  <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
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
                <FaqList faqs={faqs.slice(0, 6)} />
            </CardContent>
        </Card>
      </div>
    </main>
  );
}

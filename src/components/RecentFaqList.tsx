
import type { QuestionState } from '@/app/actions';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FaqItem } from './FaqItem';
import { Faq } from '@/lib/firebase/utils';

interface RecentFaqListProps {
  faqs: QuestionState[];
}

export function RecentFaqList({ faqs }: RecentFaqListProps) {
  if (!faqs || faqs.length === 0) {
    return <p className="text-muted-foreground">No recent questions yet.</p>;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq) => (
        <AccordionItem value={faq.id!} key={faq.id!}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>
            {faq.id ? (
                <FaqItem faq={{
                    id: faq.id,
                    question: faq.question || "",
                    answer: faq.answer || "",
                    likes: faq.likes || 0,
                    dislikes: faq.dislikes || 0
                } as Faq} />
            ) : (
                 <div>
                    <p className="font-semibold">Answer:</p>
                    <p className="whitespace-pre-wrap">
                        {faq.answer}
                    </p>
                </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

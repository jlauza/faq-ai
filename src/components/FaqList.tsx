
import type { Faq } from '@/lib/firebase/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FaqItem } from './FaqItem';

interface FaqListProps {
  faqs: Faq[];
}

export function FaqList({ faqs }: FaqListProps) {
  if (!faqs || faqs.length === 0) {
    return <p className="text-muted-foreground">No FAQs found.</p>;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq) => (
        <AccordionItem value={faq.id} key={faq.id}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>
            <FaqItem faq={faq} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

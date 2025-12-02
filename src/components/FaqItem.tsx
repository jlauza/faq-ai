
'use client';

import React, { useOptimistic, startTransition, useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateVote } from '@/app/actions';
import type { Faq } from '@/lib/firebase/utils';
import { Separator } from './ui/separator';

interface FaqItemProps {
  faq: Faq;
  isAiAnswer?: boolean;
}

export function FaqItem({ faq, isAiAnswer = false }: FaqItemProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<'like' | 'dislike' | null>(null);

  const [optimisticFaq, setOptimisticFaq] = useOptimistic(
    faq,
    (state: Faq, vote: { type: 'like' | 'dislike' }) => {
      if (vote.type === 'like') {
        return { ...state, likes: (state.likes ?? 0) + 1 };
      } else {
        return { ...state, dislikes: (state.dislikes ?? 0) + 1 };
      }
    }
  );

  const handleVote = async (type: 'like' | 'dislike') => {
    if (!faq.id || feedbackGiven) return;

    setFeedbackGiven(type);

    startTransition(() => {
      setOptimisticFaq({ type });
    });

    await updateVote(faq.id, type);
  };

  return (
    <div className="space-y-4">
       <div className='text-left'>
        {!isAiAnswer && <p className="whitespace-pre-wrap">{optimisticFaq.answer}</p>}
        {isAiAnswer && (
             <div>
                <p className="font-semibold">Answer:</p>
                <p className="whitespace-pre-wrap">
                    {optimisticFaq.answer}
                </p>
            </div>
        )}
       </div>


      <Separator />

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium">Was this answer helpful?</p>
        <div className="flex items-center gap-2">
          <Button
            variant={feedbackGiven === 'like' ? 'default' : 'outline'}
            size="icon"
            onClick={() => handleVote('like')}
            disabled={feedbackGiven !== null}
            aria-label="Like"
          >
            <ThumbsUp className="h-5 w-5" />
          </Button>
          {!isAiAnswer && (
            <span className="text-sm font-medium tabular-nums min-w-[1rem]">
              {optimisticFaq.likes}
            </span>
          )}

          <Button
            variant={feedbackGiven === 'dislike' ? 'destructive' : 'outline'}
            size="icon"
            onClick={() => handleVote('dislike')}
            disabled={feedbackGiven !== null}
            aria-label="Dislike"
          >
            <ThumbsDown className="h-5 w-5" />
          </Button>
          {!isAiAnswer && (
            <span className="text-sm font-medium tabular-nums min-w-[1rem]">
              {optimisticFaq.dislikes}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

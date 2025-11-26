"use client";

import { useFormStatus } from 'react-dom';
import React, { useActionState, useEffect, useState, useRef } from 'react';
import { submitQuestion, type QuestionState, submitFeedback, type FeedbackState } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, ThumbsDown, ThumbsUp, Bot, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function QuestionSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Ask Question
        </>
      )}
    </Button>
  );
}

function FeedbackSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Improve Answer
                </>
            )}
        </Button>
    );
}


export function FaqAiClient() {
  const [questionState, questionAction] = useActionState(submitQuestion, {});
  const [currentQa, setCurrentQa] = useState<{ question: string; answer: string } | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<'good' | 'bad' | null>(null);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [feedbackState, feedbackAction] = useActionState(submitFeedback, {});

  useEffect(() => {
    if (questionState.answer && questionState.question) {
      setCurrentQa({ question: questionState.question, answer: questionState.answer });
      setFeedbackGiven(null);
      formRef.current?.reset();
    }
  }, [questionState]);
  
  useEffect(() => {
    if (feedbackState.improvedAnswer && currentQa) {
        setCurrentQa({ ...currentQa, answer: feedbackState.improvedAnswer });
        setIsFeedbackDialogOpen(false);
        setFeedbackGiven('good'); // After improving, we can consider it "good" for now
    }
  }, [feedbackState, currentQa]);


  const handleBadFeedback = () => {
    setFeedbackGiven('bad');
    setIsFeedbackDialogOpen(true);
  };
  
  const handleGoodFeedback = () => {
      setFeedbackGiven('good');
  }

  return (
    <div className="w-full space-y-8">
      <Card className="w-full shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Bot className="h-6 w-6 text-primary" />
            Ask a new question
          </CardTitle>
          <CardDescription>
            Enter your question below and our AI will generate an answer for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={questionAction} className="space-y-4">
            <Textarea
              name="question"
              placeholder="e.g., How does the retrieval tool work with the AI model?"
              className="min-h-[100px] text-base"
              required
            />
            {questionState.error && (
              <Alert variant="destructive">
                <AlertDescription>{questionState.error}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end">
              <QuestionSubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>

      {currentQa && (
        <Card className="w-full animate-in fade-in-50 duration-500 shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="font-headline">AI Generated Answer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-base">
            <div className="space-y-2">
                <p className="font-semibold text-primary">Your Question:</p>
                <p className="text-muted-foreground">{currentQa.question}</p>
            </div>
            <Separator />
            <div className="space-y-4">
                <p className="font-semibold text-primary">Answer:</p>
                <p className="leading-relaxed whitespace-pre-wrap">{currentQa.answer}</p>
            </div>
            <Separator />
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-muted/50 p-4 sm:flex-row">
                <p className="text-sm font-medium">Was this answer helpful?</p>
                <div className="flex gap-2">
                    <Button
                        variant={feedbackGiven === 'good' ? 'default' : 'outline'}
                        size="icon"
                        onClick={handleGoodFeedback}
                        aria-label="Good answer"
                    >
                        <ThumbsUp className="h-5 w-5" />
                    </Button>
                    <Button
                        variant={feedbackGiven === 'bad' ? 'destructive' : 'outline'}
                        size="icon"
                        onClick={handleBadFeedback}
                        aria-label="Bad answer"
                    >
                        <ThumbsDown className="h-5 w-5" />
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentQa && (
        <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Provide Feedback</DialogTitle>
                    <DialogDescription>
                        Your feedback helps us improve. Please tell us what was wrong with the answer.
                    </DialogDescription>
                </DialogHeader>
                <form action={feedbackAction} className="space-y-4">
                    <input type="hidden" name="question" value={currentQa.question} />
                    <input type="hidden" name="originalAnswer" value={currentQa.answer} />
                    <Textarea 
                        name="feedback"
                        placeholder="e.g., The answer was not detailed enough about..."
                        className="min-h-[100px]"
                        required
                    />
                    {feedbackState.error && (
                        <Alert variant="destructive">
                            <AlertDescription>{feedbackState.error}</AlertDescription>
                        </Alert>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setIsFeedbackDialogOpen(false)}>Cancel</Button>
                        <FeedbackSubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


"use client";

import React, { useActionState, useEffect, useRef, useState, useOptimistic, startTransition } from "react";
import { useFormStatus } from "react-dom";
import { submitQuestion, submitFeedback, updateVote } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Send,
  ThumbsDown,
  ThumbsUp,
  Bot,
  Sparkles,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ---------------- Question and Answer Type ---------------- */
interface QA {
  question: string;
  answer: string;
  id?: string;
  likes?: number;
  dislikes?: number;
}

/* ---------------- Buttons ---------------- */

function QuestionSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
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

/* ---------------- Main Component ---------------- */

export function FaqAiClient() {
  const [questionState, questionAction] = useActionState(submitQuestion, {
    question: undefined,
    answer: undefined,
    id: undefined,
    likes: undefined,
    dislikes: undefined,
    error: undefined,
  });
  const [feedbackState, feedbackAction] = useActionState(submitFeedback, {
    improvedAnswer: undefined,
    error: undefined,
  });

  const [currentQa, setCurrentQa] = useState<QA | null>(null);
  
  const [optimisticQa, setOptimisticQa] = useOptimistic(
    currentQa,
    (state: QA | null, vote: { type: 'like' | 'dislike' }) => {
      if (!state) return null;
      if (vote.type === 'like') {
        return { ...state, likes: (state.likes ?? 0) + 1 };
      } else {
        return { ...state, dislikes: (state.dislikes ?? 0) + 1 };
      }
    }
  );


  const [feedbackGiven, setFeedbackGiven] =
    useState<"good" | "bad" | null>(null);

  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  /* ---- Handle Server Answer ---- */
  useEffect(() => {
    if (questionState?.question && questionState?.answer) {
      const newQa: QA = {
        question: questionState.question,
        answer: questionState.answer,
        id: questionState.id,
        likes: questionState.likes,
        dislikes: questionState.dislikes,
      };
      setCurrentQa(newQa);
      setFeedbackGiven(null);
      formRef.current?.reset();
    }
  }, [questionState]);

  /* ---- Handle Feedback Improvement ---- */
  useEffect(() => {
    if (feedbackState?.improvedAnswer && currentQa) {
      setCurrentQa({
        ...currentQa,
        answer: feedbackState.improvedAnswer,
      });
      setIsFeedbackDialogOpen(false);
      setFeedbackGiven("good");
    }
  }, [feedbackState, currentQa]);

  const handleVote = async (type: 'like' | 'dislike') => {
    if (!currentQa || !currentQa.id || feedbackGiven) return;

    // Optimistically update UI
    startTransition(() => {
      setOptimisticQa({ type });
    });

    if (type === 'like') {
      setFeedbackGiven('good');
    } else {
      setFeedbackGiven('bad');
      setIsFeedbackDialogOpen(true);
    }
    
    // Call server action to update the database
    await updateVote(currentQa.id, type);
  }

  const displayQa = optimisticQa || currentQa;

  return (
    <div className="w-full space-y-8">
      {/* QUESTION INPUT */}
      <Card className="w-full shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Ask a new question
          </CardTitle>
          <CardDescription>
            Enter your Focused.com related question and our AI will generate an answer for you.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form ref={formRef} action={questionAction} className="space-y-4">
            <Textarea
              name="question"
              placeholder="e.g. How do I improve the accuracy of my AI model?"
              className="min-h-[100px]"
              required
            />

            {questionState?.error && (
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

      {/* ANSWER */}
      {displayQa && (
        <Card className="w-full shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle>AI Generated Answer</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <p className="font-semibold">Your Question:</p>
              <p className="text-muted-foreground">
                {displayQa.question}
              </p>
            </div>

            <Separator />

            <div>
              <p className="font-semibold">Answer:</p>
              <p className="whitespace-pre-wrap">
                {displayQa.answer}
              </p>
            </div>

            <Separator />

            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <p className="text-sm font-medium">
                Was this answer helpful?
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant={feedbackGiven === "good" ? "default" : "outline"}
                  size="icon"
                  onClick={() => handleVote('like')}
                  disabled={feedbackGiven !== null}
                >
                  <ThumbsUp className="h-5 w-5" />
                </Button>
                {displayQa.likes !== undefined && <span className="text-sm font-medium tabular-nums">{displayQa.likes}</span>}

                <Button
                  variant={
                    feedbackGiven === "bad" ? "destructive" : "outline"
                  }
                  size="icon"
                  onClick={() => handleVote('dislike')}
                  disabled={feedbackGiven !== null}
                >
                  <ThumbsDown className="h-5 w-5" />
                </Button>
                {displayQa.dislikes !== undefined && <span className="text-sm font-medium tabular-nums">{displayQa.dislikes}</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FEEDBACK DIALOG */}
      {currentQa && (
        <Dialog
          open={isFeedbackDialogOpen}
          onOpenChange={setIsFeedbackDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Provide Feedback</DialogTitle>
              <DialogDescription>
                Tell us what went wrong so we can improve the answer.
              </DialogDescription>
            </DialogHeader>

            <form action={feedbackAction} className="space-y-4">
              <input
                type="hidden"
                name="question"
                value={currentQa.question}
              />
              <input
                type="hidden"
                name="originalAnswer"
                value={currentQa.answer}
              />

              <Textarea
                name="feedback"
                placeholder="What was wrong?"
                required
              />

              {feedbackState?.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {feedbackState.error}
                  </AlertDescription>
              </Alert>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsFeedbackDialogOpen(false)}
                >
                  Cancel
                </Button>
                <FeedbackSubmitButton />
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

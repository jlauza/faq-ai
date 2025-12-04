
"use client";

import React, { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitQuestion, QuestionState } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  Send,
  Bot,
  Info,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FaqItem } from "./FaqItem";


/* ---------------- Buttons ---------------- */

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

/* ---------------- Main Component ---------------- */

const initialState: QuestionState = {
  status: 'idle',
  question: undefined,
  answer: undefined,
  id: undefined,
  likes: undefined,
  dislikes: undefined,
  message: undefined,
};

export function FaqAiClient() {
  const [questionState, questionAction] = useActionState(submitQuestion, initialState);

  const [showAnswer, setShowAnswer] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Show the answer card if the submission was successful
    if (questionState?.status === 'success' && questionState.answer) {
      setShowAnswer(true);
      formRef.current?.reset();
    } else {
      // Hide the answer card for any other status (e.g., error, not_found, or new question)
      setShowAnswer(false);
    }
  }, [questionState]);


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

            {questionState?.status === 'error' && questionState.message && (
              <Alert variant="destructive">
                <AlertDescription>{questionState.message}</AlertDescription>
              </Alert>
            )}
            
            {questionState?.status === 'not_found' && questionState.message && (
              <Alert variant="default" className="bg-accent/50">
                 <Info className="h-4 w-4" />
                <AlertTitle>Not Found</AlertTitle>
                <AlertDescription>{questionState.message}</AlertDescription>
              </Alert>
            )}


            <div className="flex justify-end">
              <QuestionSubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ANSWER */}
      {showAnswer && questionState.answer && (
        <Card className="w-full shadow-lg border-primary/20 animate-in fade-in-50">
          <CardHeader>
            <CardTitle>AI Generated Answer</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <p className="font-semibold">Your Question:</p>
              <p className="text-muted-foreground">
                {questionState.question}
              </p>
            </div>

            <Separator />

            {questionState.id ? (
                 <FaqItem key={questionState.id} faq={{
                    id: questionState.id,
                    question: questionState.question || "",
                    answer: questionState.answer,
                    likes: questionState.likes || 0,
                    dislikes: questionState.dislikes || 0
                }} isAiAnswer={true} />
            ) : (
                 <div>
                    <p className="font-semibold">Answer:</p>
                    <p className="whitespace-pre-wrap">
                        {questionState.answer}
                    </p>
                </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Test, TestResult } from "@/types/test-types";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import { toast } from "@/hooks/use-toast";

interface RegularTestProps {
  test: Test;
  onSaveResult: (result: Omit<TestResult, "id">) => Promise<TestResult | null>;
  onClose: () => void;
}

const RegularTest: React.FC<RegularTestProps> = ({ test, onSaveResult, onClose }) => {
  const { user } = useSimpleAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState(test.timeLimit * 60); // в секундах

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowConfirmDialog(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Подсчитываем правильные ответы
    let correctAnswers = 0;
    test.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = correctAnswers;
    const maxScore = test.questions.length;
    const percentage = (score / maxScore) * 100;
    const passed = percentage >= test.passingScore;

    const result: Omit<TestResult, "id"> = {
      testId: test.id,
      userId: user.id,
      score: score,
      maxScore: maxScore,
      passedAt: new Date().toISOString(),
      passed: passed,
      answers: answers
    };

    const savedResult = await onSaveResult(result);

    if (savedResult) {
      toast({
        title: passed ? "Тест пройден!" : "Тест не пройден",
        description: `Ваш результат: ${score}/${maxScore} (${percentage.toFixed(1)}%)`,
        variant: passed ? "default" : "destructive"
      });
    }

    setShowConfirmDialog(false);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentQuestion + 1) / test.questions.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{test.title}</h2>
          <p className="text-muted-foreground">{test.description}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Время:</p>
          <p className={`text-lg font-mono ${timeLeft < 300 ? 'text-red-500' : ''}`}>
            {formatTime(timeLeft)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Вопрос {currentQuestion + 1} из {test.questions.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {progress.toFixed(0)}% завершено
          </span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Вопрос {currentQuestion + 1}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">{test.questions[currentQuestion].text}</p>
          
          <div className="grid gap-3">
            {test.questions[currentQuestion].options.map((option, index) => (
              <Button
                key={index}
                variant={answers[currentQuestion] === index ? "default" : "outline"}
                className="text-left h-auto p-4 justify-start"
                onClick={() => handleAnswer(index)}
              >
                <span className="mr-3 font-mono">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
        >
          Назад
        </Button>
        
        <div className="space-x-2">
          <Button variant="outline" onClick={onClose}>
            Выйти из теста
          </Button>
          
          {currentQuestion === test.questions.length - 1 ? (
            <Button 
              onClick={() => setShowConfirmDialog(true)}
              disabled={answers[currentQuestion] === undefined}
            >
              Завершить тест
            </Button>
          ) : (
            <Button 
              onClick={nextQuestion}
              disabled={answers[currentQuestion] === undefined}
            >
              Далее
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Завершить тест?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы ответили на {answers.filter(a => a !== undefined).length} из {test.questions.length} вопросов.
              После завершения вы не сможете изменить ответы.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Продолжить тест</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Завершить тест
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RegularTest;

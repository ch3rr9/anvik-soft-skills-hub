
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { MOCK_TESTS, MOCK_TEST_RESULTS } from "@/data/mockTests";
import { Test, TestResult } from "@/types/test-types";

const TestCard = ({ test, onStart }: { test: Test; onStart: (test: Test) => void }) => {
  const { hasPermission } = useAuth();
  const isAccessible = hasPermission(test.availableRoles as any[]);

  return (
    <Card className={`${!isAccessible ? "opacity-70" : ""}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{test.title}</CardTitle>
          <Badge variant="outline" className="bg-anvik-light text-anvik-dark">
            {test.category}
          </Badge>
        </div>
        <CardDescription>{test.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Проходной балл: {test.passingScore}%</span>
          <span>Время: {test.timeLimit} мин</span>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Вопросов: {test.questions.length}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onStart(test)} 
          disabled={!isAccessible} 
          className="w-full"
        >
          {isAccessible ? "Начать тест" : "Нет доступа"}
        </Button>
      </CardFooter>
    </Card>
  );
};

const ResultCard = ({ result }: { result: TestResult & { testTitle: string } }) => {
  const scorePercent = Math.round((result.score / result.maxScore) * 100);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{result.testTitle}</CardTitle>
          <Badge variant={result.passed ? "default" : "destructive"}>
            {result.passed ? "Пройден" : "Не пройден"}
          </Badge>
        </div>
        <CardDescription>
          Пройден: {new Date(result.passedAt).toLocaleDateString('ru-RU')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Результат: {result.score} из {result.maxScore}</span>
            <span>{scorePercent}%</span>
          </div>
          <Progress 
            value={scorePercent} 
            className={`h-2 ${result.passed ? "bg-muted" : "bg-destructive/20"}`} 
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => toast({ title: "В разработке", description: "Просмотр деталей результатов в разработке" })}>
          Подробнее
        </Button>
      </CardFooter>
    </Card>
  );
};

const TestDialog = ({ 
  test, 
  open, 
  onClose 
}: { 
  test: Test | null; 
  open: boolean; 
  onClose: () => void;
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    percentage: number;
  } | null>(null);
  
  const { user } = useAuth();
  
  // Обработка ответа
  const handleAnswer = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };
  
  // Переход к следующему вопросу
  const handleNext = () => {
    if (selectedOption === null) return;
    
    // Сохраняем ответ
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedOption;
    setAnswers(newAnswers);
    
    // Если есть еще вопросы, переходим к следующему
    if (currentQuestion < (test?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      // Если вопросы закончились, завершаем тест
      finishTest(newAnswers);
    }
  };
  
  // Завершение теста
  const finishTest = (finalAnswers: number[]) => {
    if (!test) return;
    
    // Подсчет результатов
    let correctCount = 0;
    finalAnswers.forEach((answer, index) => {
      if (answer === test.questions[index].correctAnswer) {
        correctCount++;
      }
    });
    
    const percentage = Math.round((correctCount / test.questions.length) * 100);
    const passed = percentage >= test.passingScore;
    
    setResult({
      score: correctCount,
      passed,
      percentage
    });
    
    setIsCompleted(true);
    
    // Уведомление о результате
    toast({
      title: passed ? "Тест пройден успешно!" : "Тест не пройден",
      description: `Ваш результат: ${correctCount} из ${test.questions.length} (${percentage}%)`,
      variant: passed ? "default" : "destructive"
    });
  };
  
  // Закрытие диалогового окна и сброс состояния
  const handleClose = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedOption(null);
    setIsCompleted(false);
    setResult(null);
    onClose();
  };
  
  if (!test) return null;
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        {!isCompleted ? (
          <>
            <DialogHeader>
              <DialogTitle>{test.title}</DialogTitle>
              <DialogDescription>
                Вопрос {currentQuestion + 1} из {test.questions.length}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="mb-4">
                <Progress 
                  value={((currentQuestion + 1) / test.questions.length) * 100} 
                  className="h-2"
                />
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">
                  {test.questions[currentQuestion].text}
                </h3>
                
                <RadioGroup
                  value={selectedOption?.toString()}
                  onValueChange={(value) => handleAnswer(parseInt(value))}
                  className="space-y-3"
                >
                  {test.questions[currentQuestion].options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 rounded-md border p-3">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Прервать тест
              </Button>
              <Button
                type="button"
                disabled={selectedOption === null}
                onClick={handleNext}
              >
                {currentQuestion < test.questions.length - 1
                  ? "Следующий вопрос"
                  : "Завершить тест"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Результаты теста</DialogTitle>
              <DialogDescription>
                {test.title}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">
                  {result?.percentage}%
                </div>
                <p className="text-lg">
                  {result?.score} из {test.questions.length} правильных ответов
                </p>
              </div>
              
              <div className="rounded-lg bg-muted p-4">
                <p className="font-medium text-center">
                  {result?.passed
                    ? "Поздравляем! Тест успешно пройден."
                    : "К сожалению, тест не пройден. Попробуйте еще раз позже."}
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Закрыть
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const CreateTestDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Создать новый тест</DialogTitle>
          <DialogDescription>
            Заполните форму для создания нового теста навыков
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-center text-muted-foreground">
            Функционал создания тестов находится в разработке
          </p>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Tests = () => {
  const { user } = useAuth();
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Получаем доступные тесты для пользователя
  const availableTests = MOCK_TESTS.filter((test) => 
    test.availableRoles.includes(user?.role || "")
  );
  
  // Получаем результаты тестов пользователя
  const userResults = MOCK_TEST_RESULTS
    .filter(result => result.userId === user?.id)
    .map(result => {
      const test = MOCK_TESTS.find(t => t.id === result.testId);
      return {
        ...result,
        testTitle: test?.title || "Неизвестный тест"
      };
    });
  
  // Запуск теста
  const handleStartTest = (test: Test) => {
    setActiveTest(test);
    setTestDialogOpen(true);
  };
  
  // Кнопка создания теста (только для менеджера и директора)
  const showCreateButton = user?.role === "manager" || user?.role === "director";
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Тесты навыков</h1>
        {showCreateButton && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            Создать тест
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="available">
        <TabsList className="mb-4">
          <TabsTrigger value="available">Доступные тесты</TabsTrigger>
          <TabsTrigger value="completed">Пройденные тесты</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available">
          {availableTests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableTests.map((test) => (
                <TestCard key={test.id} test={test} onStart={handleStartTest} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">На данный момент нет доступных тестов</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {userResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userResults.map((result) => (
                <ResultCard key={result.id} result={result} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Вы еще не проходили тесты</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <TestDialog 
        test={activeTest} 
        open={testDialogOpen} 
        onClose={() => setTestDialogOpen(false)} 
      />
      
      <CreateTestDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </div>
  );
};

export default Tests;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Clock, CheckCircle2, Settings } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Test, TestResult } from "@/types/test-types";
import { PSYCH_TEST, analyzePsychTestResults } from "@/data/psychTest";
import { COMPUTER_TEST } from "@/data/computerTest";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { sendTestResultToDirector } from "@/utils/pdfUtils";
import RegularTest from "@/components/tests/RegularTest";

// Компонент для отображения списка тестов
const TestsList: React.FC<{
  tests: Test[];
  testResults: TestResult[];
  availableRoles: string[];
  onStartTest: (test: Test) => void;
}> = ({ tests, testResults, availableRoles, onStartTest }) => {
  const { user } = useSimpleAuth();
  
  // Фильтрация тестов по ролям пользователя
  const filteredTests = tests.filter(test => 
    test.availableRoles.includes("all") || 
    (user && test.availableRoles.includes(user.role))
  );
  
  return (
    <div className="space-y-4">
      {filteredTests.map(test => {
        const testResult = testResults.find(result => result.testId === test.id);
        
        return (
          <Card key={test.id}>
            <CardHeader>
              <CardTitle>{test.title}</CardTitle>
              <CardDescription>{test.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{test.category}</p>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {test.timeLimit} минут
                </span>
              </div>
              {testResult ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">
                    Пройден {new Date(testResult.passedAt).toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-500">Не пройден</span>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => onStartTest(test)}
                disabled={testResult?.passed}
              >
                {testResult?.passed ? "Пройден" : "Начать тест"}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

// Компонент для прохождения психологического теста
const PsychTest: React.FC<{
  test: Test;
  onSaveResult: (result: Omit<TestResult, "id">) => Promise<TestResult | null>;
}> = ({ test, onSaveResult }) => {
  const { user } = useSimpleAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
    
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsDialogOpen(true);
    }
  };
  
  const handleSubmit = async () => {
    if (!user) return;
    
    const { needsVacation, recommendation } = analyzePsychTestResults(answers);
    
    const score = answers.reduce((acc, answer) => acc + answer, 0);
    const maxScore = test.questions.length * 3; // Максимальный балл, если каждый ответ "плохой"
    const percentageScore = (score / maxScore) * 100;
    
    const result: Omit<TestResult, "id"> = {
      testId: test.id,
      userId: user.id,
      score: percentageScore,
      maxScore: 100,
      passedAt: new Date().toISOString(),
      passed: !needsVacation,
      answers: answers
    };
    
    const savedResult = await onSaveResult(result);
    
    if (savedResult) {
      toast({
        title: "Результаты теста",
        description: recommendation,
        variant: needsVacation ? "destructive" : "default"
      });
    }
    
    setIsDialogOpen(false);
    setCurrentQuestion(0);
    setAnswers([]);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{test.title}</h2>
      <p className="text-muted-foreground">{test.description}</p>
      
      <Separator />
      
      <div className="space-y-4">
        <p className="font-medium">
          Вопрос {currentQuestion + 1} из {test.questions.length}
        </p>
        <p>{test.questions[currentQuestion].text}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {test.questions[currentQuestion].options.map((option, index) => (
            <Button 
              key={index} 
              variant="outline"
              onClick={() => handleAnswer(index)}
              className={answers[currentQuestion] === index ? "bg-secondary hover:bg-secondary/80" : ""}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
      
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Завершить тест?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите завершить тест? Ваши ответы будут сохранены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Подтвердить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Компонент для отображения результатов психологического теста
const PsychTestResults: React.FC<{ testResults: TestResult[] }> = ({ testResults }) => {
  const psychTestResults = testResults.filter(result => result.testId === PSYCH_TEST.id);
  
  if (psychTestResults.length === 0) {
    return <p>Нет результатов для психологического теста.</p>;
  }
  
  const latestResult = psychTestResults.reduce((prev, current) => 
    (new Date(prev.passedAt) > new Date(current.passedAt)) ? prev : current
  );
  
  const { needsVacation, recommendation } = analyzePsychTestResults(latestResult.answers);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Результаты психологического теста</h3>
      <p className="text-muted-foreground">
        Последний результат: {new Date(latestResult.passedAt).toLocaleDateString()}
      </p>
      <p className={needsVacation ? "text-red-500" : "text-green-500"}>
        Рекомендация: {recommendation}
      </p>
    </div>
  );
};

const Tests = () => {
  const { user } = useSimpleAuth();
  const [activeTab, setActiveTab] = useState<string>("available");
  const [tests, setTests] = useState<Test[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  
  useEffect(() => {
    const fetchTestsData = async () => {
      setLoading(true);
      try {
        // Загрузка тестов
        const { data: testsData, error: testsError } = await supabase
          .from('tests')
          .select('*');
          
        if (testsError) {
          throw testsError;
        }
        
        // Преобразование данных из базы в наш формат Test
        const mappedTests: Test[] = testsData?.map(test => ({
          id: test.id,
          title: test.title,
          description: test.description,
          category: test.category,
          questions: test.questions as any,
          timeLimit: test.time_limit,
          passingScore: test.passing_score,
          availableRoles: test.available_roles as string[],
          createdBy: test.created_by || '',
          createdAt: test.created_at || new Date().toISOString()
        })) || [];
        
        // Добавление психологического теста к списку с правильными полями
        const psychTest: Test = {
          ...PSYCH_TEST,
          createdBy: 'system',
          createdAt: new Date().toISOString()
        };
        
        // Добавляем также тест на знание ПК из данных
        const allTests = [...mappedTests, psychTest];
        setTests(allTests);
        
        if (user) {
          // Загрузка результатов тестов для текущего пользователя
          const { data: resultsData, error: resultsError } = await supabase
            .from('test_results')
            .select('*')
            .eq('user_id', user.id);
            
          if (resultsError) {
            throw resultsError;
          }
          
          // Преобразование данных из базы в наш формат TestResult
          const mappedResults: TestResult[] = resultsData?.map(result => ({
            id: result.id,
            testId: result.test_id,
            userId: result.user_id,
            score: result.score,
            maxScore: result.max_score,
            passedAt: result.passed_at,
            passed: result.passed,
            answers: result.answers as number[],
            recommendation: result.recommendation,
            needsVacation: result.needs_vacation
          })) || [];
          
          setTestResults(mappedResults);
        }
      } catch (error) {
        console.error('Error fetching tests data:', error);
        toast({
          title: "Ошибка загрузки данных",
          description: "Не удалось загрузить тесты и результаты",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTestsData();
  }, [user]);
  
  // Сохранение результата теста
  const saveTestResult = async (result: Omit<TestResult, "id">): Promise<TestResult | null> => {
    try {
      console.log('Сохранение результата теста:', result);
      
      if (!user) {
        console.error('Пользователь не авторизован');
        toast({
          title: "Ошибка авторизации",
          description: "Необходимо войти в систему для сохранения результатов",
          variant: "destructive"
        });
        return null;
      }

      // Для психологического теста используем специальную логику
      if (result.testId === PSYCH_TEST.id) {
        const { needsVacation, recommendation } = analyzePsychTestResults(result.answers);
        
        const supabaseResult = {
          test_id: result.testId,
          user_id: user.id.toString(), // Убеждаемся, что user_id - строка
          score: result.score,
          max_score: result.maxScore,
          passed_at: result.passedAt,
          passed: result.passed,
          answers: result.answers as Json,
          recommendation: recommendation,
          needs_vacation: needsVacation
        };
        
        console.log('Данные для сохранения психо-теста:', supabaseResult);
        
        const { data, error } = await supabase
          .from('test_results')
          .insert([supabaseResult])
          .select();
          
        if (error) {
          console.error('Ошибка при сохранении результата психо-теста:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.error('Данные не были сохранены');
          return null;
        }
        
        const savedResult: TestResult = {
          id: data[0].id,
          testId: data[0].test_id,
          userId: data[0].user_id,
          score: data[0].score,
          maxScore: data[0].max_score,
          passedAt: data[0].passed_at,
          passed: data[0].passed,
          answers: data[0].answers as number[],
          recommendation: data[0].recommendation,
          needsVacation: data[0].needs_vacation
        };
        
        setTestResults(prevResults => [...prevResults, savedResult]);
        console.log('Результат психо-теста успешно сохранен:', savedResult);
        return savedResult;
      } else {
        // Для обычных тестов
        const supabaseResult = {
          test_id: result.testId,
          user_id: user.id.toString(), // Убеждаемся, что user_id - строка
          score: result.score,
          max_score: result.maxScore,
          passed_at: result.passedAt,
          passed: result.passed,
          answers: result.answers as Json
        };
        
        console.log('Данные для сохранения обычного теста:', supabaseResult);
        
        const { data, error } = await supabase
          .from('test_results')
          .insert([supabaseResult])
          .select();
          
        if (error) {
          console.error('Ошибка при сохранении результата теста:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.error('Данные не были сохранены');
          return null;
        }
        
        const savedResult: TestResult = {
          id: data[0].id,
          testId: data[0].test_id,
          userId: data[0].user_id,
          score: data[0].score,
          maxScore: data[0].max_score,
          passedAt: data[0].passed_at,
          passed: data[0].passed,
          answers: data[0].answers as number[]
        };
        
        setTestResults(prevResults => [...prevResults, savedResult]);
        console.log('Результат теста успешно сохранен:', savedResult);
        
        // Отправка результата теста директору
        const test = tests.find(t => t.id === savedResult.testId);
        if (test) {
          try {
            const sent = await sendTestResultToDirector(test, savedResult, user);
            if (sent) {
              toast({
                title: "PDF отчет отправлен",
                description: "Результаты теста были отправлены директору в формате PDF",
              });
            }
          } catch (pdfError) {
            console.warn('Ошибка при отправке PDF:', pdfError);
            // Не блокируем сохранение результата из-за ошибки PDF
          }
        }
        
        return savedResult;
      }
    } catch (error) {
      console.error('Error saving test result:', error);
      toast({
        title: "Ошибка сохранения результата",
        description: `Не удалось сохранить результат теста: ${error.message || 'Неизвестная ошибка'}`,
        variant: "destructive"
      });
      return null;
    }
  };
  
  const handleStartTest = (test: Test) => {
    setActiveTest(test);
  };
  
  const handleCloseTest = () => {
    setActiveTest(null);
  };

  // Если активен тест, показываем его интерфейс
  if (activeTest) {
    if (activeTest.id === PSYCH_TEST.id) {
      return (
        <div className="container mx-auto px-4 py-6">
          <PsychTest test={PSYCH_TEST} onSaveResult={saveTestResult} />
        </div>
      );
    } else {
      return (
        <div className="container mx-auto px-4 py-6">
          <RegularTest 
            test={activeTest} 
            onSaveResult={saveTestResult}
            onClose={handleCloseTest}
          />
        </div>
      );
    }
  }

  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Тесты и оценка навыков</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Доступные тесты</CardTitle>
          <CardDescription>
            Оцените свои знания и навыки, пройдя доступные тесты
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="available" className="space-y-4" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="available">Доступные тесты</TabsTrigger>
              <TabsTrigger value="psych">Психологический тест</TabsTrigger>
              <TabsTrigger value="results">Результаты</TabsTrigger>
            </TabsList>
            
            <TabsContent value="available">
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <TestsList
                  tests={tests}
                  testResults={testResults}
                  availableRoles={user ? [user.role] : []}
                  onStartTest={handleStartTest}
                />
              )}
            </TabsContent>
            
            <TabsContent value="psych">
              <PsychTestResults testResults={testResults} />
              <Button onClick={() => handleStartTest(PSYCH_TEST)}>
                Пройти психологический тест
              </Button>
            </TabsContent>
            
            <TabsContent value="results">
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {tests.map(test => {
                    const testResult = testResults.find(result => result.testId === test.id);
                    
                    return testResult ? (
                      <Card key={test.id}>
                        <CardHeader>
                          <CardTitle>{test.title}</CardTitle>
                          <CardDescription>
                            Пройден {new Date(testResult.passedAt).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>Результат: {testResult.score}/{testResult.maxScore}</p>
                          <Progress value={(testResult.score / testResult.maxScore) * 100} />
                          {testResult.passed ? (
                            <Badge variant="default" className="mt-2">Пройден</Badge>
                          ) : (
                            <Badge variant="destructive" className="mt-2">Не пройден</Badge>
                          )}
                        </CardContent>
                      </Card>
                    ) : null;
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tests;


import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Eye, ArrowUpCircle } from "lucide-react";
import { UserProfile } from "@/types/auth-types";
import { TestResultForDirector } from "@/types/chat-types";

interface TestResultsViewerProps {
  user: UserProfile;
}

const TestResultsViewer: React.FC<TestResultsViewerProps> = ({ user }) => {
  const [results, setResults] = useState<TestResultForDirector[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<TestResultForDirector | null>(null);

  // Load all test results for the director
  useEffect(() => {
    const loadResults = async () => {
      if (user.role !== "director") return;
      
      setLoading(true);
      try {
        // Get all test results
        const { data: resultsData, error: resultsError } = await supabase
          .from("test_results")
          .select("*");
          
        if (resultsError) throw resultsError;
        
        // Get all tests separately to fix the join issue
        const { data: testsData, error: testsError } = await supabase
          .from("tests")
          .select("id, title, passing_score");
          
        if (testsError) throw testsError;
        
        // Map tests by ID for easy lookup
        const testsById = testsData.reduce((acc, test) => {
          acc[test.id] = test;
          return acc;
        }, {} as Record<number, { id: number; title: string; passing_score: number }>);
        
        // Get user information for each result
        const enrichedResults = await Promise.all(
          resultsData.map(async (result) => {
            // Convert user_id to number if it's a string
            const userId = typeof result.user_id === 'string' ? parseInt(result.user_id, 10) : result.user_id;
            
            // Get user details
            const { data: userData } = await supabase
              .from("users")
              .select("name, position")
              .eq("id", userId)
              .single();
            
            // Look up test data from our map
            const testData = testsById[result.test_id] || { title: "Неизвестный тест", passing_score: 0 };
            
            return {
              id: result.id,
              user_id: userId,
              user_name: userData?.name || "Неизвестный сотрудник",
              user_position: userData?.position || "Должность не указана",
              test_id: result.test_id,
              test_name: testData.title,
              score: result.score,
              max_score: result.max_score,
              passing_score: testData.passing_score,
              passed: result.passed,
              created_at: result.created_at,
              viewed: false // Default value, as it doesn't exist in test_results table yet
            } as TestResultForDirector;
          })
        );
        
        setResults(enrichedResults);
      } catch (error) {
        console.error("Error loading test results:", error);
        toast({
          title: "Ошибка загрузки результатов",
          description: "Не удалось загрузить результаты тестирования",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadResults();
  }, [user]);
  
  // Mark result as viewed
  const handleViewResult = async (result: TestResultForDirector) => {
    try {
      setSelectedResult(result);
      
      // Update local state only, since we don't have a "viewed" field in the database yet
      if (!result.viewed) {
        // Update local state
        setResults(prev => 
          prev.map(r => (r.id === result.id ? { ...r, viewed: true } : r))
        );
      }
    } catch (error) {
      console.error("Error viewing result:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отметить результат как просмотренный",
        variant: "destructive"
      });
    }
  };
  
  const getPromotionRecommendation = (result: TestResultForDirector) => {
    // Calculate percentage
    const percentage = Math.round((result.score / result.max_score) * 100);
    const passingPercentage = result.passing_score;
    
    if (percentage >= passingPercentage) {
      return "Сотрудник успешно прошел тест и может быть повышен в должности";
    } else {
      return "Результат теста недостаточен для повышения в должности";
    }
  };
  
  if (user.role !== "director") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Доступ запрещен</CardTitle>
          <CardDescription>
            Только директор имеет доступ к просмотру результатов тестирования сотрудников
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Результаты тестирования сотрудников</CardTitle>
        <CardDescription>
          Просмотр результатов тестов и рекомендаций по карьерному росту сотрудников
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Пока нет доступных результатов тестирования
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Список результатов</h3>
              <div className="h-[calc(100vh-350px)] overflow-y-auto pr-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Сотрудник</TableHead>
                      <TableHead>Тест</TableHead>
                      <TableHead>Результат</TableHead>
                      <TableHead>Действие</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow 
                        key={result.id}
                        className={`cursor-pointer ${selectedResult?.id === result.id ? 'bg-muted' : ''}`}
                        onClick={() => handleViewResult(result)}
                      >
                        <TableCell>
                          {result.user_name}
                          {!result.viewed && (
                            <Badge variant="default" className="ml-2">Новый</Badge>
                          )}
                        </TableCell>
                        <TableCell>{result.test_name}</TableCell>
                        <TableCell>
                          {result.passed ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Пройден
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Не пройден</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewResult(result);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Детали результата</h3>
              {selectedResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Сотрудник</h4>
                      <p className="font-medium">{selectedResult.user_name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Должность</h4>
                      <p>{selectedResult.user_position}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Название теста</h4>
                      <p>{selectedResult.test_name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Дата прохождения</h4>
                      <p>{new Date(selectedResult.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Результат</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span>
                        {selectedResult.score} из {selectedResult.max_score} баллов 
                        ({Math.round((selectedResult.score / selectedResult.max_score) * 100)}%)
                      </span>
                      {selectedResult.passed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="h-2 w-full bg-muted-foreground/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          selectedResult.passed ? 'bg-green-600' : 'bg-red-600'
                        }`}
                        style={{ 
                          width: `${Math.round((selectedResult.score / selectedResult.max_score) * 100)}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Проходной балл: {selectedResult.passing_score}%
                    </p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg flex items-start space-x-3">
                    {selectedResult.passed ? (
                      <ArrowUpCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-medium mb-1">Рекомендация:</h4>
                      <p className="text-sm">{getPromotionRecommendation(selectedResult)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-350px)] text-muted-foreground">
                  <Eye className="h-12 w-12 mb-4 opacity-30" />
                  <p>Выберите результат для просмотра</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestResultsViewer;

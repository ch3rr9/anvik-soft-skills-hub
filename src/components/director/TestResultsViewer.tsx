import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, Eye } from "lucide-react";
import { UserProfile } from "@/types/auth-types";
import { TestResultFile } from "@/types/chat-types";

interface TestResultsViewerProps {
  user: UserProfile;
}

const TestResultsViewer: React.FC<TestResultsViewerProps> = ({ user }) => {
  const [reports, setReports] = useState<TestResultFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<TestResultFile | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Load all reports for the director
  useEffect(() => {
    const loadReports = async () => {
      if (user.role !== "director") return;
      
      setLoading(true);
      try {
        // Use type assertion for director_reports table
        const { data, error } = await (supabase
          .from("director_reports") as any)
          .select("*")
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        // Map to our interface
        const reportFiles: TestResultFile[] = data.map((report: any) => ({
          id: report.id,
          test_id: report.test_id,
          user_id: report.user_id,
          test_result_id: report.test_result_id,
          file_path: report.file_path,
          viewed: report.viewed,
          created_at: report.created_at
        }));
        
        // Fetch additional information for each report
        const enrichedReports = await Promise.all(reportFiles.map(async report => {
          // Get test name
          const { data: testData } = await supabase
            .from("tests")
            .select("title")
            .eq("id", report.test_id)
            .single();
            
          // Get user name
          const { data: userData } = await supabase
            .from("users")
            .select("name")
            .eq("id", report.user_id)
            .single();
            
          return {
            ...report,
            testName: testData?.title || "Неизвестный тест",
            userName: userData?.name || "Неизвестный сотрудник"
          };
        }));
        
        setReports(enrichedReports);
      } catch (error) {
        console.error("Error loading director reports:", error);
        toast({
          title: "Ошибка загрузки отчетов",
          description: "Не удалось загрузить результаты тестирования",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadReports();
  }, [user]);
  
  // View a report
  const handleViewReport = async (report: TestResultFile) => {
    try {
      setSelectedReport(report);
      
      // Get signed URL for the file
      const { data, error } = await supabase
        .storage
        .from("test-results")
        .createSignedUrl(report.file_path, 3600); // 1 hour expiration
        
      if (error) throw error;
      
      setPdfUrl(data.signedUrl);
      
      // Mark as viewed if not already
      if (!report.viewed) {
        await (supabase
          .from("director_reports") as any)
          .update({ viewed: true })
          .eq("id", report.id);
          
        // Update local state
        setReports(prev => 
          prev.map(r => (r.id === report.id ? { ...r, viewed: true } : r))
        );
      }
    } catch (error) {
      console.error("Error viewing report:", error);
      toast({
        title: "Ошибка просмотра отчета",
        description: "Не удалось открыть PDF файл",
        variant: "destructive"
      });
    }
  };
  
  // Download a report
  const handleDownloadReport = async (report: TestResultFile) => {
    try {
      // Get the file URL
      const { data, error } = await supabase
        .storage
        .from("test-results")
        .download(report.file_path);
        
      if (error) throw error;
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `результат_теста_${report.userName}_${new Date(report.created_at).toLocaleDateString()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Отчет скачан",
        description: "PDF файл успешно скачан"
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        title: "Ошибка скачивания",
        description: "Не удалось скачать PDF файл",
        variant: "destructive"
      });
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
          Просмотр результатов тестов сотрудников в формате PDF
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Пока нет доступных отчетов о результатах тестирования
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Список отчетов</h3>
              <div className="h-[calc(100vh-350px)] overflow-y-auto pr-2">
                {reports.map(report => (
                  <div 
                    key={report.id} 
                    className={`p-4 rounded-lg mb-3 cursor-pointer transition-colors ${
                      selectedReport?.id === report.id 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-card hover:bg-accent"
                    } border`}
                    onClick={() => handleViewReport(report)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">{report.testName}</span>
                          {!report.viewed && (
                            <Badge variant="default" className="ml-2">Новый</Badge>
                          )}
                        </div>
                        <p className="text-sm mt-1">{report.userName}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(report.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadReport(report);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Просмотр отчета</h3>
              {selectedReport && pdfUrl ? (
                <div className="h-[calc(100vh-350px)]">
                  <iframe 
                    src={`${pdfUrl}#toolbar=0`} 
                    className="w-full h-full border rounded"
                    title="PDF Viewer"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-350px)] text-muted-foreground">
                  <Eye className="h-12 w-12 mb-4 opacity-30" />
                  <p>Выберите отчет для просмотра</p>
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

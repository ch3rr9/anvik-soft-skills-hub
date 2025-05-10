
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Test, TestResult } from "@/types/test-types";
import { UserProfile } from "@/types/auth-types";
import { supabase } from "@/integrations/supabase/client";

// Create a proper type for jsPDF with autoTable
interface JsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

/**
 * Generate a PDF report for test results
 */
export const generateTestResultPDF = (
  test: Test,
  testResult: TestResult,
  user: UserProfile
): Blob => {
  // Create a new PDF document
  const doc = new jsPDF() as JsPDFWithAutoTable;
  
  // Add title
  doc.setFontSize(20);
  doc.text("Отчет о результате теста", 105, 15, { align: "center" });
  
  // Add test information
  doc.setFontSize(14);
  doc.text(`Тест: ${test.title}`, 14, 30);
  doc.setFontSize(12);
  doc.text(`Категория: ${test.category}`, 14, 40);
  doc.text(`Описание: ${test.description}`, 14, 50);
  
  // Add user information
  doc.setFontSize(14);
  doc.text("Информация о сотруднике", 14, 70);
  doc.setFontSize(12);
  doc.text(`ФИО: ${user.name}`, 14, 80);
  doc.text(`Email: ${user.email}`, 14, 90);
  doc.text(`Отдел: ${user.department || "Не указано"}`, 14, 100);
  doc.text(`Должность: ${user.position || "Не указано"}`, 14, 110);
  
  // Add test result
  doc.setFontSize(14);
  doc.text("Результаты тестирования", 14, 130);
  doc.setFontSize(12);
  doc.text(`Дата прохождения: ${new Date(testResult.passedAt).toLocaleDateString()}`, 14, 140);
  doc.text(`Баллы: ${testResult.score} из ${testResult.maxScore}`, 14, 150);
  doc.text(`Процент выполнения: ${Math.round((testResult.score / testResult.maxScore) * 100)}%`, 14, 160);
  doc.text(`Результат: ${testResult.passed ? "Тест пройден" : "Тест не пройден"}`, 14, 170);
  
  // If it's a psychology test, add recommendation
  if ('recommendation' in testResult && testResult.recommendation) {
    doc.setFontSize(14);
    doc.text("Рекомендация психолога", 14, 190);
    doc.setFontSize(12);
    doc.text(testResult.recommendation, 14, 200);
  }
  
  // Add questions and answers
  doc.addPage();
  doc.setFontSize(14);
  doc.text("Ответы на вопросы", 105, 15, { align: "center" });
  
  // Prepare data for the table
  const tableData = test.questions.map((question, index) => {
    const userAnswer = testResult.answers[index];
    const correctAnswer = question.correctAnswer;
    const isCorrect = userAnswer === correctAnswer;
    
    return [
      index + 1,
      question.text,
      userAnswer !== undefined ? question.options[userAnswer] : "Нет ответа",
      isCorrect ? "✓" : "✗"
    ];
  });
  
  // Create table
  doc.autoTable({
    head: [['№', 'Вопрос', 'Ответ', 'Результат']],
    body: tableData,
    startY: 25,
    headStyles: { fillColor: [41, 128, 185] }
  });
  
  // Add footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Страница ${i} из ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: "center" });
    doc.text(`Сгенерировано системой "Анвик-Софт Skills Hub"`, 105, doc.internal.pageSize.height - 5, { align: "center" });
  }
  
  // Return the PDF as a blob
  return doc.output("blob");
};

/**
 * Send test result as PDF to director
 */
export const sendTestResultToDirector = async (
  test: Test,
  testResult: TestResult,
  user: UserProfile
): Promise<boolean> => {
  try {
    // Generate PDF blob
    const pdfBlob = generateTestResultPDF(test, testResult, user);
    
    // Create a file name
    const fileName = `test_result_${user.name}_${new Date().toISOString()}.pdf`;
    
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', pdfBlob, fileName);
    formData.append('test_id', test.id.toString());
    formData.append('user_id', user.id);
    formData.append('test_result_id', testResult.id.toString());
    
    // Send the PDF to the director through Supabase
    const { data, error } = await supabase.storage
      .from('test-results')
      .upload(`director/${fileName}`, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      });
    
    if (error) {
      console.error("Error uploading PDF:", error);
      return false;
    }
    
    // Store reference in the database with type assertion
    const { error: dbError } = await supabase
      .from('director_reports' as any)
      .insert({
        test_id: test.id,
        user_id: user.id,
        test_result_id: testResult.id,
        file_path: data.path,
        created_at: new Date().toISOString(),
        viewed: false
      });
      
    if (dbError) {
      console.error("Error storing PDF reference:", dbError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error sending test result to director:", error);
    return false;
  }
};

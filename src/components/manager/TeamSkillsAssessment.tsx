
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import { User, CheckCircle, AlertTriangle, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Мок данных для оценки навыков команды
const teamSkillsData = [
  {
    id: "1",
    name: "Анна Петрова",
    position: "1С Разработчик",
    department: "ИТ",
    skills: [
      { name: "1С:Предприятие 8.3", level: 85, lastAssessed: "2024-04-15" },
      { name: "SQL", level: 70, lastAssessed: "2024-04-10" },
      { name: "JavaScript", level: 60, lastAssessed: "2024-04-05" }
    ],
    overallScore: 72,
    needsAssessment: false
  },
  {
    id: "2",
    name: "Михаил Сидоров",
    position: "Системный администратор",
    department: "ИТ",
    skills: [
      { name: "Windows Server", level: 90, lastAssessed: "2024-04-12" },
      { name: "SQL", level: 65, lastAssessed: "2024-03-20" },
      { name: "PowerShell", level: 75, lastAssessed: "2024-04-01" }
    ],
    overallScore: 77,
    needsAssessment: true
  },
  {
    id: "3",
    name: "Екатерина Козлова",
    position: "Аналитик",
    department: "Финансы",
    skills: [
      { name: "1С:ERP", level: 80, lastAssessed: "2024-04-08" },
      { name: "Excel", level: 95, lastAssessed: "2024-04-14" },
      { name: "SQL", level: 55, lastAssessed: "2024-03-15" }
    ],
    overallScore: 77,
    needsAssessment: true
  }
];

const TeamSkillsAssessment: React.FC = () => {
  const { hasPermission } = useSimpleAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedSkill, setSelectedSkill] = useState<string>("");

  if (!hasPermission(["manager", "director"])) {
    return null;
  }

  const employeesNeedingAssessment = teamSkillsData.filter(emp => emp.needsAssessment);
  const allSkills = Array.from(new Set(teamSkillsData.flatMap(emp => emp.skills.map(skill => skill.name))));

  const handleAssignTest = () => {
    if (!selectedEmployee || !selectedSkill) {
      toast({
        title: "Ошибка",
        description: "Выберите сотрудника и навык для тестирования",
        variant: "destructive"
      });
      return;
    }

    const employee = teamSkillsData.find(emp => emp.id === selectedEmployee);
    toast({
      title: "Тест назначен",
      description: `Тест по "${selectedSkill}" назначен сотруднику ${employee?.name}`,
    });
  };

  const getSkillLevelColor = (level: number) => {
    if (level >= 80) return "text-green-600";
    if (level >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getSkillLevelBadge = (level: number) => {
    if (level >= 80) return "bg-green-100 text-green-800";
    if (level >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="text-gray-50">
          Управление
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Оценка навыков команды</DialogTitle>
          <DialogDescription>
            Управление тестированием и оценкой навыков сотрудников
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Всего сотрудников</p>
                    <p className="text-2xl font-bold">{teamSkillsData.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Требуют оценки</p>
                    <p className="text-2xl font-bold">{employeesNeedingAssessment.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Средний балл</p>
                    <p className="text-2xl font-bold">
                      {Math.round(teamSkillsData.reduce((acc, emp) => acc + emp.overallScore, 0) / teamSkillsData.length)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Назначение тестов */}
          <Card>
            <CardHeader>
              <CardTitle>Назначить тест</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите сотрудника" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamSkillsData.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите навык" />
                  </SelectTrigger>
                  <SelectContent>
                    {allSkills.map(skill => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button onClick={handleAssignTest}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Назначить тест
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Список сотрудников */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Команда</h3>
            {teamSkillsData.map(employee => (
              <Card key={employee.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold">{employee.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {employee.position} • {employee.department}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-muted-foreground mr-2">Общий балл:</span>
                        <Badge className={getSkillLevelBadge(employee.overallScore)}>
                          {employee.overallScore}%
                        </Badge>
                        {employee.needsAssessment && (
                          <Badge variant="outline" className="ml-2 text-orange-600 border-orange-300">
                            Требует оценки
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="font-medium">Навыки:</h5>
                    {employee.skills.map(skill => (
                      <div key={skill.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{skill.name}</span>
                          <span className={getSkillLevelColor(skill.level)}>
                            {skill.level}%
                          </span>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Последняя оценка: {new Date(skill.lastAssessed).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamSkillsAssessment;


import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getAllUsers } from "@/utils/userUtils";
import { useQuery } from "@tanstack/react-query";

interface TestAssignmentDialogProps {
  onTestAssigned: () => void;
}

const TestAssignmentDialog = ({ onTestAssigned }: TestAssignmentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [dueDate, setDueDate] = useState<Date>();

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });

  const mockTests = [
    { id: "1", title: "Тест по JavaScript" },
    { id: "2", title: "Психологический тест" },
    { id: "3", title: "Тест по React" },
  ];

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleAssignTest = () => {
    if (!selectedTest || selectedUsers.length === 0 || !scheduledDate || !dueDate) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    // Здесь будет логика сохранения в базу данных
    console.log("Assigning test:", {
      testId: selectedTest,
      userIds: selectedUsers,
      scheduledDate: scheduledDate.toISOString(),
      dueDate: dueDate.toISOString(),
    });

    toast({
      title: "Тест назначен",
      description: `Тест успешно назначен ${selectedUsers.length} пользователям`,
    });

    setOpen(false);
    setSelectedTest("");
    setSelectedUsers([]);
    setScheduledDate(undefined);
    setDueDate(undefined);
    onTestAssigned();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Назначить тест
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Назначение теста</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-select">Выберите тест</Label>
            <Select value={selectedTest} onValueChange={setSelectedTest}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тест..." />
              </SelectTrigger>
              <SelectContent>
                {mockTests.map((test) => (
                  <SelectItem key={test.id} value={test.id}>
                    {test.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Назначить пользователям</Label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={user.id}
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => 
                      handleUserSelection(user.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={user.id} className="text-sm">
                    {user.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Дата начала</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, "dd.MM.yyyy") : "Выберите дату"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Дата окончания</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "dd.MM.yyyy") : "Выберите дату"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAssignTest} className="flex-1">
              Назначить
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestAssignmentDialog;


import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import { Users, UserPlus, Settings, Shield, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Мок данных для управления персоналом
const personnelData = [
  {
    id: "1",
    name: "Анна Петрова",
    email: "anna.petrova@anvik-soft.ru",
    position: "1С Разработчик",
    department: "ИТ",
    role: "employee",
    status: "active",
    joinDate: "2023-01-15",
    lastActivity: "2024-04-20"
  },
  {
    id: "2",
    name: "Михаил Сидоров",
    email: "mikhail.sidorov@anvik-soft.ru",
    position: "Системный администратор",
    department: "ИТ",
    role: "employee",
    status: "active",
    joinDate: "2022-08-10",
    lastActivity: "2024-04-19"
  },
  {
    id: "3",
    name: "Екатерина Козлова",
    email: "ekaterina.kozlova@anvik-soft.ru",
    position: "Аналитик",
    department: "Финансы",
    role: "employee",
    status: "active",
    joinDate: "2023-03-22",
    lastActivity: "2024-04-18"
  },
  {
    id: "4",
    name: "Иван Директоров",
    email: "ivan.direktorov@anvik-soft.ru",
    position: "Генеральный директор",
    department: "Управление",
    role: "director",
    status: "active",
    joinDate: "2020-01-01",
    lastActivity: "2024-04-20"
  }
];

const departments = ["ИТ", "Финансы", "HR", "Управление", "Продажи"];
const roles = [
  { value: "employee", label: "Сотрудник" },
  { value: "manager", label: "Менеджер" },
  { value: "director", label: "Директор" },
  { value: "hr", label: "HR" }
];

const PersonnelManagement: React.FC = () => {
  const { hasPermission } = useSimpleAuth();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  if (!hasPermission(["manager", "director"])) {
    return null;
  }

  const filteredPersonnel = personnelData.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || person.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    toast({
      title: "Редактирование пользователя",
      description: `Функционал редактирования пользователя ${user.name} в разработке`,
    });
  };

  const handleDeleteUser = (user: any) => {
    toast({
      title: "Удаление пользователя",
      description: `Функционал удаления пользователя ${user.name} в разработке`,
    });
  };

  const handleCreateUser = () => {
    toast({
      title: "Создание пользователя",
      description: "Функционал создания нового пользователя в разработке",
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "director":
        return "bg-purple-100 text-purple-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "hr":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="text-slate-50">
          Настройки
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Управление персоналом</DialogTitle>
          <DialogDescription>
            Управление пользователями, ролями и правами доступа
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="roles">Роли и права</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            {/* Фильтры и поиск */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Поиск</Label>
                <Input
                  id="search"
                  placeholder="Поиск по имени, email или должности..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="department">Отдел</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger id="department">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все отделы</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleCreateUser}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Добавить
                </Button>
              </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Всего</p>
                      <p className="text-2xl font-bold">{personnelData.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Активных</p>
                      <p className="text-2xl font-bold">
                        {personnelData.filter(p => p.status === "active").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Менеджеров</p>
                      <p className="text-2xl font-bold">
                        {personnelData.filter(p => p.role === "manager" || p.role === "director").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Отделов</p>
                      <p className="text-2xl font-bold">{departments.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Список пользователей */}
            <div className="space-y-4">
              {filteredPersonnel.map(person => (
                <Card key={person.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-anvik-primary flex items-center justify-center text-white font-semibold">
                            {person.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="font-semibold">{person.name}</h4>
                            <p className="text-sm text-muted-foreground">{person.email}</p>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Должность</p>
                            <p className="text-sm font-medium">{person.position}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Отдел</p>
                            <p className="text-sm font-medium">{person.department}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Роль</p>
                            <Badge className={getRoleBadge(person.role)}>
                              {getRoleLabel(person.role)}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Последняя активность</p>
                            <p className="text-sm font-medium">
                              {new Date(person.lastActivity).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(person)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteUser(person)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Роли и права доступа</CardTitle>
                <CardDescription>Управление ролями и их правами в системе</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roles.map(role => (
                    <div key={role.value} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{role.label}</h4>
                        <p className="text-sm text-muted-foreground">
                          {role.value === "director" && "Полный доступ ко всем функциям системы"}
                          {role.value === "manager" && "Управление командой и отчетами"}
                          {role.value === "hr" && "Управление персоналом и оценками"}
                          {role.value === "employee" && "Базовый доступ к личному кабинету"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getRoleBadge(role.value)}>
                          {personnelData.filter(p => p.role === role.value).length} пользователей
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Общие настройки</CardTitle>
                <CardDescription>Настройки системы управления персоналом</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Уведомления</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Настройка уведомлений для менеджеров
                    </p>
                    <Button variant="outline">Настроить</Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Интеграция с AD</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Синхронизация с Active Directory
                    </p>
                    <Button variant="outline">Настроить</Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Экспорт данных</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Экспорт списка сотрудников и отчетов
                    </p>
                    <Button variant="outline">Экспортировать</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PersonnelManagement;

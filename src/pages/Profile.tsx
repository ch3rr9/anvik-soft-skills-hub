import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { User, Briefcase, Building, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import TestResultsViewer from "@/components/director/TestResultsViewer";

const ProfileInfo = () => {
  const { user } = useAuth();
  
  // Преобразование роли в русский текст и цвет беджа
  const roleLabels = {
    "employee": { text: "Сотрудник", color: "bg-blue-100 text-blue-800" },
    "manager": { text: "Менеджер", color: "bg-green-100 text-green-800" },
    "director": { text: "Директор", color: "bg-purple-100 text-purple-800" }
  };
  
  const roleInfo = roleLabels[user?.role || "employee"];

  // Обновление информации пользователя
  const updateUserProfile = async (field: string, value: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ [field]: value })
        .eq('id', Number(user.id));
        
      if (error) throw error;
      
      toast({
        title: "Данные обновлены",
        description: "Ваша информация успешно обновлена",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Ошибка обновления",
        description: "Не удалось обновить данные",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="h-20 w-20 rounded-full bg-anvik-primary flex items-center justify-center text-white text-xl font-semibold">
          {user?.name?.slice(0, 1) || "A"}
        </div>
        <div>
          <h3 className="text-2xl font-semibold">{user?.name}</h3>
          <Badge className={`mt-1 ${roleInfo.color}`}>
            {roleInfo.text}
          </Badge>
        </div>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-muted-foreground mb-3">Личная информация</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>ФИО: {user?.name}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>Email: {user?.email}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-muted-foreground mb-3">Рабочая информация</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>Отдел: {user?.department || "Не указано"}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>Должность: {user?.position || "Не указано"}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-muted-foreground mb-3">Безопасность</h4>
        <Button variant="outline" onClick={() => toast({ title: "В разработке", description: "Функционал смены пароля в разработке" })}>
          Сменить пароль
        </Button>
      </div>
    </div>
  );
};

const SkillsTab = () => {
  // Моковые данные навыков
  const skills = [
    { name: "1С:Предприятие 8.3", level: 85 },
    { name: "1С:УТ", level: 70 },
    { name: "1С:ERP", level: 60 },
    { name: "1С:ЗУП", level: 75 },
    { name: "SQL", level: 65 },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Профессиональные навыки</h3>
      
      <div className="space-y-4">
        {skills.map((skill) => (
          <div key={skill.name} className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">{skill.name}</span>
              <span className="text-muted-foreground">{skill.level}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-anvik-primary rounded-full" 
                style={{ width: `${skill.level}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <Button variant="outline" className="w-full" onClick={() => toast({ title: "В разработке", description: "Функционал самооценки навыков в разработке" })}>
        Обновить самооценку навыков
      </Button>
    </div>
  );
};

const PreferencesTab = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    tests: true,
    chat: true,
  });
  
  const handleSave = () => {
    toast({
      title: "Настройки сохранены",
      description: "Ваши предпочтения были успешно обновлены",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Настройки интерфейса</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="language">Язык интерфейса</Label>
            <select
              id="language"
              className="rounded-md border border-input bg-background px-3 py-1"
              defaultValue="ru"
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Уведомления</h3>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="email-notifications"
              className="rounded border-gray-300"
              checked={notifications.email}
              onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
            />
            <Label htmlFor="email-notifications">Email-уведомления</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="test-notifications"
              className="rounded border-gray-300"
              checked={notifications.tests}
              onChange={(e) => setNotifications({...notifications, tests: e.target.checked})}
            />
            <Label htmlFor="test-notifications">Уведомления о новых тестах</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="chat-notifications"
              className="rounded border-gray-300"
              checked={notifications.chat}
              onChange={(e) => setNotifications({...notifications, chat: e.target.checked})}
            />
            <Label htmlFor="chat-notifications">Уведомления в чате</Label>
          </div>
        </div>
      </div>
      
      <Button onClick={handleSave} className="w-full">Сохранить настройки</Button>
    </div>
  );
};

const DirectorDashboard = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Панель директора</h3>
      <TestResultsViewer user={user} />
    </div>
  );
};

const Profile = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Личный кабинет</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Профиль пользователя</CardTitle>
          <CardDescription>
            Просмотр и управление личной информацией
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="info">
            <TabsList className="mb-4">
              <TabsTrigger value="info">Информация</TabsTrigger>
              <TabsTrigger value="skills">Навыки</TabsTrigger>
              <TabsTrigger value="preferences">Настройки</TabsTrigger>
              {user?.role === "director" && (
                <TabsTrigger value="director">Результаты тестов</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="info">
              <ProfileInfo />
            </TabsContent>
            <TabsContent value="skills">
              <SkillsTab />
            </TabsContent>
            <TabsContent value="preferences">
              <PreferencesTab />
            </TabsContent>
            {user?.role === "director" && (
              <TabsContent value="director">
                <DirectorDashboard />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;

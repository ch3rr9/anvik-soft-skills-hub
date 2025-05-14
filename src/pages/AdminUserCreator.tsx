
import { useState } from "react";
import { createAdminUser } from "@/utils/adminUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AdminUserCreator = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("Cherry");
  const [email, setEmail] = useState("cherry@anvik-soft.com");
  const [password, setPassword] = useState("1255433");
  const [department, setDepartment] = useState("Administration");
  const [position, setPosition] = useState("System Administrator");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { success, error } = await createAdminUser(
        name, 
        email, 
        password, 
        department, 
        position
      );

      if (success) {
        toast({
          title: "Успех",
          description: `Администратор ${name} успешно создан`,
        });
        // Перенаправляем на страницу входа, чтобы пользователь мог войти
        navigate("/login");
      } else {
        toast({
          title: "Ошибка создания пользователя",
          description: error || "Неизвестная ошибка",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при создании пользователя",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-anvik-primary">Анвик-Софт</h1>
          <p className="mt-2 text-xl text-anvik-dark">Skills Hub</p>
        </div>

        <Card className="border-anvik-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Создание администратора</CardTitle>
            <CardDescription>
              Создание нового пользователя с правами администратора
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateUser}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Отдел</Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Должность</Label>
                <Input
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-anvik-primary hover:bg-anvik-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent"></div>
                    <span>Создание...</span>
                  </div>
                ) : (
                  "Создать администратора"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminUserCreator;

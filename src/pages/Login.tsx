
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Attempting to login with email: ${email}`);
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Вход выполнен успешно",
          description: "Добро пожаловать в систему!",
        });
        navigate("/");
      } else {
        setError("Неверный адрес электронной почты или пароль");
        toast({
          title: "Ошибка входа",
          description: "Неверный адрес электронной почты или пароль",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Произошла ошибка при попытке входа");
      toast({
        title: "Ошибка авторизации",
        description: "Произошла ошибка при попытке входа",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  // Если пользователь уже авторизован, перенаправляем на главную
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-anvik-primary">Анвик-Софт</h1>
          <p className="mt-2 text-xl text-anvik-dark">Skills Hub</p>
        </div>

        <Card className="border-anvik-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Вход в систему</CardTitle>
            <CardDescription>
              Введите свои учетные данные для доступа к платформе
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@anvik-soft.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Пароль</Label>
                  <a
                    href="#"
                    className="text-sm text-anvik-primary hover:text-anvik-primary/80"
                  >
                    Забыли пароль?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    <span>Вход...</span>
                  </div>
                ) : (
                  "Войти"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Демо-аккаунты для тестирования:</p>
          <div className="mt-2 grid grid-cols-1 gap-2">
            <div className="p-3 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer transition-colors"
                 onClick={() => handleDemoLogin("director@anvik-soft.com", "director123")}>
              <p><strong>Директор:</strong> director@anvik-soft.com / director123</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer transition-colors"
                 onClick={() => handleDemoLogin("hr@anvik-soft.com", "hr123")}>
              <p><strong>HR-менеджер:</strong> hr@anvik-soft.com / hr123</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer transition-colors"
                 onClick={() => handleDemoLogin("employee@anvik-soft.com", "employee123")}>
              <p><strong>Сотрудник:</strong> employee@anvik-soft.com / employee123</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer transition-colors"
                 onClick={() => handleDemoLogin("manager@anvik-soft.com", "manager123")}>
              <p><strong>Менеджер:</strong> manager@anvik-soft.com / manager123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

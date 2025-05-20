
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, User, LogIn } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Схема валидации формы логина
const loginSchema = z.object({
  email: z.string().email("Введите корректный email адрес"),
  password: z.string().min(1, "Введите пароль")
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Инициализация формы с валидацией
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const handleSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      console.log(`Attempting to login with email: ${values.email}`);
      const success = await login(values.email, values.password);
      
      if (success) {
        toast({
          title: "Вход выполнен успешно",
          description: "Добро пожаловать в систему!",
        });
        navigate("/");
      } else {
        toast({
          title: "Ошибка входа",
          description: "Неверный адрес электронной почты или пароль",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
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
    form.setValue("email", demoEmail);
    form.setValue("password", demoPassword);
  };

  // Если пользователь уже авторизован, перенаправляем на главную
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-anvik-primary">Анвик-Софт</h1>
          <p className="mt-2 text-xl text-anvik-dark">Skills Hub</p>
        </div>

        <Card className="border-anvik-primary/20 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Вход в систему</CardTitle>
            <CardDescription className="text-center">
              Введите свои учетные данные для доступа к платформе
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <CardContent className="space-y-4 pb-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="example@anvik-soft.com"
                            className="pl-10" 
                            autoComplete="email"
                          />
                        </FormControl>
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Пароль</FormLabel>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? 'Скрыть' : 'Показать'}
                        </button>
                      </div>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            {...field} 
                            type={showPassword ? "text" : "password"} 
                            className="pl-10" 
                            placeholder="••••••••"
                            autoComplete="current-password"
                          />
                        </FormControl>
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              
              <CardFooter className="flex flex-col gap-4">
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
                    <>
                      <LogIn className="mr-2" size={18} />
                      Войти
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <div className="text-center text-sm text-muted-foreground bg-card p-4 rounded-lg shadow-sm border border-border">
          <p className="font-medium mb-3">Демо-аккаунты для тестирования:</p>
          <div className="grid grid-cols-1 gap-2">
            <div className="p-3 bg-muted rounded-md hover:bg-muted/80 cursor-pointer transition-colors flex items-center justify-between"
                 onClick={() => handleDemoLogin("director@anvik-soft.com", "director123")}>
              <p className="font-medium"><strong className="text-anvik-primary">Директор:</strong></p>
              <div className="flex gap-2">
                <p>director@anvik-soft.com</p>
                <span className="text-muted-foreground">/ director123</span>
              </div>
            </div>
            <div className="p-3 bg-muted rounded-md hover:bg-muted/80 cursor-pointer transition-colors flex items-center justify-between"
                 onClick={() => handleDemoLogin("hr@anvik-soft.com", "hr123")}>
              <p className="font-medium"><strong className="text-anvik-primary">HR-менеджер:</strong></p>
              <div className="flex gap-2">
                <p>hr@anvik-soft.com</p>
                <span className="text-muted-foreground">/ hr123</span>
              </div>
            </div>
            <div className="p-3 bg-muted rounded-md hover:bg-muted/80 cursor-pointer transition-colors flex items-center justify-between"
                 onClick={() => handleDemoLogin("employee@anvik-soft.com", "employee123")}>
              <p className="font-medium"><strong className="text-anvik-primary">Сотрудник:</strong></p>
              <div className="flex gap-2">
                <p>employee@anvik-soft.com</p>
                <span className="text-muted-foreground">/ employee123</span>
              </div>
            </div>
            <div className="p-3 bg-muted rounded-md hover:bg-muted/80 cursor-pointer transition-colors flex items-center justify-between"
                 onClick={() => handleDemoLogin("manager@anvik-soft.com", "manager123")}>
              <p className="font-medium"><strong className="text-anvik-primary">Менеджер:</strong></p>
              <div className="flex gap-2">
                <p>manager@anvik-soft.com</p>
                <span className="text-muted-foreground">/ manager123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

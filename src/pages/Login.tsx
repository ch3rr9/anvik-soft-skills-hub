
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import { UserRole } from "@/types/auth-types";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createCherryUser } from "@/utils/adminUtils";

// Схема валидации формы входа
const loginSchema = z.object({
  email: z.string().email({ message: "Введите корректный email" }),
  password: z.string().min(6, { message: "Пароль должен содержать не менее 6 символов" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Демо-аккаунты для разных ролей
const demoAccounts = [
  {
    email: "cherry@anvik-soft.com",
    password: "cherry999",
    role: "director" as UserRole,
    label: "Cherry (Админ)",
    color: "bg-red-100 border-red-500 text-red-700"
  },
  {
    email: "director@anvik-soft.com",
    password: "director123",
    role: "director" as UserRole,
    label: "Директор",
    color: "bg-blue-100 border-blue-500 text-blue-700"
  },
  {
    email: "hr@anvik-soft.com",
    password: "hr123",
    role: "hr" as UserRole,
    label: "HR",
    color: "bg-purple-100 border-purple-500 text-purple-700"
  },
  {
    email: "manager@anvik-soft.com",
    password: "manager123",
    role: "manager" as UserRole,
    label: "Менеджер",
    color: "bg-green-100 border-green-500 text-green-700"
  },
  {
    email: "employee@anvik-soft.com",
    password: "employee123",
    role: "employee" as UserRole,
    label: "Сотрудник",
    color: "bg-amber-100 border-amber-500 text-amber-700"
  }
];

const Login = () => {
  const { login, isLoading } = useSimpleAuth();
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Создаём пользователя Cherry при загрузке страницы
  useEffect(() => {
    const initializeCherryUser = async () => {
      try {
        const result = await createCherryUser();
        if (result.success) {
          console.log("Cherry user initialized successfully");
        } else {
          console.warn("Failed to initialize Cherry user:", result.error);
        }
      } catch (error) {
        console.error("Error initializing Cherry user:", error);
      }
    };

    initializeCherryUser();
  }, []);

  const onSubmit = async (data: LoginFormValues) => {
    console.log('Form submitted with:', data);
    
    const result = await login(data.email, data.password);
    
    if (result.success) {
      toast({
        title: "Вход выполнен",
        description: "Добро пожаловать!",
      });
      navigate("/");
    } else {
      toast({
        title: "Ошибка входа",
        description: result.error || "Неверный email или пароль",
        variant: "destructive",
      });
    }
  };

  // Функция для входа с демо-аккаунтом
  const loginWithDemo = async (email: string, password: string) => {
    form.setValue("email", email);
    form.setValue("password", password);
    
    const result = await login(email, password);
    
    if (result.success) {
      toast({
        title: "Вход выполнен",
        description: "Добро пожаловать!",
      });
      navigate("/");
    } else {
      toast({
        title: "Ошибка входа",
        description: result.error || "Ошибка демо-входа",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-anvik-light to-background p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <Card className="border-2 border-anvik-primary/20 shadow-lg animate-scale-in">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-anvik-primary/10 p-4 animate-pulse">
                <LogIn className="h-8 w-8 text-anvik-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-anvik-dark animate-slide-down">
              Анвик-Софт Skills Hub
            </CardTitle>
            <CardDescription className="animate-slide-down animate-delay-100">
              Пожалуйста, войдите в свой аккаунт
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 animate-slide-down animate-delay-200">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="email@anvik-soft.com" 
                          autoComplete="email"
                          className="transition-all duration-200 focus:ring-2 focus:ring-anvik-primary/40"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Пароль</FormLabel>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="••••••" 
                          autoComplete="current-password"
                          className="transition-all duration-200 focus:ring-2 focus:ring-anvik-primary/40"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full transition-all duration-300 hover:bg-anvik-primary/90 hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Вход...
                    </>
                  ) : (
                    "Войти"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 text-center animate-slide-up animate-delay-300">
            <div className="text-sm text-muted-foreground">
              <span>Демо-аккаунты для тестирования:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
              {demoAccounts.map((account, index) => (
                <Button
                  key={account.role + account.email}
                  variant="outline"
                  className={`p-2 text-xs border-2 hover:scale-[1.02] active:scale-[0.98] transition-all ${account.color}`}
                  onClick={() => loginWithDemo(account.email, account.password)}
                  disabled={isLoading}
                >
                  {account.label}
                </Button>
              ))}
            </div>
          </CardFooter>
        </Card>
        <p className="text-center text-sm text-muted-foreground mt-4 animate-fade-in animate-delay-500">
          &copy; {new Date().getFullYear()} Анвик-Софт Skills Hub. Все права защищены.
        </p>
      </div>
    </div>
  );
};

export default Login;

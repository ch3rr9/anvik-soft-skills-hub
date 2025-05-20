
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth-types";
import { Loader2, LogIn } from "lucide-react";

// Схема валидации формы входа
const loginSchema = z.object({
  email: z.string().email({ message: "Введите корректный email" }),
  password: z.string().min(6, { message: "Пароль должен содержать не менее 6 символов" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Демо-аккаунты для разных ролей
const demoAccounts = [
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
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [loginAttempted, setLoginAttempted] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoginAttempted(true);
    const success = await login(data.email, data.password);
    if (success) {
      navigate("/");
    }
  };

  // Функция для входа с демо-аккаунтом
  const loginWithDemo = async (email: string, password: string) => {
    form.setValue("email", email);
    form.setValue("password", password);
    await login(email, password);
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
                  key={account.role}
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

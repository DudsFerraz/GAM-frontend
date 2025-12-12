import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from './authLayout';
import { Button, Checkbox, Input } from '@/components/ui/index';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { login } from '@/features/auth/api/login';
import { AxiosError } from 'axios';

const loginSchema = z.object({
  email: z.email("Digite um e-mail válido"),
  password: z.string().min(1, "A senha é obrigatória"),
  rememberMe: z.boolean().default(false).optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // 2. Configuração do Formulário
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login({
        email: values.email,
        password: values.password,
      });

      navigate({ to: '/home' });
      
    } catch (error) {
      
        if (error instanceof AxiosError) {
            const mensagemDoBackend = error.response?.data?.message || "Ocorreu um erro na comunicação com o servidor.";
            setErrorMessage(mensagemDoBackend);
        } else if (error instanceof Error) {
            setErrorMessage(error.message);
        } else {
        setErrorMessage("Ocorreu um erro inesperado.");
        }

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8 text-center sm:text-left">
        <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 mb-2">
          Bem-vindo de volta!
        </h2>
        <p className="text-xl text-neutral-600">
          Acesse sua conta para continuar.
        </p>
      </div>

      {/* Mensagem de Erro Global */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-600 text-sm rounded-md">
          {errorMessage}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Campo: Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="seu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo: Senha (Com Toggle de Visibilidade) */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="pr-10"
                      {...field} 
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Linha: Checkbox + Esqueceu a senha */}
          <div className="flex items-center justify-between text-sm">
            {/* Checkbox controlado pelo React Hook Form */}
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="remember"
                    />
                  </FormControl>
                  <FormLabel 
                    htmlFor="remember" 
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-normal cursor-pointer text-neutral-700"
                  >
                    Lembrar de mim
                  </FormLabel>
                </FormItem>
              )}
            />
            
            {/* Link Placeholder para recuperar senha */}
            <Link to="/auth/login" className="text-sky-500 hover:underline font-medium">
              Esqueceu a senha?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </Form>

      <div className="mt-8 text-center text-sm text-neutral-600">
        Não tem uma conta?{' '}
        <Link to="/auth/register" className="text-sky-500 hover:underline font-medium">
          Registre-se
        </Link>
      </div>
    </AuthLayout>
  );
};
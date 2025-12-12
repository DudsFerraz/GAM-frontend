import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from '@tanstack/react-router';
import { register } from '@/features/auth/api/register';
import { AuthLayout } from './authLayout';
import { Button, Input } from '@/components/ui/index';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AxiosError } from 'axios';

const registerSchema = z.object({
  displayName: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.email("Digite um e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await register({
        displayName: values.displayName,
        email: values.email,
        password: values.password,
      });

      navigate({ to: '/auth/login' });
      
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
    // 1. Removemos todas as props de imagem e texto. Agora é só abrir e fechar a tag.
    <AuthLayout>
      <div className="mb-8 text-center sm:text-left">
        <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 mb-2">
          Crie sua conta
        </h2>
        <p className="text-xl text-neutral-600">
          Preencha os dados abaixo para começar.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-600 text-sm rounded-md">
          {errorMessage}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Campo: Nome */}
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome de exibição</FormLabel>
                <FormControl>
                  <Input placeholder="Como você quer ser chamado?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <div className="grid gap-5 md:grid-cols-2">
            {/* Campo: Senha */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Confirmar Senha */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Criando conta..." : "Registrar"}
          </Button>
        </form>
      </Form>

      <div className="mt-8 text-center text-sm text-neutral-600">
        Já tem uma conta?{' '}
        <Link to="/auth/login" className="text-sky-500 hover:underline font-medium">
          Entrar
        </Link>
      </div>
    </AuthLayout>
  );
};
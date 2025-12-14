import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from '@tanstack/react-router'; 
import { AuthLayout } from './authLayout';
import { Button, Input } from '@/components/ui/index';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getErrorMessage } from '@/utils/errorHandler';
import { FormError } from '@/components/ui/formError';
import { useRegister } from '../hooks/useRegister';
import { RedirectFeedback } from '@/components/ui/redirectFeedback';

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
  const [serverError, setServerError] = useState<string | null>(null);
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);
  const { mutate: doRegister, isPending } = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = (values: RegisterFormValues) => {
    setServerError(null);
    doRegister(
      { displayName: values.displayName, email: values.email, password: values.password },
      {
        onSuccess: () => setShowSuccessFeedback(true),
        onError: (error) => setServerError(getErrorMessage(error))
      }
    );
  };

  return (
    <AuthLayout>
      <div className="mb-8 text-center sm:text-left">
        <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
          Crie sua conta
        </h2>
        
        <p className="text-xl text-muted-foreground">
          Preencha os dados abaixo para começar.
        </p>
      </div>

      {serverError && <FormError message={serverError} />}      

      <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de exibição</FormLabel>
                  <FormControl>
                    <Input placeholder="Como você quer ser chamado?" autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="seu@email.com" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-5 md:grid-cols-2">
               <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Criando conta..." : "Registrar"}
            </Button>
         </form>
      </Form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Já tem uma conta?{' '}
        <Link to="/auth/login" className="text-primary hover:underline font-medium hover:text-primary/90">
          Entrar
        </Link>
      </div>

      <RedirectFeedback
        isVisible={showSuccessFeedback}
        title="Cadastro realizado!"
        description="Sua conta foi criada com sucesso. Agora você já pode fazer login para acessar a plataforma."
        buttonText="Realizar Login"
        redirectUrl="/auth/login"
      />

    </AuthLayout>
  );
};
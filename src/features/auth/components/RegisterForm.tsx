import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@tanstack/react-router'; 
import { AuthLayout } from './AuthLayout';
import { Button } from '@/components/ui/Button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/lib/http';
import { FormError } from './FormError';
import { useRegister } from '../hooks/useRegister';
import { RedirectFeedback } from './RedirectFeedback';
import {
  registerSchema,
  type RegisterFormValues,
} from '../schemas/registerSchema';

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

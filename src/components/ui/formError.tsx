import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FormErrorProps {
  message?: string | null;
}

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;

  return (
    <Alert 
      variant="destructive" 
      className="mb-6 bg-red-50 border-red-200 text-red-800"
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
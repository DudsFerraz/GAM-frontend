import { useNavigate } from '@tanstack/react-router';

export const useRedirectFeedback = () => {
  const navigate = useNavigate();

  const triggerRedirect = (destinationUrl: string) => {
    navigate({ to: destinationUrl });
  };

  return { triggerRedirect };
};
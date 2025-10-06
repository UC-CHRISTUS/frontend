import { redirect } from 'next/navigation';

export default function NotFound() {
  // Redirección automática al dashboard
  redirect('/dashboard');
}
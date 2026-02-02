import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('ccycle_user_id')?.value;

  if (userId) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}

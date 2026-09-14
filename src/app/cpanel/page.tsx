import { redirect } from 'next/navigation';

export default function CpanelIndexPage() {
  redirect('/admin/users');
}

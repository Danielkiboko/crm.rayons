import type { Metadata } from 'next';
import '../styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CrmProvider } from '@/context/CrmContext';
import AppLayout from '@/components/AppLayout';

export const metadata: Metadata = {
  title: 'CRM Rayons - SMPP, RCS & Emailing SaaS All-in-One',
  description: 'Plateforme SaaS tout-en-un : SMPP direct opérateur, RCS Google RBM, Cold Email standard Lemlist et Pipeline commercial.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <CrmProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </CrmProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

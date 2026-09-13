import type { Metadata } from 'next';
import '../styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CrmProvider } from '@/context/CrmContext';
import AppLayout from '@/components/AppLayout';

export const metadata: Metadata = {
  title: 'LemFlow CRM - Plateforme de Prospection Multicanale & Deliverabilité',
  description: 'CRM d\'outreach multicanal tout-en-un inspiré de Lemlist : Cold Email, Automatisation LinkedIn, Images Personnalisées, Warmup et Pipeline commercial.',
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

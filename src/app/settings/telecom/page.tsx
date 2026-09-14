'use client';

import React, { useState } from 'react';
import { 
  Radio, 
  Smartphone, 
  Send, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink,
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { TelecomRouteConfig } from '@/types';

export default function TelecomSettingsPage() {
  const [copiedWebhook, setCopiedWebhook] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'routes' | 'simulator' | 'api-docs'>('routes');

  // Telecom routes list
  const [routes, setRoutes] = useState<TelecomRouteConfig[]>([
    {
      id: 'route-orange',
      name: 'Orange Direct SMSC (HTTP/REST)',
      channel: 'sms',
      endpointUrl: 'https://api.orange.com/smsmessaging/v1/outbound/tel:+243/requests',
      authType: 'bearer',
      apiToken: 'ora_live_tok_9918237192',
      senderId: 'RAYONS',
      status: 'active',
      tpsLimit: 50,
      webhookUrl: 'https://crm.rayons.net/api/telecom/sms/callback',
      createdAt: '2026-09-13T10:00:00Z'
    },
    {
      id: 'route-vodacom',
      name: 'Vodacom Telecom Direct Gateway',
      channel: 'sms',
      endpointUrl: 'https://api.vodacom.cd/sms/direct/v2/send',
      authType: 'apiKey',
      apiToken: 'voda_cd_9921_sec',
      senderId: 'RAYONS',
      status: 'active',
      tpsLimit: 100,
      webhookUrl: 'https://crm.rayons.net/api/telecom/sms/callback',
      createdAt: '2026-09-13T11:00:00Z'
    },
    {
      id: 'route-google-rbm',
      name: 'Google RCS Business Messaging (RBM / Jibe)',
      channel: 'rcs',
      endpointUrl: 'https://rcsbusinessmessaging.googleapis.com/v1/phones',
      authType: 'bearer',
      apiToken: 'ya29.rbm_service_account_token',
      senderId: 'Rayons Solutions',
      rcsBotId: 'rayons-bot@rbm.goog',
      status: 'active',
      tpsLimit: 200,
      webhookUrl: 'https://crm.rayons.net/api/telecom/rcs/callback',
      createdAt: '2026-09-13T12:00:00Z'
    }
  ]);

  // New Route Form
  const [isAddingRoute, setIsAddingRoute] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteChannel, setNewRouteChannel] = useState<'sms' | 'rcs'>('sms');
  const [newRouteUrl, setNewRouteUrl] = useState('');
  const [newRouteSender, setNewRouteSender] = useState('RAYONS');
  const [newRouteToken, setNewRouteToken] = useState('');
  const [newRouteBotId, setNewRouteBotId] = useState('');

  // Live Simulator State
  const [simChannel, setSimChannel] = useState<'sms' | 'rcs'>('rcs');
  const [simPhone, setSimPhone] = useState('+243 810 000 123');
  const [simSmsText, setSimSmsText] = useState('Bonjour Thomas, découvrez la nouvelle plateforme CRM multicanal Rayons avec SMS et RCS direct opérateur. Répondez STOP pour vous désabonner.');
  const [simRcsTitle, setSimRcsTitle] = useState('Rayons CRM | Outreach Haute Conversion');
  const [simRcsDesc, setSimRcsDesc] = useState('Bonjour Thomas, accélérez vos ventes grâce aux routes directes télécom sans aucun intermédiaire. Planifiez votre démo interactive.');
  const [simRcsMedia, setSimRcsMedia] = useState('https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80');
  const [isSendingSim, setIsSendingSim] = useState(false);
  const [simNotice, setSimNotice] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWebhook(id);
    setTimeout(() => setCopiedWebhook(null), 2500);
  };

  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteName || !newRouteUrl) return;

    const newRoute: TelecomRouteConfig = {
      id: `route-${Date.now()}`,
      name: newRouteName,
      channel: newRouteChannel,
      endpointUrl: newRouteUrl,
      authType: 'bearer',
      apiToken: newRouteToken,
      senderId: newRouteSender,
      rcsBotId: newRouteChannel === 'rcs' ? newRouteBotId : undefined,
      status: 'active',
      tpsLimit: 50,
      webhookUrl: newRouteChannel === 'sms' 
        ? 'https://crm.rayons.net/api/telecom/sms/callback'
        : 'https://crm.rayons.net/api/telecom/rcs/callback',
      createdAt: new Date().toISOString()
    };

    setRoutes([...routes, newRoute]);
    setIsAddingRoute(false);
    setNewRouteName('');
    setNewRouteUrl('');
    setNewRouteToken('');
  };

  const handleSendSimulatedTest = async () => {
    setIsSendingSim(true);
    setSimNotice(null);
    try {
      if (simChannel === 'sms') {
        const res = await fetch('/api/telecom/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: simPhone,
            message: simSmsText,
            senderId: 'RAYONS'
          })
        });
        const data = await res.json();
        setSimNotice(`SMS envoyé avec succès via la route directe opérateur ! ID: ${data.messageId}`);
      } else {
        const res = await fetch('/api/telecom/rcs/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: simPhone,
            title: simRcsTitle,
            description: simRcsDesc,
            mediaUrl: simRcsMedia,
            suggestions: [
              { type: 'reply', text: 'Prendre rendez-vous' },
              { type: 'url', text: 'Voir la Démo', url: 'https://rayons.net' }
            ]
          })
        });
        const data = await res.json();
        setSimNotice(`Carte enrichie Google RCS transmise à l'agent Jibe Cloud ! ID: ${data.messageId}`);
      }
    } catch (e: any) {
      setSimNotice(`Erreur: ${e.message}`);
    } finally {
      setIsSendingSim(false);
      setTimeout(() => setSimNotice(null), 6000);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Routes Directes Télécom & RCS</h1>
            <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>ZERO INTERMÉDIAIRE</span>
            <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>GOOGLE RBM JIBE</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '750px' }}>
            Vous êtes l'intégrateur direct connecté aux serveurs SMSC des opérateurs télécoms (Orange, Vodacom, Airtel, MTN) et au Cloud Google RCS Business Messaging, sans aucun courtier externe.
          </p>
        </div>

        <button 
          onClick={() => setIsAddingRoute(!isAddingRoute)} 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isAddingRoute ? 'Fermer' : <><Plus size={16} /> Interconnecter un Opérateur</>}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '28px'
      }}>
        {[
          { id: 'routes', label: 'Passerelles Opérateurs Connectées', icon: Radio, badge: routes.length },
          { id: 'simulator', label: 'Simulateur Smartphone Direct (SMS & RCS)', icon: Smartphone, badge: 'TEST' },
          { id: 'api-docs', label: 'Spécifications & Webhooks NOC', icon: ExternalLink, badge: 'API' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid #ffffff' : '2px solid transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} />
              {tab.label}
              {tab.badge && (
                <span className="badge" style={{
                  fontSize: '0.68rem',
                  background: isActive ? '#ffffff' : 'rgba(255,255,255,0.08)',
                  color: isActive ? '#000000' : '#ffffff'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ROUTES MANAGEMENT */}
      {activeTab === 'routes' && (
        <div>
          {/* Add Route Form */}
          {isAddingRoute && (
            <div className="card" style={{ marginBottom: '28px', borderColor: 'rgba(255,255,255,0.3)', animation: 'fadeIn 0.2s ease' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={18} />
                Nouvelle Interconnexion Télécom Directe
              </h2>

              <form onSubmit={handleAddRoute} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="label">Nom de l'opérateur ou du protocole *</label>
                    <input 
                      type="text" 
                      value={newRouteName} 
                      onChange={(e) => setNewRouteName(e.target.value)} 
                      className="input" 
                      placeholder="Ex: Airtel Direct Gateway / SMPP" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="label">Canal Télécom *</label>
                    <select 
                      value={newRouteChannel} 
                      onChange={(e) => setNewRouteChannel(e.target.value as any)} 
                      className="input"
                    >
                      <option value="sms">SMS Marketing (SMSC Direct)</option>
                      <option value="rcs">Google RCS Business Messaging (RBM)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="label">URL Endpoint de l'opérateur (HTTP/REST ou SMPP Bridge) *</label>
                    <input 
                      type="text" 
                      value={newRouteUrl} 
                      onChange={(e) => setNewRouteUrl(e.target.value)} 
                      className="input" 
                      placeholder="https://smsc.airtel.africa/api/v1/send" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="label">Sender ID (Expéditeur Alphanumérique) *</label>
                    <input 
                      type="text" 
                      value={newRouteSender} 
                      onChange={(e) => setNewRouteSender(e.target.value)} 
                      className="input" 
                      placeholder="RAYONS" 
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="label">Token d'authentification opérateur (Bearer / API Key)</label>
                    <input 
                      type="password" 
                      value={newRouteToken} 
                      onChange={(e) => setNewRouteToken(e.target.value)} 
                      className="input" 
                      placeholder="••••••••••••••••" 
                    />
                  </div>
                  {newRouteChannel === 'rcs' && (
                    <div>
                      <label className="label">Identifiant Bot RBM (Google RCS)</label>
                      <input 
                        type="text" 
                        value={newRouteBotId} 
                        onChange={(e) => setNewRouteBotId(e.target.value)} 
                        className="input" 
                        placeholder="rayons-bot@rbm.goog" 
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setIsAddingRoute(false)} className="btn btn-secondary">
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Valider l'Interconnexion
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of active routes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {routes.map(route => (
              <div key={route.id} className="card" style={{ border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-sm)',
                      background: route.channel === 'rcs' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: route.channel === 'rcs' ? '#60a5fa' : '#ffffff'
                    }}>
                      {route.channel === 'rcs' ? <Sparkles size={20} /> : <Radio size={20} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{route.name}</span>
                        <span className="badge" style={{
                          fontSize: '0.68rem',
                          background: route.channel === 'rcs' ? '#2563eb' : 'rgba(255,255,255,0.1)',
                          color: '#ffffff'
                        }}>
                          {route.channel.toUpperCase()} DIRECT
                        </span>
                        <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                          <CheckCircle2 size={11} /> OPÉRATIONNEL
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>
                        {route.endpointUrl}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Débit autorisé</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{route.tpsLimit} msg/seconde</div>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Supprimer la route ${route.name} ?`)) {
                          setRoutes(routes.filter(r => r.id !== route.id));
                        }
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Specifications strip */}
                <div style={{
                  marginTop: '14px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Sender ID : </span>
                    <strong style={{ color: '#fff' }}>{route.senderId}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Type Auth : </span>
                    <span style={{ textTransform: 'uppercase' }}>{route.authType}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Webhook Inbound : </span>
                    <span style={{ fontFamily: 'monospace' }}>/api/telecom/{route.channel}/callback</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE SMARTPHONE SIMULATOR */}
      {activeTab === 'simulator' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }}>
          {/* Controls Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
              Tester l'Expédition Télécom en Direct
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Testez l'envoi d'un message direct vers votre route opérateur ou Google RCS.
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setSimChannel('rcs')}
                className={simChannel === 'rcs' ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Sparkles size={15} /> Google RCS (Rich Card)
              </button>
              <button
                type="button"
                onClick={() => setSimChannel('sms')}
                className={simChannel === 'sms' ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <MessageSquare size={15} /> SMS Direct (GSM 7-bit)
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Numéro destinataire (format international)</label>
                <input 
                  type="text" 
                  value={simPhone} 
                  onChange={(e) => setSimPhone(e.target.value)} 
                  className="input" 
                />
              </div>

              {simChannel === 'sms' ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="label">Contenu du message SMS</label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {simSmsText.length} caractères ({Math.ceil(simSmsText.length / 160)} SMS)
                    </span>
                  </div>
                  <textarea 
                    rows={5}
                    value={simSmsText} 
                    onChange={(e) => setSimSmsText(e.target.value)} 
                    className="input" 
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="label">Titre de la Carte RCS</label>
                    <input 
                      type="text" 
                      value={simRcsTitle} 
                      onChange={(e) => setSimRcsTitle(e.target.value)} 
                      className="input" 
                    />
                  </div>
                  <div>
                    <label className="label">Description / Corps de la Carte</label>
                    <textarea 
                      rows={3}
                      value={simRcsDesc} 
                      onChange={(e) => setSimRcsDesc(e.target.value)} 
                      className="input" 
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <label className="label">URL Média (Image d'en-tête)</label>
                    <input 
                      type="text" 
                      value={simRcsMedia} 
                      onChange={(e) => setSimRcsMedia(e.target.value)} 
                      className="input" 
                    />
                  </div>
                </>
              )}

              <button 
                onClick={handleSendSimulatedTest}
                disabled={isSendingSim}
                className="btn btn-primary"
                style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Send size={15} />
                {isSendingSim ? 'Transmission opérateur...' : 'Déclencher l\'Envoi Direct'}
              </button>

              {simNotice && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10b981',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={16} />
                  {simNotice}
                </div>
              )}
            </div>
          </div>

          {/* Smartphone Simulator Preview Frame */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '320px',
              height: '590px',
              background: '#09090b',
              border: '8px solid #27272a',
              borderRadius: '36px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {/* Dynamic Island / Notch */}
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90px',
                height: '18px',
                background: '#000000',
                borderRadius: '10px',
                zIndex: 20
              }} />

              {/* Status Bar */}
              <div style={{
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px 0 20px',
                fontSize: '0.72rem',
                color: '#a1a1aa',
                zIndex: 10
              }}>
                <span>09:41</span>
                <span>5G • 100%</span>
              </div>

              {/* Messenger Header */}
              <div style={{
                padding: '12px 16px',
                background: '#18181b',
                borderBottom: '1px solid #27272a',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#000',
                  border: '1px solid #3f3f46',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  color: '#fff'
                }}>
                  R
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>RAYONS</span>
                    {simChannel === 'rcs' && (
                      <CheckCircle2 size={12} color="#3b82f6" />
                    )}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#71717a' }}>
                    {simChannel === 'rcs' ? 'RCS vérifié par Google' : 'SMS direct'}
                  </div>
                </div>
              </div>

              {/* Message Chat Content Area */}
              <div style={{ flex: 1, padding: '14px', overflowY: 'auto' }}>
                <div style={{ fontSize: '0.65rem', color: '#71717a', textAlign: 'center', marginBottom: '14px' }}>
                  Aujourd'hui 09:41
                </div>

                {simChannel === 'sms' ? (
                  /* Plain SMS Bubble */
                  <div style={{
                    maxWidth: '85%',
                    background: '#27272a',
                    padding: '10px 12px',
                    borderRadius: '16px 16px 16px 4px',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    lineHeight: '1.4',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {simSmsText}
                    <div style={{ fontSize: '0.6rem', color: '#a1a1aa', textAlign: 'right', marginTop: '4px' }}>
                      09:41
                    </div>
                  </div>
                ) : (
                  /* RCS Rich Card */
                  <div style={{
                    maxWidth: '92%',
                    background: '#18181b',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #27272a',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                  }}>
                    {simRcsMedia && (
                      <div style={{ width: '100%', height: '110px', overflow: 'hidden' }}>
                        <img 
                          src={simRcsMedia} 
                          alt="RCS Rich Card" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                    )}
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#ffffff', marginBottom: '4px' }}>
                        {simRcsTitle}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#a1a1aa', lineHeight: '1.35', marginBottom: '10px' }}>
                        {simRcsDesc}
                      </div>

                      {/* RCS Quick Suggestion Action Chips */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <button style={{
                          padding: '7px 10px',
                          background: '#27272a',
                          border: '1px solid #3f3f46',
                          borderRadius: '8px',
                          color: '#60a5fa',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}>
                          📅 Prendre rendez-vous
                        </button>
                        <button style={{
                          padding: '7px 10px',
                          background: '#27272a',
                          border: '1px solid #3f3f46',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}>
                          🌐 Voir la Démo Interactive
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Input Simulation */}
              <div style={{
                padding: '10px 14px',
                background: '#18181b',
                borderTop: '1px solid #27272a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  flex: 1,
                  background: '#27272a',
                  borderRadius: '16px',
                  padding: '6px 12px',
                  fontSize: '0.7rem',
                  color: '#71717a'
                }}>
                  {simChannel === 'rcs' ? 'Message RCS...' : 'Message texte...'}
                </div>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000000'
                }}>
                  <Send size={12} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: API SPECIFICATIONS & WEBHOOKS FOR NOC OPERATORS */}
      {activeTab === 'api-docs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
              Webhooks & Endpoints de Rappel pour Opérateurs
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Fournissez ces URLs sécurisées à vos équipes réseau télécom (NOC Orange, Vodacom, etc.) pour qu'ils vous renvoient les accusés de réception et réponses clients directement dans votre CRM.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                padding: '14px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Webhook SMS DLR & Réponses (MO SMS)</span>
                  <button 
                    onClick={() => handleCopy('https://crm.rayons.net/api/telecom/sms/callback', 'sms-cb')} 
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {copiedWebhook === 'sms-cb' ? <Check size={13} /> : <Copy size={13} />}
                    {copiedWebhook === 'sms-cb' ? 'Copié !' : 'Copier l\'URL'}
                  </button>
                </div>
                <code style={{ fontSize: '0.82rem', color: '#fff', background: '#000', padding: '4px 8px', borderRadius: '4px', display: 'block' }}>
                  https://crm.rayons.net/api/telecom/sms/callback
                </code>
              </div>

              <div style={{
                padding: '14px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Webhook Google RCS Business Messaging (RBM Callback)</span>
                  <button 
                    onClick={() => handleCopy('https://crm.rayons.net/api/telecom/rcs/callback', 'rcs-cb')} 
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {copiedWebhook === 'rcs-cb' ? <Check size={13} /> : <Copy size={13} />}
                    {copiedWebhook === 'rcs-cb' ? 'Copié !' : 'Copier l\'URL'}
                  </button>
                </div>
                <code style={{ fontSize: '0.82rem', color: '#fff', background: '#000', padding: '4px 8px', borderRadius: '4px', display: 'block' }}>
                  https://crm.rayons.net/api/telecom/rcs/callback
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

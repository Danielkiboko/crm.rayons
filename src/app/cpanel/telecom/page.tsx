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
  AlertCircle,
  Lock
} from 'lucide-react';
import { TelecomRouteConfig } from '@/types';
import { analyzeSmsText, cleanSmsText } from '@/lib/smsUtils';

export default function CpanelTelecomPage() {
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
  const [simRcsMedia, setSimRcsMedia] = useState('');
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

  const handleDeleteRoute = (id: string, name: string) => {
    if (confirm(`Supprimer la passerelle télécom "${name}" ?`)) {
      setRoutes(routes.filter(r => r.id !== id));
    }
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
            senderId: 'RAYONS',
            autoCleanGsm: true
          })
        });
        const data = await res.json();
        setSimNotice(`SMS (${data.encoding || 'GSM-7'}, ${data.partsCount || 1} SMS) délivré au SMSC ! ID: ${data.messageId}`);
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
    <div style={{ maxWidth: '1150px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Routes Télécom Opérateurs & RCS (C-Panel Admin)</h1>
            <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>INFRASTRUCTURE SAAS</span>
            <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>SMPP & RBM JIBE</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '750px' }}>
            Configuration centrale des passerelles SMSC (Orange, Vodacom, Airtel) et Google RCS RBM. Ces routes alimentent l'ensemble des campagnes clients du CRM avec débit haute vitesse sans intermédiaire.
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
                      {route.channel === 'rcs' ? <MessageSquare size={20} /> : <Radio size={20} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{route.name}</h3>
                        <span className={`badge ${route.channel === 'rcs' ? 'badge-primary' : ''}`} style={{ fontSize: '0.65rem' }}>
                          {route.channel.toUpperCase()} DIRECT
                        </span>
                        <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>OPÉRATIONNEL</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'monospace' }}>
                        Endpoint: {route.endpointUrl} · Sender: <strong>{route.senderId}</strong> · TPS: <strong>{route.tpsLimit}/s</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => handleCopy(route.endpointUrl, route.id)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      title="Copier le endpoint"
                    >
                      {copiedWebhook === route.id ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                      {copiedWebhook === route.id ? 'Copié' : 'Endpoint'}
                    </button>
                    <button
                      onClick={() => handleDeleteRoute(route.id, route.name)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
                      title="Supprimer cette route"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE SMARTPHONE SIMULATOR */}
      {activeTab === 'simulator' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
          {/* Controls */}
          <div className="card">
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={18} />
              Banc d'Essai Télécom & RBM Jibe
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '20px', lineHeight: '1.5' }}>
              Testez vos passerelles en direct vers un numéro réel ou de test pour vérifier la délivrabilité immédiate SMSC et le rendu de la carte enrichie RCS.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label">Numéro de Téléphone Mobile Destinataire</label>
                <input 
                  type="text" 
                  value={simPhone} 
                  onChange={(e) => setSimPhone(e.target.value)} 
                  className="input" 
                  placeholder="+243 810 000 123" 
                />
              </div>

              <div>
                <label className="label">Canal à tester</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSimChannel('rcs')}
                    className={`btn ${simChannel === 'rcs' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center' }}
                  >
                    Google RCS (Carte Rich Media)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimChannel('sms')}
                    className={`btn ${simChannel === 'sms' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center' }}
                  >
                    SMS Texte Standard
                  </button>
                </div>
              </div>

              {simChannel === 'rcs' ? (
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
                    <label className="label">Message / Description RCS</label>
                    <textarea 
                      value={simRcsDesc} 
                      onChange={(e) => setSimRcsDesc(e.target.value)} 
                      className="input" 
                      rows={3} 
                    />
                  </div>
                </>
              ) : (
                <div>
                  {(() => {
                    const analysis = analyzeSmsText(simSmsText);
                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <label className="label" style={{ marginBottom: 0 }}>Contenu du SMS</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {analysis.isGsm7 ? (
                              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                                ✓ GSM-7 Standard (160 car./SMS)
                              </span>
                            ) : (
                              <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                                ⚠️ Mode UCS-2 Unicode (70 car./SMS)
                              </span>
                            )}
                            <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.08)' }}>
                              {analysis.partsCount} SMS · {analysis.remainingInPart} car. restants
                            </span>
                          </div>
                        </div>

                        <textarea 
                          value={simSmsText} 
                          onChange={(e) => setSimSmsText(e.target.value)} 
                          className="input" 
                          rows={4} 
                        />

                        {/* Non-GSM Character Alert & 1-Click Cleaner */}
                        {!analysis.isGsm7 && (
                          <div style={{
                            marginTop: '8px',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '10px'
                          }}>
                            <div style={{ fontSize: '0.76rem', color: '#fca5a5' }}>
                              Caractères spéciaux détectés :{' '}
                              <strong>{analysis.nonGsmCharacters.map(c => `"${c}"`).join(', ')}</strong>
                              <br />
                              <span style={{ color: 'var(--text-muted)' }}>
                                Forcent l'encodage UCS-2 (coût facturé plus élevé et risque de "?" sur certains opérateurs).
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSimSmsText(cleanSmsText(simSmsText))}
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '0.72rem', whiteSpace: 'nowrap', padding: '5px 10px', background: '#dc2626', borderColor: '#ef4444' }}
                            >
                              ✨ Convertir en GSM-7
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {simNotice && (
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10b981',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={16} />
                  {simNotice}
                </div>
              )}

              <button
                type="button"
                onClick={handleSendSimulatedTest}
                disabled={isSendingSim}
                className="btn btn-primary"
                style={{ height: '44px', marginTop: '6px' }}
              >
                {isSendingSim ? (
                  <>
                    <RefreshCw size={16} className="spin" style={{ marginRight: '8px' }} />
                    Transmission en cours vers l'opérateur...
                  </>
                ) : (
                  <>
                    <Send size={16} style={{ marginRight: '8px' }} />
                    Déclencher l'Envoi Test Réel
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Smartphone Simulator Preview */}
          <div style={{
            background: '#0a0a0a',
            border: '2px solid #27272a',
            borderRadius: '36px',
            padding: '16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            maxWidth: '340px',
            margin: '0 auto'
          }}>
            {/* Phone Notch */}
            <div style={{ width: '100px', height: '14px', background: '#27272a', borderRadius: '8px', margin: '0 auto 16px' }} />

            {/* Screen Header */}
            <div style={{ textAlign: 'center', borderBottom: '1px solid #27272a', paddingBottom: '12px', marginBottom: '14px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>
                {simChannel === 'rcs' ? 'Rayons Solutions (Vérifié)' : 'RAYONS'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '2px' }}>
                <CheckCircle2 size={11} /> {simChannel === 'rcs' ? 'RCS Business Messaging' : 'SMS Direct Opérateur'}
              </div>
            </div>

            {/* Chat Bubble Area */}
            <div style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '10px' }}>
              {simChannel === 'sms' ? (
                <div style={{
                  background: '#27272a',
                  color: '#ffffff',
                  padding: '12px 14px',
                  borderRadius: '16px 16px 4px 16px',
                  fontSize: '0.78rem',
                  lineHeight: '1.4',
                  maxWidth: '90%',
                  alignSelf: 'flex-end'
                }}>
                  {simSmsText}
                </div>
              ) : (
                <div style={{
                  background: '#1e293b',
                  borderRadius: '16px',
                  border: '1px solid #334155',
                  overflow: 'hidden',
                  maxWidth: '96%',
                  alignSelf: 'flex-end'
                }}>
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff', marginBottom: '4px' }}>
                      {simRcsTitle}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                      {simRcsDesc}
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #334155', padding: '6px' }}>
                    <button style={{ width: '100%', padding: '6px', background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                      Prendre rendez-vous
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Phone Bottom Bar */}
            <div style={{ width: '110px', height: '4px', background: '#52525b', borderRadius: '4px', margin: '20px auto 4px' }} />
          </div>
        </div>
      )}

      {/* TAB 3: API DOCS & WEBHOOKS */}
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

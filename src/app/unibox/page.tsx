'use client';

import React, { useState } from 'react';
import { 
  Inbox, 
  Search, 
  Linkedin, 
  Mail, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  KanbanSquare, 
  CornerUpLeft, 
  Smile, 
  Building2, 
  Phone,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';
import { UniboxMessage } from '@/types';

export default function UniboxPage() {
  const { 
    messages, 
    markMessageRead, 
    sendReply, 
    changeMessageSentiment, 
    createDeal, 
    deals,
    syncInboxReplies,
    emailAccounts 
  } = useCrm();

  const defaultAccount = emailAccounts.find(a => a.isDefault) || emailAccounts[0];

  const [selectedMessageId, setSelectedMessageId] = useState<string>(messages[0]?.id || '');
  const [filterChannel, setFilterChannel] = useState<'all' | 'email' | 'linkedin'>('all');
  const [filterSentiment, setFilterSentiment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncReplies = async () => {
    setIsSyncing(true);
    const res = await syncInboxReplies();
    setIsSyncing(false);
    if (res.success && res.newCount > 0) {
      setToastMessage(`${res.newCount} nouvelle(s) réponse(s) synchronisée(s) depuis votre boîte e-mail !`);
    } else {
      setToastMessage('Boîte e-mail synchronisée. Aucune nouvelle réponse pour le moment.');
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter messages
  const filteredMessages = messages.filter(m => {
    const matchesChannel = filterChannel === 'all' || m.channel === filterChannel;
    const matchesSentiment = filterSentiment === 'all' || m.sentiment === filterSentiment;
    const matchesSearch = 
      m.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.leadCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesSentiment && matchesSearch;
  });

  const selectedMessage = messages.find(m => m.id === selectedMessageId) || filteredMessages[0];

  const handleSelectMessage = (msg: UniboxMessage) => {
    setSelectedMessageId(msg.id);
    if (!msg.read) {
      markMessageRead(msg.id);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessage) return;

    sendReply(selectedMessage.id, replyText);
    setReplyText('');
    setToastMessage(`Réponse envoyée avec succès via ${selectedMessage.channel === 'linkedin' ? 'LinkedIn' : 'Email'} !`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePushToCrm = () => {
    if (!selectedMessage) return;
    // Check if already in deals
    const existing = deals.find(d => d.leadId === selectedMessage.leadId);
    if (existing) {
      alert(`Ce prospect a déjà un deal en cours : "${existing.title}"`);
      return;
    }

    createDeal({
      title: `Opportunité ${selectedMessage.leadCompany}`,
      leadId: selectedMessage.leadId,
      leadName: selectedMessage.leadName,
      company: selectedMessage.leadCompany,
      value: 15000,
      stage: selectedMessage.sentiment === 'meeting_booked' ? 'demo_booked' : 'qualified',
      assignedTo: 'Alexandre (Moi)',
      expectedCloseDate: '2026-10-31'
    });

    setToastMessage(`Opportunité de 15 000 € créée dans le Pipeline CRM pour ${selectedMessage.leadCompany} !`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#000000',
          border: '1px solid #ffffff',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Unibox Centralisée</h1>
            <span className="badge">
              <Inbox size={13} /> Flux Multicanal
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Gestion centralisée de l'ensemble des réponses emails et conversations LinkedIn.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setFilterChannel('all')} 
            className={filterChannel === 'all' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          >
            Tous
          </button>
          <button 
            onClick={() => setFilterChannel('email')} 
            className={filterChannel === 'email' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          >
            <Mail size={13} /> Emails
          </button>
          <button 
            onClick={() => setFilterChannel('linkedin')} 
            className={filterChannel === 'linkedin' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          >
            <Linkedin size={13} /> LinkedIn
          </button>

          <button 
            onClick={handleSyncReplies} 
            disabled={isSyncing}
            className="btn btn-sm"
            style={{ 
              background: '#ffffff', 
              color: '#000000', 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              marginLeft: '8px' 
            }}
            title="Synchroniser la boîte de réception IMAP"
          >
            <RefreshCw size={13} className={isSyncing ? 'spin' : ''} />
            {isSyncing ? 'Synchronisation...' : 'Synchroniser Réponses'}
          </button>
        </div>
      </div>

      {/* Master Detail Split View */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '380px 1fr',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-card)',
        overflow: 'hidden'
      }}>
        {/* Left: Message List */}
        <div style={{
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          background: '#050505'
        }}>
          {/* Search & Sentiment Filters */}
          <div style={{ padding: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input 
                type="text" 
                placeholder="Rechercher une conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
                style={{ paddingLeft: '32px', height: '34px', fontSize: '0.8rem' }}
              />
            </div>

            <select 
              value={filterSentiment} 
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="select"
              style={{ padding: '4px 8px', fontSize: '0.75rem', height: '30px' }}
            >
              <option value="all">Tous les sentiments</option>
              <option value="meeting_booked">Rdv réservé</option>
              <option value="interested">Intéressé</option>
              <option value="out_of_office">Absent du bureau</option>
            </select>
          </div>

          {/* Conversation Items */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredMessages.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  style={{
                    padding: '14px',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    background: isSelected 
                      ? '#141414' 
                      : !msg.read 
                        ? 'rgba(255, 255, 255, 0.04)' 
                        : 'transparent',
                    borderLeft: isSelected ? '2px solid #ffffff' : '2px solid transparent',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {msg.channel === 'linkedin' ? <Linkedin size={13} color="#ffffff" /> : <Mail size={13} color="#ffffff" />}
                      <span style={{ fontWeight: !msg.read ? 700 : 600, fontSize: '0.85rem', color: '#ffffff' }}>
                        {msg.leadName}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '4px' }}>
                    {msg.leadCompany}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {msg.snippet}
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    <span className="badge" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                      {msg.sentiment === 'meeting_booked' ? 'Rdv réservé' :
                       msg.sentiment === 'interested' ? 'Intéressé' : 'Absence'}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredMessages.length === 0 && (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Aucune conversation trouvée.
              </div>
            )}
          </div>
        </div>

        {/* Right: Message Thread & Lead Profile */}
        {selectedMessage ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Conversation Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.01)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{selectedMessage.leadName}</h2>
                  <span className="badge badge-primary">{selectedMessage.leadCompany}</span>
                  <span className={selectedMessage.channel === 'linkedin' ? 'badge badge-linkedin' : 'badge badge-email'}>
                    {selectedMessage.channel === 'linkedin' ? 'LinkedIn Message' : 'Email Thread'}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                  Campagne source : {selectedMessage.campaignName || 'Séquence Directe'} • {selectedMessage.leadEmail}
                </div>
              </div>

              {/* Action: Push to CRM Deal */}
              <button onClick={handlePushToCrm} className="btn btn-primary btn-sm">
                <KanbanSquare size={15} />
                Créer Deal dans le CRM
              </button>
            </div>

            {/* Conversation Messages Thread */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Previous Outbound sequence message */}
              <div style={{
                maxWidth: '80%',
                alignSelf: 'flex-end',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '16px 16px 4px 16px',
                padding: '16px',
                fontSize: '0.85rem',
                lineHeight: '1.5'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#a5b4fc', marginBottom: '6px', fontWeight: 600 }}>
                  Vous (Campagne automatisée LemFlow)
                </div>
                <div>
                  Bonjour {selectedMessage.leadName.split(' ')[0]}, seriez-vous disponible pour échanger 15 minutes autour de vos objectifs pour {selectedMessage.leadCompany} ?
                </div>
              </div>

              {/* Inbound Reply */}
              <div style={{
                maxWidth: '85%',
                alignSelf: 'flex-start',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px 16px 16px 4px',
                padding: '16px',
                fontSize: '0.88rem',
                lineHeight: '1.6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: 'white' }}>{selectedMessage.leadName}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                    {new Date(selectedMessage.timestamp).toLocaleString('fr-FR')}
                  </span>
                </div>

                <div style={{ whiteSpace: 'pre-line', color: '#f1f5f9' }}>
                  {selectedMessage.content}
                </div>
              </div>
            </div>

            {/* Reply Composer */}
            <form onSubmit={handleSendReply} style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CornerUpLeft size={14} />
                  Répondre via {selectedMessage.channel === 'linkedin' ? 'LinkedIn' : selectedMessage.leadEmail}
                </span>

                {/* Quick AI reply assist */}
                <button
                  type="button"
                  onClick={() => setReplyText(`Bonjour ${selectedMessage.leadName.split(' ')[0]},\n\nMerci beaucoup pour votre retour ! C'est noté avec grand plaisir. Je vous transmets le lien direct pour caler notre créneau : https://cal.com/alexandre/15min\n\nÀ très vite !`)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                >
                  <Sparkles size={12} color="#c084fc" /> Insérer proposition de créneau
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <textarea 
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Rédigez votre réponse ici..."
                  className="textarea"
                  style={{ flex: 1, resize: 'none' }}
                />
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', height: '42px' }}>
                  <Send size={16} />
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Sélectionnez une conversation pour voir le fil
          </div>
        )}
      </div>
    </div>
  );
}

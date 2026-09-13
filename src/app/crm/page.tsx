'use client';

import React, { useState } from 'react';
import { 
  KanbanSquare, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  User, 
  Building2, 
  ArrowRight, 
  ArrowLeft, 
  Trash2,
  X,
  CheckCircle2
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';
import { Deal } from '@/types';

const STAGES: { id: Deal['stage']; label: string; color: string }[] = [
  { id: 'lead', label: 'Pistes Chaudes', color: '#ffffff' },
  { id: 'qualified', label: 'Qualifié (Intérêt validé)', color: '#d4d4d4' },
  { id: 'demo_booked', label: 'Démo Programmée', color: '#a3a3a3' },
  { id: 'negotiation', label: 'Négociation & Closing', color: '#737373' },
  { id: 'won', label: 'Gagné (Signé)', color: '#ffffff' }
];

export default function CrmPipelinePage() {
  const { deals, updateDealStage, deleteDeal, createDeal, leads } = useCrm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dealTitle, setDealTitle] = useState('');
  const [dealCompany, setDealCompany] = useState('');
  const [dealLeadName, setDealLeadName] = useState('');
  const [dealValue, setDealValue] = useState(15000);
  const [dealStage, setDealStage] = useState<Deal['stage']>('qualified');
  const [dealCloseDate, setDealCloseDate] = useState('2026-10-31');

  const totalValue = deals.reduce((acc, d) => acc + d.value, 0);
  const wonValue = deals.filter(d => d.stage === 'won').reduce((acc, d) => acc + d.value, 0);

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealTitle || !dealCompany) return;

    createDeal({
      title: dealTitle,
      leadId: `lead-${Date.now()}`,
      leadName: dealLeadName || 'Décideur',
      company: dealCompany,
      value: Number(dealValue),
      stage: dealStage,
      assignedTo: 'Alexandre (Moi)',
      expectedCloseDate: dealCloseDate
    });

    setIsModalOpen(false);
    setDealTitle('');
    setDealCompany('');
    setDealLeadName('');
  };

  const moveNext = (deal: Deal) => {
    const currentIndex = STAGES.findIndex(s => s.id === deal.stage);
    if (currentIndex < STAGES.length - 1) {
      updateDealStage(deal.id, STAGES[currentIndex + 1].id);
    }
  };

  const movePrev = (deal: Deal) => {
    const currentIndex = STAGES.findIndex(s => s.id === deal.stage);
    if (currentIndex > 0) {
      updateDealStage(deal.id, STAGES[currentIndex - 1].id);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Pipeline Commercial & Deals</h1>
            <span className="badge">
              {totalValue.toLocaleString('fr-FR')} € en opportunités
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Suivez la conversion de vos prospects issus de vos campagnes multicanales jusqu'à la signature.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={15} />
          Créer un Deal
        </button>
      </div>

      {/* Metrics Bar - Starlink Style */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '28px' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span>Total Valeur Pipeline</span>
            <TrendingUp size={16} />
          </div>
          <div className="stat-value">
            {totalValue.toLocaleString('fr-FR')} €
          </div>
          <div className="stat-subtext">{deals.length} deals en cours</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Revenu Signé (Gagné)</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="stat-value">
            {wonValue.toLocaleString('fr-FR')} €
          </div>
          <div className="stat-subtext">Ce trimestre</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Panier Moyen par Deal</span>
            <DollarSign size={16} />
          </div>
          <div className="stat-value">
            {deals.length > 0 ? Math.round(totalValue / deals.length).toLocaleString('fr-FR') : 0} €
          </div>
          <div className="stat-subtext">Basé sur vos campagnes</div>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="kanban-board">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter(d => d.stage === stage.id);
          const stageTotal = stageDeals.reduce((acc, d) => acc + d.value, 0);

          return (
            <div key={stage.id} className="kanban-column">
              {/* Column Header */}
              <div className="kanban-column-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: stage.color }}></span>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{stage.label}</h3>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                    {stageDeals.length} deals • {stageTotal.toLocaleString('fr-FR')} €
                  </div>
                </div>
              </div>

              {/* Deals in column */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stageDeals.map((deal) => (
                  <div key={deal.id} className="kanban-card">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>
                        {deal.title}
                      </h4>
                      <button 
                        onClick={() => deleteDeal(deal.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}
                        title="Supprimer le deal"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Building2 size={12} /> {deal.company}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                      <User size={12} /> {deal.leadName}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#34d399' }}>
                        {deal.value.toLocaleString('fr-FR')} €
                      </div>

                      {/* Move stage buttons */}
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {stage.id !== 'lead' && (
                          <button 
                            onClick={() => movePrev(deal)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 6px' }}
                            title="Étape précédente"
                          >
                            <ArrowLeft size={12} />
                          </button>
                        )}
                        {stage.id !== 'won' && (
                          <button 
                            onClick={() => moveNext(deal)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 6px' }}
                            title="Étape suivante"
                          >
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {stageDeals.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-subtle)', fontSize: '0.78rem', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                    Aucun deal à cette étape
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE DEAL MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Créer une Nouvelle Opportunité</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label">Titre du Deal *</label>
                <input 
                  type="text" 
                  value={dealTitle} 
                  onChange={(e) => setDealTitle(e.target.value)} 
                  placeholder="ex: Contrat Annuel - Doctolib" 
                  className="input" 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="label">Entreprise *</label>
                  <input 
                    type="text" 
                    value={dealCompany} 
                    onChange={(e) => setDealCompany(e.target.value)} 
                    placeholder="ex: Swile" 
                    className="input" 
                    required 
                  />
                </div>
                <div>
                  <label className="label">Nom du Contact</label>
                  <input 
                    type="text" 
                    value={dealLeadName} 
                    onChange={(e) => setDealLeadName(e.target.value)} 
                    placeholder="ex: Thomas Moreau" 
                    className="input" 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="label">Valeur du contrat (€) *</label>
                  <input 
                    type="number" 
                    value={dealValue} 
                    onChange={(e) => setDealValue(Number(e.target.value))} 
                    className="input" 
                    required 
                  />
                </div>
                <div>
                  <label className="label">Étape initiale</label>
                  <select 
                    value={dealStage} 
                    onChange={(e) => setDealStage(e.target.value as any)} 
                    className="select"
                  >
                    {STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Date de closing estimée</label>
                <input 
                  type="date" 
                  value={dealCloseDate} 
                  onChange={(e) => setDealCloseDate(e.target.value)} 
                  className="input" 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Créer l'opportunité
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Users, 
  Palette, 
  Layers, 
  Type, 
  Sliders, 
  Coffee, 
  Monitor, 
  LayoutTemplate
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';
import { ImageTemplate } from '@/types';

export default function PersonalizationStudioPage() {
  const { imageTemplates, leads } = useCrm();
  const [selectedTemplate, setSelectedTemplate] = useState<ImageTemplate>(imageTemplates[0]);
  const [selectedLeadIndex, setSelectedLeadIndex] = useState(0);
  
  // Customization controls
  const [customText, setCustomText] = useState(imageTemplates[0]?.defaultText || '');
  const [fontSize, setFontSize] = useState(imageTemplates[0]?.textPosition.fontSize || 32);
  const [textColor, setTextColor] = useState(imageTemplates[0]?.textPosition.color || '#2d1506');
  const [showLogo, setShowLogo] = useState(true);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentLead = leads[selectedLeadIndex] || leads[0];

  // Update text when template changes
  const handleSelectTemplate = (tpl: ImageTemplate) => {
    setSelectedTemplate(tpl);
    setCustomText(tpl.defaultText);
    setFontSize(tpl.textPosition.fontSize);
    setTextColor(tpl.textPosition.color);
  };

  // Interpolate dynamic variables
  const getRenderedText = () => {
    if (!currentLead) return customText;
    return customText
      .replace(/{{firstName}}/g, currentLead.firstName)
      .replace(/{{lastName}}/g, currentLead.lastName)
      .replace(/{{company}}/g, currentLead.company)
      .replace(/{{jobTitle}}/g, currentLead.jobTitle)
      .replace(/{{firstName \| uppercase}}/g, currentLead.firstName.toUpperCase())
      .replace(/{{company \| uppercase}}/g, currentLead.company.toUpperCase());
  };

  // Render on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedTemplate) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedTemplate.backgroundUrl;

    img.onload = () => {
      canvas.width = 1200;
      canvas.height = 800;

      // Draw background mockup
      ctx.drawImage(img, 0, 0, 1200, 800);

      // Dark overlay slightly for readability
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, 1200, 800);

      // Draw personalized text
      ctx.save();
      const pos = selectedTemplate.textPosition;
      ctx.translate(pos.x, pos.y);
      if (pos.rotation) {
        ctx.rotate((pos.rotation * Math.PI) / 180);
      }

      // Backdrop card for text if billboard or whiteboard
      const rendered = getRenderedText();
      const lines = rendered.split('\n');

      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(-20, -35, (pos.maxWidth || 450) + 40, lines.length * (fontSize * 1.3) + 40, 16);
      ctx.fill();

      // Draw Text
      ctx.fillStyle = textColor;
      ctx.font = `bold ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
      ctx.shadowColor = 'transparent';

      lines.forEach((line, i) => {
        ctx.fillText(line, 0, i * (fontSize * 1.3));
      });

      // Draw Company Logo badge
      if (showLogo && currentLead) {
        ctx.fillStyle = 'var(--primary, #6366f1)';
        ctx.beginPath();
        ctx.roundRect(0, lines.length * (fontSize * 1.3) + 10, 180, 36, 18);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold 14px 'Outfit', sans-serif`;
        ctx.fillText(`★ ${currentLead.company}`, 16, lines.length * (fontSize * 1.3) + 33);
      }

      ctx.restore();
    };
  }, [selectedTemplate, customText, fontSize, textColor, selectedLeadIndex, showLogo]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `lemlist-image-${currentLead?.company || 'lead'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopyTag = () => {
    navigator.clipboard.writeText(`{{personalizedImage:${selectedTemplate.id}}}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div>
      {/* Studio Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Studio d'Images Personnalisées</h1>
            <span className="badge badge-primary">
              <Sparkles size={12} /> Lemlist Signature
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Multipliez par 3 vos réponses en incrustant dynamiquement le nom et le logo de vos prospects sur vos visuels.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleCopyTag} className="btn btn-secondary">
            {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
            {copied ? 'Code copié !' : 'Copier tag {{image}}'}
          </button>
          <button onClick={handleDownload} className="btn btn-primary">
            <Download size={16} />
            Télécharger le rendu
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Template & Controls Left | Real-time Canvas Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '28px' }}>
        {/* Left: Template Selector & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Template Choices */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LayoutTemplate size={16} color="#818cf8" />
              1. Choix du Mockup Lemlist
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {imageTemplates.map((tpl) => {
                const isSelected = tpl.id === selectedTemplate.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    style={{
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      transition: 'var(--transition)'
                    }}
                  >
                    <img 
                      src={tpl.thumbnailUrl} 
                      alt={tpl.title}
                      style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '8px 10px', fontSize: '0.74rem', fontWeight: 600, color: isSelected ? '#fff' : 'var(--text-muted)' }}>
                      {tpl.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Text Customizer */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Type size={16} color="#fbbf24" />
              2. Texte Personnalisé & Variables
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Modèle de texte (avec variables)</label>
                <textarea 
                  rows={3}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="textarea"
                />
              </div>

              {/* Variable pills */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['{{firstName}}', '{{company}}', '{{jobTitle}}'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setCustomText(customText + ` ${v}`)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                  >
                    + {v}
                  </button>
                ))}
              </div>

              {/* Adjustments */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
                <div>
                  <label className="label">Taille police ({fontSize}px)</label>
                  <input 
                    type="range" 
                    min="18" 
                    max="46" 
                    value={fontSize} 
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label className="label">Couleur du texte</label>
                  <input 
                    type="color" 
                    value={textColor} 
                    onChange={(e) => setTextColor(e.target.value)}
                    style={{ width: '100%', height: '36px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', marginTop: '4px' }}>
                <input 
                  type="checkbox" 
                  checked={showLogo} 
                  onChange={(e) => setShowLogo(e.target.checked)}
                />
                Afficher le badge entreprise ({currentLead?.company})
              </label>
            </div>
          </div>

          {/* Test with different leads */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} color="#34d399" />
              3. Tester avec un Prospect
            </h2>

            <select 
              value={selectedLeadIndex} 
              onChange={(e) => setSelectedLeadIndex(Number(e.target.value))}
              className="select"
            >
              {leads.map((l, i) => (
                <option key={l.id} value={i}>
                  {l.firstName} {l.lastName} — {l.company} ({l.jobTitle})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Live Canvas Preview */}
        <div>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Rendu HD en Temps Réel</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Image telle qu'elle sera automatiquement générée et reçue par {currentLead?.firstName} ({currentLead?.company})
                </p>
              </div>

              <div className="badge badge-success">
                Généré en 0.04s
              </div>
            </div>

            {/* Canvas Display */}
            <div style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: '#000'
            }}>
              <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            {/* Embed snippet instructions - Starlink */}
            <div style={{
              marginTop: '20px',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              background: '#080808',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  Tag d'intégration pour vos séquences :
                </div>
                <code style={{ fontSize: '0.85rem', color: '#ffffff', background: '#000000', border: '1px solid var(--border-subtle)', padding: '4px 8px', borderRadius: '2px', fontFamily: 'monospace' }}>
                  {`{{personalizedImage:${selectedTemplate.id}}}`}
                </code>
              </div>

              <button onClick={handleCopyTag} className="btn btn-secondary btn-sm">
                <Copy size={13} /> Copier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

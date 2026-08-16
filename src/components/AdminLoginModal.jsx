import React, { useState } from 'react';
import { Lock, X, ArrowRight, ShieldCheck } from 'lucide-react';
import './AdminLoginModal.css';

export const AdminLoginModal = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === '0000') {
      setError('');
      setPin('');
      onSuccess();
    } else {
      setError('Неверный пин-код доступа');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setPin('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="admin-login-backdrop" onClick={handleBackdropClick}>
      <div className="admin-login-modal">
        <button className="admin-login-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="admin-login-icon-wrap">
          <Lock size={28} />
        </div>

        <h3 className="admin-login-title">Вход в CMS Управление</h3>
        <p className="admin-login-sub">Введите пин-код администратора для доступа к CRM и каталогу</p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-login-input-group">
            <input
              type="password"
              maxLength={8}
              autoFocus
              placeholder="••••"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (error) setError('');
              }}
              className={`admin-pin-input ${error ? 'input-error' : ''}`}
            />
          </div>

          {error && <div className="admin-login-error">{error}</div>}

          <button type="submit" className="btn btn-primary admin-login-submit">
            <span>Войти в систему</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="admin-login-footer-hint">
          <ShieldCheck size={14} />
          <span>Конфиденциальная зона Wild Rose Studio</span>
        </div>
      </div>
    </div>
  );
};

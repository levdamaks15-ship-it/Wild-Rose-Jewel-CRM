import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import './CartDrawer.css';

export const CartDrawer = () => {
  const { isCartOpen, setIsCartOpen, cart, removeFromCart, updateCartQuantity, createOrder, settings } = useApp();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerComment, setCustomerComment] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('cdek'); // cdek or courier

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCost = subtotal > 15000 || subtotal === 0 ? 0 : 450;
  const total = subtotal + deliveryCost;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert('Пожалуйста, укажите имя и телефон для связи');
      return;
    }

    const order = await createOrder({
      customerName,
      customerPhone,
      customerCity,
      customerComment,
      deliveryMethod,
      deliveryCost
    });

    setLastOrderId(order.id);
    setOrderSuccess(true);
    setIsCheckingOut(false);
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setOrderSuccess(false);
    setIsCheckingOut(false);
  };

  return (
    <div className="cart-backdrop" onClick={handleClose}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()}>
        
        {/* Drawer Header */}
        <div className="cart-header">
          <div className="cart-header-title">
            <h3>Корзина</h3>
            <span className="cart-count">({cart.reduce((s, i) => s + i.quantity, 0)})</span>
          </div>
          <button className="cart-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="cart-body">
          
          {orderSuccess ? (
            <div className="order-success-view">
              <div className="success-icon-wrap">
                <CheckCircle size={54} />
              </div>
              <h3>Спасибо за ваш заказ!</h3>
              <p className="order-id">Номер заказа: <strong>{lastOrderId}</strong></p>
              <p className="success-text">
                Наш ювелирный консьерж свяжется с вами в течение 15 минут для уточнения деталей доставки и бережной упаковки.
              </p>
              <button className="btn btn-primary" onClick={handleClose}>
                Продолжить покупки
              </button>
            </div>
          ) : isCheckingOut ? (
            <form className="checkout-form" onSubmit={handleSubmitOrder}>
              <h4 className="checkout-title">Оформление заказа</h4>
              
              <div className="form-group">
                <label>Ваше Имя *</label>
                <input
                  type="text"
                  required
                  placeholder="Анна Смирнова"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Телефон для подтверждения *</label>
                <input
                  type="tel"
                  required
                  placeholder="+7 (999) 000-00-00"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Город доставки</label>
                <input
                  type="text"
                  placeholder="Москва"
                  value={customerCity}
                  onChange={e => setCustomerCity(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Способ доставки</label>
                <select value={deliveryMethod} onChange={e => setDeliveryMethod(e.target.value)}>
                  <option value="cdek">СДЭК До двери / Пункт выдачи (350–450 ₽)</option>
                  <option value="courier">Премиальный курьер по Москве (Бесплатно от 15 000 ₽)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Комментарий / Пожелания к упаковке</label>
                <textarea
                  rows="2"
                  placeholder="Подарочная лента, записка..."
                  value={customerComment}
                  onChange={e => setCustomerComment(e.target.value)}
                ></textarea>
              </div>

              <div className="checkout-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCheckingOut(false)}>
                  Назад в корзину
                </button>
                <button type="submit" className="btn btn-primary">
                  Подтвердить заказ
                </button>
              </div>
            </form>
          ) : cart.length === 0 ? (
            <div className="empty-cart">
              <p>Ваша шкатулка с украшениями пока пуста.</p>
              <button className="btn btn-primary" onClick={handleClose}>
                Перейти в каталог
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map(item => (
                <div key={`${item.id}-${item.size}`} className="cart-item">
                  <img src={item.mainImage} alt={item.title} className="cart-item-thumb" />
                  
                  <div className="cart-item-info">
                    <h4 className="cart-item-title">{item.title}</h4>
                    <span className="cart-item-meta">Размер: {item.size}</span>
                    
                    <div className="cart-item-bottom">
                      <div className="qty-controls">
                        <button onClick={() => updateCartQuantity(item.id, item.size, -1)}>
                          <Minus size={12} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.id, item.size, 1)}>
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="cart-item-price">
                        {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                      </span>

                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.id, item.size)}
                        title="Удалить"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Drawer Footer */}
        {!orderSuccess && cart.length > 0 && (
          <div className="cart-footer">
            <div className="summary-row">
              <span>Сумма изделий:</span>
              <span>{subtotal.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="summary-row">
              <span>Доставка:</span>
              <span>{deliveryCost === 0 ? 'Бесплатно' : `${deliveryCost} ₽`}</span>
            </div>
            <div className="summary-row total-row">
              <span>Итого к оплате:</span>
              <span className="total-amount">{total.toLocaleString('ru-RU')} ₽</span>
            </div>

            {!isCheckingOut && (
              <button className="btn btn-primary cart-checkout-btn" onClick={() => setIsCheckingOut(true)}>
                <span>Перейти к оформлению</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Sparkles, Image as ImageIcon } from 'lucide-react';

const CATEGORIES = ['Breakfast', 'Meals', 'Fast Food', 'Snacks', 'Beverages', 'Desserts'];

export default function ItemModal({ isOpen, onClose, onSave, itemToEdit }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Breakfast');
  const [price, setPrice] = useState('');
  const [prepTime, setPrepTime] = useState('10');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [inStockCount, setInStockCount] = useState('30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name || '');
      setCategory(itemToEdit.category || 'Breakfast');
      setPrice(itemToEdit.price !== undefined ? itemToEdit.price : '');
      setPrepTime(itemToEdit.prepTime !== undefined ? itemToEdit.prepTime : '10');
      setDescription(itemToEdit.description || '');
      setImage(itemToEdit.image || '');
      setIsVeg(itemToEdit.isVeg !== undefined ? itemToEdit.isVeg : true);
      setInStockCount(itemToEdit.inStockCount !== undefined ? itemToEdit.inStockCount : '30');
    } else {
      setName('');
      setCategory('Breakfast');
      setPrice('');
      setPrepTime('10');
      setDescription('');
      setImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80');
      setIsVeg(true);
      setInStockCount('30');
    }
    setError('');
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      setError('Dish name and price are required.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        category,
        price: Number(price),
        prepTime: Number(prepTime) || 10,
        description: description.trim(),
        image: image.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        isVeg: Boolean(isVeg),
        inStockCount: Number(inStockCount) || 30
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save menu item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '2px' }}>
              {itemToEdit ? 'Edit Canteen Dish (Update)' : 'Add New Dish to Menu (Create)'}
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Direct MongoDB CRUD Operation
            </span>
          </div>

          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          
          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#FB7185',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '18px'
            }}>
              {error}
            </div>
          )}

          {/* Dish Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#FFF', marginBottom: '6px' }}>
              Dish / Food Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Special Paneer Butter Roll"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Category & Veg Toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#FFF', marginBottom: '6px' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%' }}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#FFF', marginBottom: '6px' }}>
                Diet Type
              </label>
              <select
                value={isVeg ? 'true' : 'false'}
                onChange={(e) => setIsVeg(e.target.value === 'true')}
                style={{ width: '100%' }}
              >
                <option value="true">🌱 Pure Vegetarian</option>
                <option value="false">🍖 Non-Vegetarian</option>
              </select>
            </div>
          </div>

          {/* Price, Prep Time & Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#FFF', marginBottom: '6px' }}>
                Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 60"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#FFF', marginBottom: '6px' }}>
                Prep Time (min)
              </label>
              <input
                type="number"
                min="1"
                placeholder="10"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#FFF', marginBottom: '6px' }}>
                Stock Units
              </label>
              <input
                type="number"
                min="0"
                placeholder="30"
                value={inStockCount}
                onChange={(e) => setInStockCount(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Image URL */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#FFF', marginBottom: '6px' }}>
              Image URL
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#FFF', marginBottom: '6px' }}>
              Description & Ingredients
            </label>
            <textarea
              rows="3"
              placeholder="Freshly prepared with aromatic spices..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ minWidth: '130px' }}>
              {loading ? (
                <span>Saving to DB...</span>
              ) : (
                <>
                  <Save size={16} />
                  <span>{itemToEdit ? 'Update Dish' : 'Add to Catalog'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

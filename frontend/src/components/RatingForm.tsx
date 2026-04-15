'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { Rating } from '@/types';

interface RatingFormProps {
  saleId:       string;
  onRated:      (rating: Rating) => void;
}

function StarSelector({
  label,
  value,
  onChange,
}: {
  label:    string;
  value:    number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="text-2xl transition-transform hover:scale-110">
            {star <= (hover || value) ? '⭐' : '☆'}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RatingForm({ saleId, onRated }: RatingFormProps) {
  const [scores, setScores] = useState({
    priceScore:         0,
    communicationScore: 0,
    processScore:       0,
  });
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (Object.values(scores).some((s) => s === 0)) {
      setError('Debes calificar todas las categorías');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/api/ratings', {
        saleId,
        ...scores,
        comment: comment.trim() || undefined,
      });
      onRated(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al enviar la calificación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <StarSelector
        label="Precio justo"
        value={scores.priceScore}
        onChange={(v) => setScores({ ...scores, priceScore: v })}
      />
      <StarSelector
        label="Comunicación"
        value={scores.communicationScore}
        onChange={(v) => setScores({ ...scores, communicationScore: v })}
      />
      <StarSelector
        label="Proceso de venta"
        value={scores.processScore}
        onChange={(v) => setScores({ ...scores, processScore: v })}
      />

      <div>
        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
          Comentario (opcional)
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="¿Cómo fue la experiencia?"
          className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white font-medium py-2 rounded-lg transition-colors">
        {loading ? 'Enviando...' : '⭐ Enviar calificación'}
      </button>
    </form>
  );
}
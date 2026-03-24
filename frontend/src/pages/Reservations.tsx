import { useState, useEffect } from 'react';
import api from '../services/api';

interface Reservation {
  id: number;
  reservationDate: string;
  expirationDate: string;
  status: string;
  book: { id: number; title: string; author: string };
}

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations', { params: { limit: 50 } });
      setReservations(response.data.data);
    } catch (err: any) {
      setError('Error al cargar reservas');
    }
  };

  const handleComplete = async (id: number) => {
    setError('');
    setSuccess('');
    try {
      await api.patch(`/reservations/${id}/complete`);
      setSuccess('Reserva completada. Se creó un préstamo automáticamente (14 días).');
      fetchReservations();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al completar reserva');
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('¿Cancelar esta reserva?')) return;
    setError('');
    setSuccess('');
    try {
      await api.patch(`/reservations/${id}/cancel`);
      setSuccess('Reserva cancelada. El libro está disponible nuevamente.');
      fetchReservations();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cancelar reserva');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container">
      <h2 style={{ marginBottom: 16 }}>🔖 Mis Reservas</h2>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Libro</th>
            <th>Autor</th>
            <th>Fecha Reserva</th>
            <th>Vence</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservations.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: 20 }}>
                No tienes reservas registradas
              </td>
            </tr>
          ) : (
            reservations.map((res) => (
              <tr key={res.id}>
                <td>{res.id}</td>
                <td>{res.book.title}</td>
                <td>{res.book.author}</td>
                <td>{formatDate(res.reservationDate)}</td>
                <td>{formatDate(res.expirationDate)}</td>
                <td>
                  <span className={`badge badge-${res.status}`}>
                    {res.status}
                  </span>
                </td>
                <td>
                  {res.status === 'activa' && (
                    <div className="gap-8">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleComplete(res.id)}
                      >
                        Completar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(res.id)}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                  {res.status === 'completada' && (
                    <span style={{ fontSize: 12, color: '#2e7d32' }}>
                      Convertida a préstamo
                    </span>
                  )}
                  {res.status === 'cancelada' && (
                    <span style={{ fontSize: 12, color: '#888' }}>
                      Cancelada
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Reservations;
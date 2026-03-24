import { useState, useEffect } from 'react';
import api from '../services/api';

interface Loan {
  id: number;
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
  book: { id: number; title: string; author: string };
}

const Loans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await api.get('/loans', { params: { limit: 50 } });
      setLoans(response.data.data);
    } catch (err: any) {
      setError('Error al cargar préstamos');
    }
  };

  const handleReturn = async (loanId: number) => {
    setError('');
    setSuccess('');
    try {
      await api.patch(`/loans/${loanId}/return`);
      setSuccess('Libro devuelto exitosamente');
      fetchLoans();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al devolver el libro');
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
      <h2 style={{ marginBottom: 16 }}>📖 Mis Préstamos</h2>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Libro</th>
            <th>Autor</th>
            <th>Fecha Préstamo</th>
            <th>Fecha Vencimiento</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loans.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: 20 }}>
                No tienes préstamos registrados
              </td>
            </tr>
          ) : (
            loans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.id}</td>
                <td>{loan.book.title}</td>
                <td>{loan.book.author}</td>
                <td>{formatDate(loan.loanDate)}</td>
                <td>{formatDate(loan.dueDate)}</td>
                <td>
                  <span className={`badge badge-${loan.status}`}>
                    {loan.status}
                  </span>
                </td>
                <td>
                  {loan.status === 'activo' && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleReturn(loan.id)}
                    >
                      Devolver
                    </button>
                  )}
                  {loan.status === 'devuelto' && (
                    <span style={{ fontSize: 12, color: '#888' }}>
                      Devuelto el {formatDate(loan.returnDate!)}
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

export default Loans;
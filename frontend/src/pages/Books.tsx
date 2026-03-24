import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Book {
  id: number;
  title: string;
  author: string;
  publicationYear: number;
  status: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0, page: 1, limit: 10, totalPages: 0,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publicationYear: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchBooks();
  }, [pagination.page, statusFilter, sortBy, sortOrder]);

  const fetchBooks = async () => {
    try {
      const params: any = {
        page: pagination.page,
        limit: 10,
        sortBy,
        sortOrder,
      };

      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/books', { params });
      setBooks(response.data.data);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError('Error al cargar los libros');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchBooks();
  };

  const handleNew = () => {
    setEditingBook(null);
    setFormData({ title: '', author: '', publicationYear: '' });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      publicationYear: String(book.publicationYear),
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const data = {
        title: formData.title,
        author: formData.author,
        publicationYear: Number(formData.publicationYear),
      };

      if (editingBook) {
        await api.put(`/books/${editingBook.id}`, data);
        setSuccess('Libro actualizado exitosamente');
      } else {
        await api.post('/books', data);
        setSuccess('Libro creado exitosamente');
      }

      setShowForm(false);
      fetchBooks(); 
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar el libro');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este libro?')) return;

    setError('');
    setSuccess('');

    try {
      await api.delete(`/books/${id}`);
      setSuccess('Libro eliminado exitosamente');
      fetchBooks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al eliminar el libro');
    }
  };

  const handleLoan = async (bookId: number) => {
    try {
      await api.post('/loans', { bookId });
      setSuccess('Préstamo creado exitosamente (14 días)');
      fetchBooks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear préstamo');
    }
  };

  const handleReserve = async (bookId: number) => {
    try {
      await api.post('/reservations', { bookId });
      setSuccess('Reserva creada exitosamente (3 días para recoger)');
      fetchBooks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear reserva');
    }
  };

  return (
    <div className="container">
      <div className="flex-between">
        <h2>📚 Gestión de Libros</h2>
        {isAuthenticated && (
          <button className="btn btn-primary" onClick={handleNew}>
            + Nuevo Libro
          </button>
        )}
      </div>

      {/* Mensajes */}
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      {/* Formulario crear/editar */}
      {showForm && (
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>
            {editingBook ? 'Editar Libro' : 'Nuevo Libro'}
          </h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Autor</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Año de Publicación</label>
              <input
                type="number"
                value={formData.publicationYear}
                onChange={(e) =>
                  setFormData({ ...formData, publicationYear: e.target.value })
                }
                min="1000"
                max={new Date().getFullYear()}
                required
              />
            </div>
            <div className="gap-8">
              <button type="submit" className="btn btn-success">
                {editingBook ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <form className="filters" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Buscar por título o autor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
        >
          <option value="">Todos los estados</option>
          <option value="disponible">Disponible</option>
          <option value="reservado">Reservado</option>
          <option value="prestado">Prestado</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="createdAt">Más recientes</option>
          <option value="title">Título</option>
          <option value="author">Autor</option>
          <option value="publicationYear">Año</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="desc">Descendente</option>
          <option value="asc">Ascendente</option>
        </select>
        <button type="submit" className="btn btn-primary">
          Buscar
        </button>
      </form>

      {/* Tabla de libros */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Autor</th>
            <th>Año</th>
            <th>Estado</th>
            {isAuthenticated && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {books.length === 0 ? (
            <tr>
              <td colSpan={isAuthenticated ? 6 : 5} style={{ textAlign: 'center', padding: 20 }}>
                No se encontraron libros
              </td>
            </tr>
          ) : (
            books.map((book) => (
              <tr key={book.id}>
                <td>{book.id}</td>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.publicationYear}</td>
                <td>
                  <span className={`badge badge-${book.status}`}>
                    {book.status}
                  </span>
                </td>
                {isAuthenticated && (
                  <td>
                    <div className="gap-8">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEdit(book)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(book.id)}
                      >
                        Eliminar
                      </button>
                      {book.status === 'disponible' && (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleLoan(book.id)}
                          >
                            Prestar
                          </button>
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleReserve(book.id)}
                          >
                            Reservar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-sm btn-primary"
            disabled={pagination.page <= 1}
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
            }
          >
            ← Anterior
          </button>
          <span>
            Página {pagination.page} de {pagination.totalPages} ({pagination.total} libros)
          </span>
          <button
            className="btn btn-sm btn-primary"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
            }
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
};

export default Books;
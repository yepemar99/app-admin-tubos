import { useEffect, useState } from 'react';
import { PAGE_SIZE } from '../../utils/constants';
import { toast } from 'react-toastify';

const useDataTable = ({
  fetchData = () => {},
  fetchFilters = () => {},
  initFilters,
  externalDeps = [],
  onDeleteConfirm = async () => {},
  onCreateConfirm = async () => {},
  onEditConfirm = async () => {},
  onOtherAction = async () => {},
  successActionMessage = 'Acción realizada correctamente',
}) => {
  const [reinitFilters, setReinitFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilteredMallas] = useState(initFilters);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState([]);
  const [initializedFilters, setInitializedFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortModel, setSortModel] = useState([
    { field: 'creado', sort: 'desc' },
  ]);

  const handleSortModel = (model) => {
    setSortModel(model);
  };

  const handleSelectItems = (ids, type) => {
    if (type === 'exclude') {
      setSelectedIds(data.map((item) => item.id));
    } else {
      setSelectedIds([...ids]);
    }
  };

  const handleSelectItem = (item) => {
    if (!item) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  const setInitFilters = async () => {
    setLoadingFilters(true);
    const filtersData = await fetchFilters();
    const initializedFilters = initFilters.map((filter) => {
      return {
        ...filter,
        options: (filtersData[filter.name] || []).map((option) => ({
          label: option?.label ? option?.label : option,
          value: option?.value ? option?.value : option,
        })),
      };
    });
    setFilteredMallas(initializedFilters);
    setLoadingFilters(false);
    setInitializedFilters(true);
  };

  const handleOtherAction = async () => {
    try {
      setActionLoading(true);
      const resp = await onOtherAction();
      if (!resp.success) throw new Error(resp.error || 'Error desconocido');
      setActionLoading(false);
      if (resp.message) toast.success(resp.message);
    } catch (error) {
      setActionLoading(false);
      toast.error(
        error?.message ? error?.message : 'Error al realizar la acción.',
      );
      console.error('Error:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setShowDeleteConfirm(false);
      setActionLoading(true);
      const resp = await onDeleteConfirm(selectedItem?.id || '');
      if (!resp.success) throw new Error(resp.error || 'Error desconocido');
      setActionLoading(false);
      toast.success('Elemento eliminado correctamente.');
      await loadData(page, searchTerm, filters);
      setInitFilters();
    } catch (error) {
      setActionLoading(false);
      toast.error(
        error?.message ? error?.message : 'Error al eliminar el elemento.',
      );
      console.error('Error deleting item:', error);
    }
  };

  const handleCreateConfirm = async (newData) => {
    try {
      setShowForm(false);
      setActionLoading(true);
      const resp = await onCreateConfirm(newData);
      if (!resp?.success) throw new Error(resp?.error || 'Error desconocido');
      setActionLoading(false);
      toast.success('Elemento creado correctamente.');
      await loadData(page, searchTerm, filters);
      setInitFilters();
    } catch (error) {
      setActionLoading(false);
      toast.error(
        error?.message ? error?.message : 'Error al crear el elemento.',
      );
      console.error('Error creating item:', error.message);
    }
  };

  const handleEditConfirm = async (newData) => {
    try {
      setShowForm(false);
      setActionLoading(true);
      const resp = await onEditConfirm(newData);
      if (!resp?.success) throw new Error(resp?.error || 'Error desconocido');
      setActionLoading(false);
      toast.success('Elemento actualizado correctamente.');
      await loadData(page, searchTerm, filters);
      setInitFilters();
    } catch (error) {
      setActionLoading(false);
      toast.error(
        error?.message ? error?.message : 'Error al actualizar el elemento.',
      );
      console.error('Error creating item:', error);
    }
  };

  const handleCreate = (isCancel = false) => {
    setSelectedItem(null);
    setShowForm(isCancel ? false : true);
  };
  const handleEdit = (item) => {
    if (!item) {
      setShowForm(true);
      setSelectedItem(null);
      return;
    }
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleDetail = (item) => {
    if (!item) {
      setShowDetail(true);
      setSelectedItem(null);
      return;
    }
    setSelectedItem(item);
    setShowDetail(true);
  };

  const handleDelete = (item) => {
    if (!item) {
      setSelectedItem(null);
      setShowDeleteConfirm(false);
      return;
    }
    setSelectedItem(item);
    setShowDeleteConfirm(true);
  };

  const loadData = async (page, searchTerm, filters) => {
    setLoading(true);
    const data = await fetchData(
      page,
      PAGE_SIZE,
      searchTerm,
      filters,
      sortModel,
    );
    setData(data?.data || []);
    setTotal(data?.total || 0);
    setLoading(false);
    if (!initializedFilters) setInitFilters();
  };

  const handleFilterChange = (filterName, value) => {
    if (filterName === 'search') {
      setSearchTerm(value);
      return;
    }
    const newFilters = filters.map((filter) => {
      if (filter.name === filterName) {
        return { ...filter, value };
      }
      return filter;
    });
    setFilteredMallas(newFilters);
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    const resetFilters = filters.map((filter) => ({
      ...filter,
      value: null,
    }));
    setFilteredMallas(resetFilters);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    loadData(page, searchTerm, filters);
  }, [page, filters, searchTerm, sortModel, ...externalDeps]);

  return {
    data,
    total,
    loading,
    page,
    handleFilterChange,
    handlePageChange,
    searchTerm,
    filters,
    loadingFilters,
    selectedIds,
    sortModel,
    handleSortModel,
    handleSelectItem,
    selectedItem,
    setSelectedItem,
    showDeleteConfirm,
    handleDelete,
    showDetail,
    handleDetail,
    showForm,
    handleEdit,
    handleCreate,
    actionLoading,
    setActionLoading,
    handleDeleteConfirm,
    handleCreateConfirm,
    handleEditConfirm,
    handleOtherAction,
    handleClearAllFilters,
    setInitFilters,
    handleSelectItems,
    handleFetchData: loadData,
  };
};

export default useDataTable;

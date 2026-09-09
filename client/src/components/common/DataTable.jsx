import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Skeleton } from './Skeleton.jsx';
import { EmptyState } from './EmptyState.jsx';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  searchPlaceholder = 'Search records...',
  filterKey = null,
  filterOptions = [],
  onRowClick = null,
  pagination = true,
  itemsPerPage = 10,
}) => {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & Search logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesFilter =
        !filterKey || selectedFilter === 'ALL' || item[filterKey] === selectedFilter;

      if (!matchesFilter) return false;
      if (!search.trim()) return true;

      const q = search.toLowerCase();
      return columns.some((col) => {
        if (!col.accessor) return false;
        const val = typeof col.accessor === 'function' ? col.accessor(item) : item[col.accessor];
        return val ? String(val).toLowerCase().includes(q) : false;
      });
    });
  }, [data, search, selectedFilter, filterKey, columns]);

  // Sort logic
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const col = columns.find((c) => c.key === sortKey);
      if (!col) return 0;
      const valA = typeof col.accessor === 'function' ? col.accessor(a) : a[col.accessor];
      const valB = typeof col.accessor === 'function' ? col.accessor(b) : b[col.accessor];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });
  }, [filteredData, sortKey, sortOrder, columns]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage, pagination]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
          />
        </div>

        {filterKey && filterOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-600"
            >
              <option value="ALL">All Statuses</option>
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-600 border-b border-slate-200 tracking-wider">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`py-3.5 px-4 ${col.sortable ? 'cursor-pointer select-none hover:text-slate-900' : ''} ${
                    col.className || ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && sortKey === col.key && (
                      <span>
                        {sortOrder === 'asc' ? (
                          <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(itemsPerPage)].map((_, idx) => (
                <tr key={idx}>
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="py-4 px-4">
                      <Skeleton className="w-24 h-4 bg-slate-200" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <EmptyState title="No records found" description="Try adjusting your search or filters." />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors hover:bg-slate-50/80 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`py-3.5 px-4 ${col.className || ''}`}>
                      {col.render
                        ? col.render(row)
                        : typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : row[col.accessor] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && !loading && sortedData.length > 0 && (
        <div className="p-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
          <div>
            Showing <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-bold text-slate-800">
              {Math.min(currentPage * itemsPerPage, sortedData.length)}
            </span>{' '}
            of <span className="font-bold text-slate-800">{sortedData.length}</span> entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;

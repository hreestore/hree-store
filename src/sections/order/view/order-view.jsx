"use client";

import { useState, useCallback, useEffect } from "react";
import { useBoolean, useSetState } from "@/hooks";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

import { paths } from "@/routes/paths";

import { fIsAfter, fIsBetween } from "@/utils/format-time";

import { toast } from "@/components/snackbar";

import { EmailVerificationBanner } from "@/auth/components";

import { OrderTableRow } from "../order-table-row";
import { OrderTableToolbar } from "../order-table-toolbar";
import { OrderTableFiltersResult } from "../order-table-filters-result";

import { useGetOrders } from "@/api";
import { getComparator, rowInPage, emptyRows } from "@/components/table";
import { Iconify } from "@/components/iconify";

// ----------------------------------------------------------------------

export const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" },
  { value: "completed", label: "Completed" },
];

const TABLE_HEAD = [
  { id: "order_id", label: "Order", width: 88 },
  { id: "order_date", label: "Order Date", width: 140 },
  { id: "items", label: "Products", width: 120, align: "center" },
  { id: "total_amount", label: "Price", width: 140 },
  { id: "status", label: "Status", width: 110 },
  { id: "", width: 88 },
];

// ----------------------------------------------------------------------

export function OrderView() {
  // State management
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("order_date");
  const [selected, setSelected] = useState([]);

  const confirmDialog = useBoolean();

  const {
    orders,
    emailVerified,
    hasHiddenOrders,
    hiddenOrdersCount,
    visibleOrdersCount,
    message
  } = useGetOrders();

  const [tableData, setTableData] = useState([]);

  const filters = useSetState({
    name: "",
    status: "all",
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    setTableData(orders);
  }, [orders]);

  const { state: currentFilters, setState: updateFilters } = filters;

  const dateError = fIsAfter(currentFilters.startDate, currentFilters.endDate);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(order, orderBy),
    filters: currentFilters,
    dateError,
  });

  const dataInPage = rowInPage(dataFiltered, page, rowsPerPage);

  const canReset =
    !!currentFilters.name ||
    currentFilters.status !== "all" ||
    (!!currentFilters.startDate && !!currentFilters.endDate);

  const notFound = (!dataFiltered?.length && canReset) || !dataFiltered?.length;

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter(
      (row) => !selected.includes(row.id)
    );

    toast.success("Delete success!");

    setTableData(deleteRows);
    setSelected([]);

    // Update page if needed
    const newMaxPage = Math.ceil(deleteRows.length / rowsPerPage) - 1;
    if (page > newMaxPage) {
      setPage(Math.max(0, newMaxPage));
    }
  }, [dataFiltered?.length, dataInPage.length, selected, tableData, page, rowsPerPage]);

  const handleFilterStatus = useCallback(
    (newValue) => {
      setPage(0);
      updateFilters({ status: newValue });
    },
    [updateFilters]
  );

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "confirmed":
      case "delivered":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "cancelled":
      case "returned":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "processing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <>
      <div className="lg:py-20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center gap-2 text-sm"
          >
            <Link href={paths.order.root} className="  font-medium transition-colors">
              Order
            </Link>
            <span className="">/</span>
            <span className=" font-black uppercase tracking-wider">List</span>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter mb-4">
              Your <span className="">Orders</span>
            </h1>
            <p className=" text-lg max-w-2xl">Track and manage all your custom apparel orders</p>
          </motion.div>

          <EmailVerificationBanner />

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl shadow-xl border border-[#f7e6dc] overflow-hidden"
          >
            {/* Tabs */}
            <div className="border-b border-[#f7e6dc]">
              <div className="flex overflow-x-auto scrollbar-hide px-6">
                {STATUS_OPTIONS.map((tab, idx) => {
                  const isActive = tab.value === currentFilters.status;
                  const count = tab.value !== "all"
                    ? tableData?.filter((order) => order.status === tab.value).length
                    : orders.length;

                  return (
                    <button
                      key={tab.value}
                      onClick={() => handleFilterStatus(tab.value)}
                      className={`
                        relative px-6 py-4 font-black uppercase tracking-wider text-sm whitespace-nowrap
                        transition-all duration-300 flex items-center gap-3
                        ${isActive
                          ? ''
                          : ''
                        }
                      `}
                    >
                      <span>{tab.label}</span>
                      <span className={`
                        px-2.5 py-1 rounded-full text-xs font-black border
                        ${isActive ? getStatusColor(tab.value) : ' border-[#f7e6dc]'}
                      `}>
                        {count}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-[#711a20]"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <OrderTableToolbar
              filters={filters}
              onResetPage={() => setPage(0)}
              dateError={dateError}
            />

            {canReset && (
              <OrderTableFiltersResult
                filters={filters}
                totalResults={dataFiltered?.length}
                onResetPage={() => setPage(0)}
                sx={{ p: 2.5, pt: 0 }}
              />
            )}

            {/* Selected Actions */}
            {selected.length > 0 && (
              <div className="px-6 py-4 bg-[#711a20]/5 border-b border-[#711a20]/10 flex items-center justify-between">
                <span className="text-sm font-black uppercase tracking-wider text-[#711a20]">
                  {selected.length} Selected
                </span>
                <button
                  onClick={confirmDialog.onTrue}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full text-xs font-black uppercase tracking-wider hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className=" border-b border-gray-600">
                  <tr>
                    {TABLE_HEAD.map((head) => (
                      <th
                        key={head.id}
                        className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-700"
                        style={{ width: head.width }}
                      >
                        {head.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dataFiltered
                    ?.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                    ?.map((row) => (
                      <OrderTableRow
                        key={row.order_id}
                        row={row}
                        selected={selected.includes(row.order_id)}
                        detailsHref={paths.order.details(row.order_id)}
                      />
                    ))}

                  {/* Empty Rows */}
                  {Array.from({ length: emptyRows(page, rowsPerPage, dataFiltered?.length) }).map((_, idx) => (
                    <tr key={`empty-${idx}`} className="h-[76px]">
                      <td colSpan={TABLE_HEAD.length}></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* No Data */}
              {notFound && (
                <div className="py-20 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Iconify icon="fluent:cart-16-regular" width={50} height={50} />
                  </div>
                  <h3 className="text-2xl font-display font-black uppercase tracking-tighter text-gray-900 mb-2">
                    No Orders Found
                  </h3>
                  <p className="text-gray-500 mb-8">
                    {canReset ? "Try adjusting your filters" : "Start creating your custom apparel!"}
                  </p>
                  {!canReset && (
                    <Link
                      href={paths.customize.root}
                      className="inline-flex items-center gap-2 bg-[#711a20] text-[#ffffff] px-8 py-4 rounded-full text-sm font-black uppercase tracking-wider hover:bg-[#a00000] transition-all"
                    >
                      Start Customizing
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {!notFound && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between ">
                <div className="flex items-center gap-4">
                  <span className="text-sm ">
                    Rows per page:
                  </span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => handleChangeRowsPerPage(Number(e.target.value))}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium  hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#711a20]/20"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm ">
                    {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, dataFiltered?.length)} of {dataFiltered?.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleChangePage(page - 1)}
                    disabled={page === 0}
                    className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleChangePage(page + 1)}
                    disabled={page >= Math.ceil(dataFiltered?.length / rowsPerPage) - 1}
                    className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Confirm Dialog */}
      {confirmDialog.value && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className=" rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            <h3 className="text-2xl font-display font-black uppercase tracking-tighter mb-4">
              Delete Orders?
            </h3>
            <p className=" mb-8">
              Are you sure you want to delete <strong>{selected.length}</strong> order{selected.length > 1 ? 's' : ''}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDialog.onFalse}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-black uppercase tracking-wider text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteRows();
                  confirmDialog.onFalse();
                }}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-full font-black uppercase tracking-wider text-sm hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { status, name, startDate, endDate } = filters;

  const stabilizedThis = inputData?.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(({ order_id }) =>
      String(order_id).toLowerCase().includes(name.toLowerCase())
    );
  }

  if (status !== "all") {
    inputData = inputData.filter((order) => order.status === status);
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((order) =>
        fIsBetween(order.order_date, startDate, endDate)
      );
    }
  }

  return inputData;
}

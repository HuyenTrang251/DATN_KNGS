import React, { useEffect, useState } from "react";
import { getAdminDashboardSummary } from "../../../services/userApi";
import "./dashboard.scss";

const defaultSummary = {
  tutor_count: 0,
  student_count: 0,
  pending_post_count: 0,
  verify_request_count: 0,
  revenue_today: 0,
  revenue_month: 0,
  revenue_year: 0,
  selected_revenue: 0,
  revenue_filter: {
    mode: "month",
    selected_value: "",
    summary_label: "",
  },
  revenue_chart: [],
};

const numberFormatter = new Intl.NumberFormat("vi-VN");
const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const filterOptions = [
  { value: "day", label: "Ngày" },
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
];

const getDefaultSelectedValue = (mode) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  if (mode === "day") return `${year}-${month}-${day}`;
  if (mode === "year") return `${year}`;
  return `${year}-${month}`;
};

const getInputConfig = (mode) => {
  if (mode === "day") {
    return { type: "date", placeholder: "Chọn ngày" };
  }

  if (mode === "year") {
    return { type: "number", placeholder: "VD: 2026", min: 2020, max: 2100 };
  }

  return { type: "month", placeholder: "Chọn tháng" };
};

const getBarWidth = (pointCount) => {
  if (pointCount >= 24) return 38;
  if (pointCount >= 12) return 52;
  return 72;
};

function Dashboard() {
  const [filters, setFilters] = useState(() => ({
    mode: "month",
    selectedValue: getDefaultSelectedValue("month"),
  }));
  const [summary, setSummary] = useState(defaultSummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = async (nextFilters = filters) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getAdminDashboardSummary(nextFilters);
      setSummary({
        ...defaultSummary,
        ...response,
      });
      setLastUpdated(new Date());
    } catch (apiError) {
      setError(apiError?.response?.data?.error || "Không thể tải dữ liệu tổng quan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overviewCards = [
    {
      label: "Tổng gia sư",
      value: numberFormatter.format(summary.tutor_count || 0),
      icon: "bi-mortarboard",
      tone: "blue",
    },
    {
      label: "Tổng học viên",
      value: numberFormatter.format(summary.student_count || 0),
      icon: "bi-people",
      tone: "teal",
    },
    {
      label: "Bài đăng chờ nhận lớp",
      value: numberFormatter.format(summary.pending_post_count || 0),
      icon: "bi-file-earmark-text",
      tone: "amber",
    },
    {
      label: "Yêu cầu tích xanh",
      value: numberFormatter.format(summary.verify_request_count || 0),
      icon: "bi-patch-check",
      tone: "indigo",
    },
  ];

  const revenueCards = [
    {
      label: "Doanh thu hôm nay",
      value: currencyFormatter.format(summary.revenue_today || 0),
      note: "Tính theo giao dịch thành công trong ngày",
    },
    {
      label: "Doanh thu tháng này",
      value: currencyFormatter.format(summary.revenue_month || 0),
      note: "Tổng giao dịch thành công trong tháng hiện tại",
    },
    {
      label: "Doanh thu năm nay",
      value: currencyFormatter.format(summary.revenue_year || 0),
      note: "Lũy kế doanh thu theo năm hiện tại",
    },
  ];

  const selectedRevenueTitle = summary.revenue_filter?.summary_label || "Kỳ đang xem";
  const selectedRevenue = currencyFormatter.format(summary.selected_revenue || 0);
  const chartData = summary.revenue_chart || [];
  const paymentLogs = summary.recent_payment_logs || [];
  const maxChartValue = Math.max(...chartData.map((item) => Number(item.value || 0)), 0);
  const chartBarWidth = getBarWidth(chartData.length);
  const chartMinWidth = Math.max(chartData.length * chartBarWidth, 420);
  const inputConfig = getInputConfig(filters.mode);

  const updatedLabel = lastUpdated
    ? lastUpdated.toLocaleString("vi-VN")
    : "Chưa có dữ liệu";

  const handleModeChange = (mode) => {
    setFilters({
      mode,
      selectedValue: getDefaultSelectedValue(mode),
    });
  };

  const handleApplyFilters = () => {
    loadDashboard(filters);
  };

  const getStatusMeta = (status) => {
    if (status === "refunded") {
      return { label: "Đã hoàn tiền", className: "is-refunded" };
    }

    return { label: "Đã thanh toán", className: "is-success" };
  };

  const getProviderLabel = (provider) => {
    if (provider === "momo") return "MoMo";
    if (provider === "zalopay") return "ZaloPay";
    return "PayOS";
  };

  return (
    <div className="dashboard-admin">
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontWeight: 700, color: "#10204f" }}>Tổng quan hệ thống</h2>
        </div>

        <button type="button" className="refresh-button" onClick={loadDashboard} disabled={isLoading}>
          <i className="bi bi-arrow-clockwise"></i>
          {isLoading ? " Đang tải..." : " Tải lại"}
        </button>
      </div>

      {error ? <div className="dashboard-alert">{error}</div> : null}

      <div className="stats-grid">
        {overviewCards.map((item) => (
          <div className={`stat-card stat-card--${item.tone}`} key={item.label}>
            <div className="icon-box">
              <i className={`bi ${item.icon}`}></i>
            </div>
            <div className="info">
              <h3>{item.value}</h3>
              <p>{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="revenue-panel">
        <div className="panel-heading">
          <div>
            <h4 className="panel-kicker">Doanh thu</h4>
          </div>
          <div className="panel-heading__meta">
            <span className="updated-at">Cập nhật: {updatedLabel}</span>
          </div>
        </div>

        <div className="revenue-filter-panel">
          <div className="filter-mode-group">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`filter-chip ${filters.mode === option.value ? "is-active" : ""}`}
                onClick={() => handleModeChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="filter-input-group">
            <input
              type={inputConfig.type}
              className="filter-input"
              value={filters.selectedValue}
              placeholder={inputConfig.placeholder}
              min={inputConfig.min}
              max={inputConfig.max}
              onChange={(event) => setFilters((prev) => ({ ...prev, selectedValue: event.target.value }))}
            />
            <button type="button" className="apply-filter-button" onClick={handleApplyFilters} disabled={isLoading || !filters.selectedValue}>
              Xem báo cáo
            </button>
          </div>
        </div>

        <div className="selected-revenue-card">
          <div>
            <p className="selected-revenue-card__label">Doanh thu kỳ đang xem</p>
            <h3>{selectedRevenue}</h3>
          </div>
          <span>{selectedRevenueTitle}</span>
        </div>

        <div className="revenue-grid">
          {revenueCards.map((item) => (
            <div className="revenue-card" key={item.label}>
              <p className="revenue-label">{item.label}</p>
              <h3>{item.value}</h3>
            </div>
          ))}
        </div>

        <div className="chart-panel">
          <div className="chart-panel__header">
            <div>
              <p className="panel-kicker">Biểu đồ</p>
              <h5>Diễn biến doanh thu theo {filters.mode === "day" ? "giờ" : filters.mode === "month" ? "ngày" : "tháng"}</h5>
            </div>
            <span>{selectedRevenueTitle}</span>
          </div>

          <div className="chart-scroll">
            <div className="revenue-chart" style={{ minWidth: `${chartMinWidth}px` }}>
              {chartData.map((item) => {
                const value = Number(item.value || 0);
                const height = maxChartValue > 0 ? Math.max((value / maxChartValue) * 180, value > 0 ? 10 : 0) : 0;

                return (
                  <div className="revenue-chart__item" key={`${filters.mode}-${item.label}`}>
                    <span className="revenue-chart__value">{value > 0 ? currencyFormatter.format(value) : "0đ"}</span>
                    <div className="revenue-chart__bar-wrap">
                      <div className="revenue-chart__bar" style={{ height: `${height}px` }}></div>
                    </div>
                    <span className="revenue-chart__label">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="activity-panel">
        <div className="activity-panel__header">
          <div>
            <p className="dashboard-eyebrow">Thanh toán</p>
            <h4>Giao dịch gần nhất</h4>
          </div>
          <span>Đã thanh toán và đã hoàn tiền</span>
        </div>

        <div className="activity-table-wrap">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Gia sư</th>
                <th>Loại giao dịch</th>
                <th>Tham chiếu</th>
                <th>Cổng</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {paymentLogs.length > 0 ? (
                paymentLogs.map((item) => {
                  const statusMeta = getStatusMeta(item.status);

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="activity-table__person">
                          <strong>{item.tutor_name}</strong>
                          <span>{item.transaction_code || `GD#${item.id}`}</span>
                        </div>
                      </td>
                      <td>{item.payment_type_label}</td>
                      <td>{item.reference_label}</td>
                      <td>{getProviderLabel(item.provider)}</td>
                      <td>{currencyFormatter.format(item.amount || 0)}</td>
                      <td>
                        <span className={`status-pill ${statusMeta.className}`}>{statusMeta.label}</span>
                      </td>
                      <td>{item.occurred_at ? dateTimeFormatter.format(new Date(item.occurred_at)) : "-"}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="activity-table__empty">Chưa có giao dịch phù hợp để hiển thị.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
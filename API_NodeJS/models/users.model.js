const db = require('../common/db');

const REVENUE_DATE_EXPRESSION = 'COALESCE(p.approved_at, p.updated_at, p.created_at)';

const getPaymentProvider = (transactionCode) => {
  const normalizedCode = String(transactionCode || '').toUpperCase();

  if (normalizedCode.startsWith('MOMO_')) {
    return 'momo';
  }

  if (/^\d{6}_ZLP/.test(normalizedCode)) {
    return 'zalopay';
  }

  return 'payos';
};

const getPaymentTypeLabel = (paymentType) => {
  if (paymentType === 'verify_profile') return 'Phí tích xanh';
  if (paymentType === 'receive_job') return 'Phí nhận lớp';
  if (paymentType === 'receive_booking') return 'Phí đặt lịch';
  return 'Giao dịch khác';
};

const padNumber = (value) => String(value).padStart(2, '0');

const createChartBuckets = (mode, targetDate) => {
  if (mode === 'day') {
    return Array.from({ length: 24 }, (_, index) => ({
      key: padNumber(index),
      label: `${padNumber(index)}:00`,
      value: 0
    }));
  }

  if (mode === 'month') {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, index) => ({
      key: padNumber(index + 1),
      label: `${index + 1}`,
      value: 0
    }));
  }

  return Array.from({ length: 12 }, (_, index) => ({
    key: padNumber(index + 1),
    label: `T${index + 1}`,
    value: 0
  }));
};

const normalizeRevenueFilters = (filters = {}) => {
  const mode = ['day', 'month', 'year'].includes(filters.mode) ? filters.mode : 'month';
  const now = new Date();
  const selectedValueRaw = typeof filters.selectedValue === 'string' ? filters.selectedValue.trim() : '';

  if (mode === 'day') {
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(selectedValueRaw);
    const selectedValue = isValidDate ? selectedValueRaw : `${now.getFullYear()}-${padNumber(now.getMonth() + 1)}-${padNumber(now.getDate())}`;
    const targetDate = new Date(`${selectedValue}T00:00:00`);

    return {
      mode,
      selectedValue,
      targetDate,
      filterSql: `DATE(${REVENUE_DATE_EXPRESSION}) = ?`,
      filterParams: [selectedValue],
      groupSql: `DATE_FORMAT(${REVENUE_DATE_EXPRESSION}, '%H')`,
      chartBuckets: createChartBuckets(mode, targetDate),
      summaryLabel: `Ngày ${selectedValue.split('-').reverse().join('/')}`,
    };
  }

  if (mode === 'year') {
    const yearValue = /^\d{4}$/.test(selectedValueRaw) ? selectedValueRaw : `${now.getFullYear()}`;
    const targetDate = new Date(`${yearValue}-01-01T00:00:00`);

    return {
      mode,
      selectedValue: yearValue,
      targetDate,
      filterSql: `YEAR(${REVENUE_DATE_EXPRESSION}) = ?`,
      filterParams: [Number(yearValue)],
      groupSql: `DATE_FORMAT(${REVENUE_DATE_EXPRESSION}, '%m')`,
      chartBuckets: createChartBuckets(mode, targetDate),
      summaryLabel: `Năm ${yearValue}`,
    };
  }

  const monthValue = /^\d{4}-\d{2}$/.test(selectedValueRaw)
    ? selectedValueRaw
    : `${now.getFullYear()}-${padNumber(now.getMonth() + 1)}`;
  const targetDate = new Date(`${monthValue}-01T00:00:00`);

  return {
    mode,
    selectedValue: monthValue,
    targetDate,
    filterSql: `DATE_FORMAT(${REVENUE_DATE_EXPRESSION}, '%Y-%m') = ?`,
    filterParams: [monthValue],
    groupSql: `DATE_FORMAT(${REVENUE_DATE_EXPRESSION}, '%d')`,
    chartBuckets: createChartBuckets(mode, targetDate),
    summaryLabel: `Tháng ${monthValue.split('-')[1]}/${monthValue.split('-')[0]}`,
  };
};

const mapSeriesWithBuckets = (buckets, rows) => {
  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, { ...bucket }]));

  rows.forEach((row) => {
    const bucket = bucketMap.get(String(row.bucket));
    if (bucket) {
      bucket.value = Number(row.revenue || 0);
    }
  });

  return Array.from(bucketMap.values());
};

const Model = {
  getAll: async () => {
    return await db.query('SELECT * FROM users WHERE deleted_at IS NULL');
  },

  getById: async (id) => {
    const rows = await db.query('SELECT * FROM users WHERE user_id = ? AND deleted_at IS NULL', [id]);
    return rows[0];
  },

  // create: async (data) => {
  //   return await db.query('INSERT INTO users SET ?', data);
  // },

  create: async (data) => {
    // data lúc này là: { role_id, full_name, email, phone, password }
    // SQL sẽ tự hiểu là: INSERT INTO users (role_id, full_name, email, phone, password) VALUES (...)
    const sql = 'INSERT INTO users SET ?';
    return await db.query(sql, data);
  },

  updateAvatar: async (id, fileName) => {
      const sql = 'UPDATE users SET avatar = ? WHERE user_id = ?';
      return await db.query(sql, [fileName, id]);
  },

  // Hàm 2: Chuyên cập nhật thông tin cá nhân (Hàm này linh hoạt hơn)
  updateInfo: async (id, data) => {
      // data là 1 object: { full_name: '...', phone: '...', gender: '...' }
      // Chúng ta tạo câu SQL động để chỉ cập nhật những gì người dùng gửi lên
      const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = Object.values(data);
      values.push(id); // Thêm ID vào cuối mảng cho WHERE user_id = ?

      const sql = `UPDATE users SET ${fields} WHERE user_id = ?`;
      return await db.query(sql, values);
  },
  update: async (id, data) => {
    // Tự động tạo câu lệnh: UPDATE users SET status = ?, full_name = ? ... WHERE user_id = ?
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const sql = `UPDATE users SET ${fields} WHERE user_id = ?`;
    return await db.query(sql, values);
  },
  delete: async (id) => {
    return await db.query('UPDATE users SET deleted_at = NOW() WHERE user_id = ?', [id]);
  },

  getAdminDashboardSummary: async (filters = {}) => {
    const normalizedFilters = normalizeRevenueFilters(filters);
    const sql = `
      SELECT
        (SELECT COUNT(*)
         FROM tutors t
         JOIN users u ON u.user_id = t.user_id
         WHERE t.deleted_at IS NULL AND u.deleted_at IS NULL) AS tutor_count,
        (SELECT COUNT(*)
         FROM students s
         JOIN users u ON u.user_id = s.user_id
         WHERE s.deleted_at IS NULL AND u.deleted_at IS NULL) AS student_count,
        (SELECT COUNT(*)
         FROM posts p
         WHERE p.status = 'approved' AND p.deleted_at IS NULL) AS pending_post_count,
        (SELECT COUNT(DISTINCT p.tutor_id)
         FROM payments p
         JOIN tutors t ON t.tutor_id = p.tutor_id
         WHERE p.status = 'success'
           AND p.payment_type = 'verify_profile'
           AND p.deleted_at IS NULL
           AND t.is_verified = 0
           AND t.deleted_at IS NULL) AS verify_request_count,
        (SELECT COALESCE(SUM(p.amount), 0)
         FROM payments p
         WHERE p.status = 'success'
           AND p.deleted_at IS NULL
           AND DATE(${REVENUE_DATE_EXPRESSION}) = CURDATE()) AS revenue_today,
        (SELECT COALESCE(SUM(p.amount), 0)
         FROM payments p
         WHERE p.status = 'success'
           AND p.deleted_at IS NULL
           AND YEAR(${REVENUE_DATE_EXPRESSION}) = YEAR(CURDATE())
           AND MONTH(${REVENUE_DATE_EXPRESSION}) = MONTH(CURDATE())) AS revenue_month,
        (SELECT COALESCE(SUM(p.amount), 0)
         FROM payments p
         WHERE p.status = 'success'
           AND p.deleted_at IS NULL
           AND YEAR(${REVENUE_DATE_EXPRESSION}) = YEAR(CURDATE())) AS revenue_year,
        (SELECT COALESCE(SUM(p.amount), 0)
         FROM payments p
         WHERE p.status = 'success'
           AND p.deleted_at IS NULL
           AND ${normalizedFilters.filterSql}) AS selected_revenue
    `;
    const rows = await db.query(sql, normalizedFilters.filterParams);

    const chartSql = `
      SELECT
        ${normalizedFilters.groupSql} AS bucket,
        COALESCE(SUM(p.amount), 0) AS revenue
      FROM payments p
      WHERE p.status = 'success'
        AND p.deleted_at IS NULL
        AND ${normalizedFilters.filterSql}
      GROUP BY bucket
      ORDER BY bucket ASC
    `;
    const chartRows = await db.query(chartSql, normalizedFilters.filterParams);

    const activitySql = `
      SELECT
        p.id,
        p.tutor_id,
        p.post_id,
        p.booking_id,
        p.payment_type,
        p.amount,
        p.status,
        p.transaction_code,
        ${REVENUE_DATE_EXPRESSION} AS occurred_at,
        u.full_name AS tutor_name
      FROM payments p
      LEFT JOIN tutors t ON t.tutor_id = p.tutor_id
      LEFT JOIN users u ON u.user_id = t.user_id
      WHERE p.deleted_at IS NULL
        AND p.status IN ('success', 'refunded')
      ORDER BY occurred_at DESC, p.id DESC
      LIMIT 12
    `;
    const activityRows = await db.query(activitySql);

    return {
      ...rows[0],
      revenue_filter: {
        mode: normalizedFilters.mode,
        selected_value: normalizedFilters.selectedValue,
        summary_label: normalizedFilters.summaryLabel,
      },
      selected_revenue: Number(rows[0]?.selected_revenue || 0),
      revenue_chart: mapSeriesWithBuckets(normalizedFilters.chartBuckets, chartRows),
      refund_policy: {
        excluded_from_revenue: true,
        description: 'Doanh thu chỉ cộng giao dịch đang ở trạng thái success. Giao dịch đã hoàn tiền chuyển sang refunded và tự bị loại khỏi thống kê.'
      },
      recent_payment_logs: activityRows.map((item) => ({
        id: item.id,
        tutor_name: item.tutor_name || `Gia sư #${item.tutor_id || '-'}`,
        payment_type: item.payment_type,
        payment_type_label: getPaymentTypeLabel(item.payment_type),
        provider: getPaymentProvider(item.transaction_code),
        amount: Number(item.amount || 0),
        status: item.status,
        occurred_at: item.occurred_at,
        transaction_code: item.transaction_code,
        reference_label: item.post_id
          ? `Bài đăng #${item.post_id}`
          : item.booking_id
            ? `Đặt lịch #${item.booking_id}`
            : `Hồ sơ #${item.tutor_id || item.id}`,
      })),
    };
  },

  // Hàm lấy số lượng các mục đang chờ duyệt cho Badge Sidebar
  getPendingCounts: async () => {
    const sql = `
      SELECT
        (SELECT COUNT(*)
         FROM tutors t
         JOIN users u ON u.user_id = t.user_id
         WHERE t.approval_status = 'pending'
           AND t.deleted_at IS NULL
           AND u.deleted_at IS NULL) AS tutor_count,
        (SELECT COUNT(*)
         FROM posts p
         WHERE p.status = 'pending'
           AND p.deleted_at IS NULL) AS post_count,
        (SELECT COUNT(DISTINCT p.tutor_id)
         FROM payments p
         JOIN tutors t ON t.tutor_id = p.tutor_id
         WHERE p.status = 'success'
           AND p.payment_type = 'verify_profile'
           AND p.deleted_at IS NULL
           AND t.is_verified = 0
           AND t.deleted_at IS NULL) AS verify_request_count
    `;
    const rows = await db.query(sql);
    return rows[0];
  }
};

module.exports = Model;
import React, { useEffect, useMemo, useState } from 'react';
import '../styles/Home.css';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import axiosInstance from '../untils/axiosIntance';

const MAX_HOUSEHOLD = 100;
const MAX_SINGLE_ROOMS = 50;
const MAX_DOUBLE_ROOMS = 50;

const AGE_COLORS = ['#27ae60', '#e74c3c', '#ff9900', '#1972bb', '#8e44ad'];

const getAge = (dob) => {
  if (!dob) return 0;

  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age;
};

const isWithin14Days = (dateStr) => {
  if (!dateStr) return false;

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  const diffTime = Math.abs(today - date);
  return diffTime / (1000 * 60 * 60 * 24) <= 14;
};

const getMonthName = (month) => {
  const months = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ];

  return months[month];
};

const formatCurrency = (amount) =>
  `${Number(amount || 0).toLocaleString('vi-VN')} VNĐ`;

const asArray = (value) => (Array.isArray(value) ? value : []);

const isCurrentMonthCollection = (collection, month, year) => {
  const startDate = new Date(collection.StartDate);
  const endDate = collection.EndDate ? new Date(collection.EndDate) : startDate;

  const startMatches =
    !Number.isNaN(startDate.getTime()) &&
    startDate.getMonth() === month &&
    startDate.getFullYear() === year;

  const endMatches =
    !Number.isNaN(endDate.getTime()) &&
    endDate.getMonth() === month &&
    endDate.getFullYear() === year;

  return startMatches || endMatches;
};

const StatCard = ({ title, value, note, tone }) => (
  <div className={`dashboard-stat-card ${tone ? `tone-${tone}` : ''}`}>
    <span className="dashboard-stat-title">{title}</span>
    <strong>{value}</strong>
    {note && <span className="dashboard-stat-note">{note}</span>}
  </div>
);

const MetricLine = ({ label, value }) => (
  <div className="dashboard-metric-line">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const Home = () => {
  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved === null ? false : JSON.parse(saved);
  });

  const [households, setHouseholds] = useState([]);
  const [residents, setResidents] = useState([]);
  const [feeCollections, setFeeCollections] = useState([]);
  const [feeDetails, setFeeDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(open));
  }, [open]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');

      try {
        const [householdRes, residentRes, feeCollectionRes, feeDetailRes] =
          await Promise.all([
            axiosInstance.get('/households/get-all-households'),
            axiosInstance.get('/residents/get-all-residents'),
            axiosInstance.get('/fee-collection/get-all-collection'),
            axiosInstance.get('/fee-detail/get-all-fee-detail'),
          ]);

        setHouseholds(asArray(householdRes.data.households || householdRes.data));
        setResidents(asArray(residentRes.data.residents || residentRes.data));
        setFeeCollections(asArray(feeCollectionRes.data.feeCollections || feeCollectionRes.data));
        setFeeDetails(asArray(feeDetailRes.data.feeDetails || feeDetailRes.data));
      } catch (fetchError) {
        setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const currentMonthCollections = feeCollections.filter((collection) =>
      isCurrentMonthCollection(collection, currentMonth, currentYear)
    );

    const currentMonthFeeDetails = feeDetails.filter((detail) =>
      currentMonthCollections.some(
        (collection) => collection.CollectionID === detail.CollectionID
      )
    );

    const payableFeeDetails = currentMonthFeeDetails.filter(
      (detail) => Number(detail.Amount) !== 0
    );

    const paidFeeDetails = payableFeeDetails.filter(
      (detail) => detail.PaymentStatus === 'Đã đóng'
    );

    const paymentPercentage =
      payableFeeDetails.length > 0
        ? (paidFeeDetails.length / payableFeeDetails.length) * 100
        : 0;

    const totalAmount = currentMonthFeeDetails.reduce((sum, detail) => {
      if (detail.PaymentStatus !== 'Đã đóng') return sum;
      return sum + (parseFloat(detail.Amount) || 0);
    }, 0);

    const singleRooms = households.filter((household) => household.Type === 'Đơn');
    const doubleRooms = households.filter((household) => household.Type === 'Đôi');

    const permanentCount = residents.filter(
      (resident) => resident.ResidencyStatus === 'Thường trú'
    ).length;
    const temporaryCount = residents.filter(
      (resident) => resident.ResidencyStatus === 'Tạm trú'
    ).length;
    const awayCount = residents.filter(
      (resident) => resident.ResidencyStatus === 'Tạm vắng'
    ).length;
    const movedCount = residents.filter(
      (resident) => resident.ResidencyStatus === 'Đã chuyển đi'
    ).length;

    return {
      monthName: getMonthName(currentMonth),
      totalHouseholds: households.length,
      totalResidents: residents.length,
      availableSingleRooms: MAX_SINGLE_ROOMS - singleRooms.length,
      availableDoubleRooms: MAX_DOUBLE_ROOMS - doubleRooms.length,
      totalFeeTypes: new Set(currentMonthCollections.map((collection) => collection.FeeType)).size,
      totalAmount,
      paymentPercentage,
      paidFeeDetails: paidFeeDetails.length,
      totalFeeDetails: payableFeeDetails.length,
      newComeCount: residents.filter((resident) => isWithin14Days(resident.RegistrationDate)).length,
      newLeaveCount: residents.filter(
        (resident) =>
          resident.ResidencyStatus === 'Đã chuyển đi' &&
          isWithin14Days(resident.RegistrationDate)
      ).length,
      residencyData: [
        { name: 'Thường trú', value: permanentCount },
        { name: 'Tạm trú', value: temporaryCount },
        { name: 'Tạm vắng', value: awayCount },
        { name: 'Chuyển đi', value: movedCount },
      ],
      roomData: [
        { name: 'Phòng đơn', used: singleRooms.length, available: MAX_SINGLE_ROOMS - singleRooms.length },
        { name: 'Phòng đôi', used: doubleRooms.length, available: MAX_DOUBLE_ROOMS - doubleRooms.length },
      ],
    };
  }, [feeCollections, feeDetails, households, residents]);

  const ageData = useMemo(() => {
    const getCount = (predicate) =>
      residents.filter((resident) => predicate(getAge(resident.DateOfBirth || resident.dateOfBirth))).length;

    return [
      { name: 'Trẻ em', value: getCount((age) => age < 12) },
      { name: 'Thanh niên', value: getCount((age) => age >= 12 && age <= 18) },
      { name: 'Trưởng thành', value: getCount((age) => age >= 19 && age <= 39) },
      { name: 'Trung niên', value: getCount((age) => age >= 40 && age <= 65) },
      { name: 'Người cao tuổi', value: getCount((age) => age > 65) },
    ];
  }, [residents]);

  const paymentProgress = Math.min(Math.max(stats.paymentPercentage, 0), 100);

  return (
    <div className="home-container">
      <Header />
      <Sidebar open={open} setOpen={setOpen} />

      <main className={`home-content ${open ? 'sidebar-open' : 'sidebar-closed'}`}>
        <section className="dashboard">


          {error && <div className="dashboard-alert">{error}</div>}
          {loading && <div className="dashboard-loading">Đang tải dữ liệu thống kê...</div>}

          <div className="dashboard-stats">
            <StatCard
              title="Hộ gia đình"
              value={`${stats.totalHouseholds}/${MAX_HOUSEHOLD}`}
              note="Tổng số hộ đang quản lý"
              tone="blue"
            />
            <StatCard
              title="Nhân khẩu"
              value={stats.totalResidents}
              note="Cư dân trong hệ thống"
              tone="green"
            />
            <StatCard
              title="Đã thu trong tháng"
              value={formatCurrency(stats.totalAmount)}
              note={`${stats.paidFeeDetails}/${stats.totalFeeDetails} khoản đã đóng`}
              tone="gold"
            />
            <StatCard
              title="Hoàn thành thu phí"
              value={`${stats.paymentPercentage.toFixed(1)}%`}
              note={stats.completionLevel}
              tone="cyan"
            />
          </div>

          <div className="dashboard-grid">
            <section className="dashboard-panel payment-panel">
              <div className="panel-heading">
                <h2>Thu phí {stats.monthName}</h2>
                <span>{stats.completionLevel}</span>
              </div>
              <div className="payment-progress">
                <div style={{ width: `${paymentProgress}%` }} />
              </div>
              <div className="dashboard-metrics">
                <MetricLine label="Loại phí phát sinh" value={stats.totalFeeTypes} />
                <MetricLine label="Khoản đã đóng" value={stats.paidFeeDetails} />
                <MetricLine label="Tổng khoản cần thu" value={stats.totalFeeDetails} />
                <MetricLine label="Tổng tiền đã thu" value={formatCurrency(stats.totalAmount)} />
              </div>
            </section>

            <section className="dashboard-panel">
              <div className="panel-heading">
                <h2>Cư trú</h2>
                <span>14 ngày gần đây</span>
              </div>
              <div className="dashboard-metrics">
                <MetricLine label="Thường trú" value={stats.residencyData[0].value} />
                <MetricLine label="Tạm trú" value={stats.residencyData[1].value} />
                <MetricLine label="Mới chuyển đến" value={stats.newComeCount} />
                <MetricLine label="Mới chuyển đi" value={stats.newLeaveCount} />
              </div>
            </section>
          </div>

          <div className="dashboard-charts">
            <section className="dashboard-panel chart-panel">
              <div className="panel-heading">
                <h2>Cơ cấu nhân khẩu</h2>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={ageData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    label
                  >
                    {ageData.map((entry, index) => (
                      <Cell key={entry.name} fill={AGE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </section>

            <section className="dashboard-panel chart-panel">
              <div className="panel-heading">
                <h2>Tình trạng phòng</h2>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={stats.roomData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="used" name="Đã sử dụng" fill="#1972bb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="available" name="Còn trống" fill="#27ae60" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </section>
          </div>
        </section>
      </main>

   
    </div>
  );
};

export default Home;

import React from 'react';
import {
  FaHome,
  FaUsers,
  FaUserFriends,
  FaMoneyBill,
  FaCar,
  FaUser,
  FaAddressBook,
  FaMoneyCheck,
  FaSignOutAlt,
  FaChevronDown,
} from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

const menuItems = [
  { icon: <FaHome />, label: 'Trang chủ', path: '/home' },
  { icon: <FaUsers />, label: 'Hộ gia đình', path: '/household' },
  { icon: <FaUserFriends />, label: 'Nhân khẩu', path: '/resident' },
  { icon: <FaMoneyBill />, label: 'Thu phí', path: '/fee' },
  { icon: <FaCar />, label: 'Phương tiện', path: '/vehicle' },
];

const dropdownItems = [
  { icon: <FaAddressBook />, label: 'Trang cá nhân', path: '/profile' },
  { icon: <FaMoneyCheck />, label: 'Quản lý loại phí', path: '/fee-type', adminOnly: true },
  { icon: <FaUser />, label: 'Quản lý người dùng', path: '/account', adminOnly: true },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role');
  const displayName =
    localStorage.getItem('fullname') ||
    localStorage.getItem('username') ||
    'Nguyễn Văn A';

  const userMenu = dropdownItems.filter(
    item => !item.adminOnly || userRole === 'Tổ trưởng'
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('id');
    navigate('/login');
  };

  return (
    <header className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate('/home')}>
        BlueMoon
      </div>

      <nav className="sidebar-menu" aria-label="Điều hướng chính">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <button className="sidebar-user-button" type="button">
          <FaUser />
          <span>{displayName}</span>
          <FaChevronDown className="sidebar-user-chevron" />
        </button>

        <div className="sidebar-dropdown">
          {userMenu.map((item) => (
            <button
              key={item.path}
              className="sidebar-dropdown-item"
              type="button"
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          <button
            className="sidebar-dropdown-item"
            type="button"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Sidebar;

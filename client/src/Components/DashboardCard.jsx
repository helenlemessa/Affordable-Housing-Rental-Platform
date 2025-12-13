// src/components/DashboardCard.jsx
import { Link } from 'react-router-dom';

const DashboardCard = ({ title, count, link }) => {
  return (
    <Link to={link} className="block">
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-2 text-3xl font-bold text-blue-600">{count}</p>
        <p className="mt-1 text-sm text-gray-500">View details →</p>
      </div>
    </Link>
  );
};

export default DashboardCard;
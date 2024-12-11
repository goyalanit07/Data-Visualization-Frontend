import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import { useLocation } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement);

const Dashboard: React.FC = () => {
  const [barData, setBarData] = useState<any>(null);
  const [lineData, setLineData] = useState<any>(null);
  const [selectedBar, setSelectedBar] = useState<string>('A');
  const [filters, setFilters] = useState({
    startDate: '2022-10-04',
    endDate: '2022-10-10',
    ageGroup: '',
    gender: ''
  });

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ageGroup = params.get('ageGroup') || '';
    const gender = params.get('gender') || '';
    const startDate = params.get('startDate') || '2022-10-04';
    const endDate = params.get('endDate') || '2022-10-10';

    setFilters({ startDate, endDate, ageGroup, gender });

    fetchData(startDate, endDate, ageGroup, gender, selectedBar);
  }, [location]);

  const fetchData = async (startDate: string, endDate: string, ageGroup: string, gender: string, feature: string) => {
    try {
      const barResponse = await axios.get(`http://localhost:5000/analytics/bar-chart`, { params: { startDate, endDate, ageGroup, gender } });
      setBarData(barResponse.data);

      const lineResponse = await axios.get(`http://localhost:5000/analytics/line-chart`, { params: { startDate, endDate, ageGroup, gender, feature } });
      setLineData(lineResponse.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const handleBarClick = (index: number) => {
    const feature = ['A', 'B', 'C', 'D', 'E', 'F'][index];
    setSelectedBar(feature);

    fetchData(filters.startDate, filters.endDate, filters.ageGroup, filters.gender, feature);
  };

  const barChartData = {
    labels: ['A', 'B', 'C', 'D', 'E', 'F'],
    datasets: [{
      label: 'Total Time Spent',
      data: [
        barData?.data?.A,
        barData?.data?.B,
        barData?.data?.C,
        barData?.data?.D,
        barData?.data?.E,
        barData?.data?.F
      ],
      backgroundColor: ['A', 'B', 'C', 'D', 'E', 'F'].map(feature =>
        feature === selectedBar ? '#FF6347' : '#42A5F5'
      ),
      borderColor: '#1E88E5',
      borderWidth: 1,
      barPercentage: 0.5,
      categoryPercentage: 0.8
    }],
  };

  const lineChartData = {
    labels: lineData?.data?.map((entry: any) => entry.date),
    datasets: [{
      label: `Feature ${selectedBar} Trend`,
      data: lineData?.data?.map((entry: any) => entry.value),
      borderColor: '#FF6347',
      borderWidth: 2,
      fill: false,
    }],
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-3xl font-semibold text-center mb-6">Interactive Data Dashboard</h1>

      {/* Filters Component */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <label className="flex flex-col">
            Age Group:
            <select
              value={filters.ageGroup}
              onChange={(e) => {
                setFilters({ ...filters, ageGroup: e.target.value });
                fetchData(filters.startDate, filters.endDate, e.target.value, filters.gender, selectedBar);
              }}
              className="mt-1 p-2 border rounded"
            >
              <option value="">All</option>
              <option value="15-25">15-25</option>
              <option value=">25">25</option>
            </select>
          </label>

          <label className="flex flex-col">
            Gender:
            <select
              value={filters.gender}
              onChange={(e) => {
                setFilters({ ...filters, gender: e.target.value });
                fetchData(filters.startDate, filters.endDate, filters.ageGroup, e.target.value, selectedBar);
              }}
              className="mt-1 p-2 border rounded"
            >
              <option value="">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>

          {/* Date range selector */}
          <label className="flex flex-col">
            Start Date:
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => {
                setFilters({ ...filters, startDate: e.target.value });
                fetchData(e.target.value, filters.endDate, filters.ageGroup, filters.gender, selectedBar);
              }}
              className="mt-1 p-2 border rounded"
            />
          </label>

          <label className="flex flex-col">
            End Date:
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                setFilters({ ...filters, endDate: e.target.value });
                fetchData(filters.startDate, e.target.value, filters.ageGroup, filters.gender, selectedBar);
              }}
              className="mt-1 p-2 border rounded"
            />
          </label>
        </div>
      </div>
      <div className="flex flex-wrap justify-center space-x-4">
        {/* Display Bar Chart */}
        {barData && (
          <div className="w-4/5 max-w-[400px] h-[200px] m-6">
            <h2 className="text-xl font-medium mb-2 text-center">Feature Time Aggregation</h2>
            <Bar
              typeof="bar"
              data={barChartData}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                onClick: (event, elements) => {
                  if (elements.length > 0) {
                    const index = elements[0].index;
                    handleBarClick(index);
                  }
                },
              }}
            />
          </div>
        )}

        {/* Display Line Chart */}
        {lineData && (
          <div className="w-4/5 max-w-[400px] h-[200px] m-6">
            <h2 className="text-xl font-medium mb-2 text-center">Feature Trend</h2>
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

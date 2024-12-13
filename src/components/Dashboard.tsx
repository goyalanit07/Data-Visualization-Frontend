import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import Cookies from "js-cookie";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import { useLocation, useNavigate } from 'react-router-dom';
import zoom from 'chartjs-plugin-zoom';
import api, { logout } from "../services/api";
import { AgeGroup, Gender, BarType, Filters, BarData, LineData } from "../types/chartTypes";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, zoom);

const defaultFilters: Filters = {
  startDate: '2022-10-04',
  endDate: '2022-10-10',
  ageGroup: '',
  gender: '',
  selectedBar: 'A'
}

const toQueryString = (filters: Filters): string => {
  return new URLSearchParams(
    Object.entries(filters)
      .filter(([_, value]) => value !== null) // Remove null values
      .reduce((acc, [key, value]) => {
        acc[key] = value?.toString() || ''; // Convert values to strings
        return acc;
      }, {} as Record<string, string>)
  ).toString();
};

const Dashboard: React.FC = () => {

  const [barData, setBarData] = useState<BarData | null>(null);
  const [lineData, setLineData] = useState<LineData | null>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedFilters = Cookies.get('dashboardFilters');

    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
      } catch (error) {
        console.error("Failed to parse filters from cookies", error);
        Cookies.remove('dashboardFilters');
      }
    }

    const params = new URLSearchParams(location.search);
    const ageGroup: AgeGroup = (params.get('ageGroup') as AgeGroup) || filters.ageGroup;
    const gender: Gender = (params.get('gender') as Gender) || filters.gender;
    const startDate: string = params.get('startDate') || filters.startDate;
    const endDate: string = params.get('endDate') || filters.endDate;
    const selectedBar: BarType = (params.get('selectedBar') as BarType) || filters.selectedBar;

    setFilters({ startDate, endDate, ageGroup, gender, selectedBar });

    fetchData(startDate, endDate, ageGroup, gender, selectedBar);
  }, [location]);

  useEffect(() => {
    Cookies.set('dashboardFilters', JSON.stringify(filters));
  }, [filters]);

  const fetchData = async (
    startDate: string,
    endDate: string,
    ageGroup: AgeGroup,
    gender: Gender,
    feature: BarType
  ) => {
    try {
      const barResponse = await api.get<BarData>("/analytics/bar-chart", {
        params: { startDate, endDate, ageGroup, gender },
      });
      setBarData(barResponse.data);

      const lineResponse = await api.get<LineData>("/analytics/line-chart", {
        params: { startDate, endDate, ageGroup, gender, feature }
      });
      setLineData(lineResponse.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const handleBarClick = (index: number) => {
    const barFeatures: BarType[] = ['A', 'B', 'C', 'D', 'E', 'F'];
    const feature = barFeatures[index];

    setFilters((prevFilters) => {
      const updatedFilters = {
        ...prevFilters,
        selectedBar: feature,
      };
      updateUrl(updatedFilters);
      return updatedFilters;
    });

    fetchData(filters.startDate, filters.endDate, filters.ageGroup, filters.gender, feature);
  };

  const generateShareableLink = () => {
    const query = toQueryString(filters);
    return `${window.location.origin}/?${query}`;
  };

  const updateUrl = (newFilters: Filters) => {
    const query = toQueryString(newFilters);
    navigate(`/?${query}`, { replace: true });
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    updateUrl(newFilters);
    fetchData(newFilters.startDate, newFilters.endDate, newFilters.ageGroup, newFilters.gender, newFilters.selectedBar);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    Cookies.remove('dashboardFilters');
    updateUrl(defaultFilters);
    fetchData(defaultFilters.startDate, defaultFilters.endDate, defaultFilters.ageGroup, defaultFilters.gender, defaultFilters.selectedBar);
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
        feature === filters.selectedBar ? '#FF6347' : '#42A5F5'
      ),
      borderColor: '#1E88E5',
      borderWidth: 1,
      barPercentage: 0.5,
      categoryPercentage: 0.8
    }],
  };

  const lineChartData = {
    labels: lineData?.data?.map((entry) => entry.date),
    datasets: [{
      label: `Feature ${filters.selectedBar} Trend`,
      data: lineData?.data?.map((entry) => entry.value),
      borderColor: '#FF6347',
      borderWidth: 2,
      fill: false,
    }],
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login")
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6 flex flex-col">
      <div className="bg-white rounded-lg shadow-sm">
        <header className="flex justify-between items-center p-4 mb-6">
          <h1 className="text-2xl font-semibold">Interactive Data Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition"
          >
            Logout
          </button>
        </header>

        {/* Filters Component */}
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <label className="flex flex-col">
              Age Group:
              <select
                value={filters.ageGroup || ''}
                onChange={(e) => {
                  const newFilters = { ...filters, ageGroup: e.target.value as AgeGroup };
                  handleFilterChange(newFilters);
                }}
                className="mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="15-25">15-25</option>
                <option value=">25">25</option>
              </select>
            </label>

            <label className="flex flex-col">
              Gender:
              <select
                value={filters.gender || ""}
                onChange={(e) => {
                  const newFilters = { ...filters, gender: e.target.value as Gender };
                  handleFilterChange(newFilters);
                }}
                className="mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>

            <label className="flex flex-col">
              Start Date:
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  const newFilters = { ...filters, startDate: e.target.value };
                  handleFilterChange(newFilters);
                }}
                className="mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex flex-col">
              End Date:
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  const newFilters = { ...filters, endDate: e.target.value };
                  handleFilterChange(newFilters);
                }}
                className="mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>

          <div className="mt-4">
            <button
              onClick={resetFilters}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
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
                onClick: (_, elements) => {
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
                  zoom: {
                    zoom: {
                      wheel: {
                        enabled: true,
                      },
                      pinch: {
                        enabled: true,
                      },
                      mode: 'x',
                    },
                    pan: {
                      enabled: true,
                      mode: 'x',
                    },
                  },
                },
              }}
            />
          </div>
        )}
      </div>

      <div className="flex justify-center m-6">
        <button
          onClick={() => (navigator.clipboard.writeText(generateShareableLink()), alert("Link copied to clipboard!"))}
          className="bg-blue-400 text-white py-1 px-2 rounded hover:bg-blue-500 transition-colors"
        >
          Copy Link
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

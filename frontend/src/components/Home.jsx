import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import Quotation from "./Quotation";
import { AiOutlineUser } from "react-icons/ai";
import axios from "axios";

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showQuotation, setShowQuotation] = useState(!!searchParams.get("q"));
  const [selectedQuotation, setSelectedQuotation] = useState(searchParams.get("q") || null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/quotations");
        setSuggestions(response.data.map((q) => q.quotation_number));
      } catch (error) {
        console.error("Error fetching quotations:", error);
      }
    };
    fetchQuotations();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowQuotation(false);

    if (value.trim() === "") {
      setSuggestions([]);
      setSearchParams({});
    } else {
      const filteredSuggestions = suggestions.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm });
      setShowQuotation(true);
      setSelectedQuotation(searchTerm);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setSearchParams({ q: suggestion });
    setSuggestions([]);
    setShowQuotation(true);
    setSelectedQuotation(suggestion);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div
        className={`flex-1 transition-all duration-500 ${
          sidebarOpen ? "ml-72" : "ml-16"
        }`}
      >
        <header
          className="fixed top-0 right-0 z-10 flex justify-between items-center bg-[#1a1a1a] text-white px-6 py-4 h-16"
          style={{
            width: `calc(100% - ${sidebarOpen ? "18rem" : "4rem"})`,
          }}
        >
          <h1 className="text-xl font-bold">SST Cutting Tools</h1>
          <div
            className="text-2xl cursor-pointer"
            onClick={() => navigate("/user")}
          >
            <AiOutlineUser />
          </div>
        </header>

        <main className="mt-20 px-6">
          <div className="bg-white rounded-lg shadow p-6">
            <form className="w-full relative" onSubmit={handleSubmit}>
              <label
                htmlFor="default-search"
                className="mb-2 text-sm font-medium text-gray-900 sr-only"
              >
                Search
              </label>
              <div className="relative flex">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <input
                  type="search"
                  id="default-search"
                  className="block flex-grow p-4 pl-12 text-sm text-gray-900 border border-gray-300 rounded-l-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search Quotation Number"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  required
                />
                <button
                  type="submit"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-r-lg text-sm px-6"
                >
                  Search
                </button>
              </div>

              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-4 text-sm text-gray-800 cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>

          {showQuotation && <Quotation quotationNumber={selectedQuotation} />}
        </main>
      </div>
    </div>
  );
};

export default Home;
import React, { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EVOwnerDetails() {
  const BASE = "#b23200";

  const [month, setMonth] = useState(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}`;
  });

  const [searchAccount, setSearchAccount] = useState("");
  const [searchName, setSearchName] = useState("");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchAccount) params.append("accountNo", searchAccount);
      if (searchName) params.append("username", searchName);

      const res = await fetch(
        `http://localhost:8088/EV/api/admins/ev-owners?${params.toString()}`
      );

      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();

      const mapped = (Array.isArray(data) ? data : []).map((r) => ({
        ...r,
        totalSessions: r.totalSessions ?? 0,
      }));

      setRows(mapped);
    } catch (err) {
      toast.error("Failed to load EV owner data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const okAcc =
        !searchAccount ||
        String(r.accountNo || "")
          .toLowerCase()
          .includes(searchAccount.toLowerCase());

      const okName =
        !searchName ||
        String(r.username || "")
          .toLowerCase()
          .includes(searchName.toLowerCase());

      return okAcc && okName;
    });
  }, [rows, searchAccount, searchName]);

  const clearFilters = () => {
    setSearchAccount("");
    setSearchName("");
    setTimeout(() => loadData(), 0);
  };

  const handleCreateBill = (row) => {
    toast.success(`Bill request created for ${row.accountNo} (${month})`);
  };

  const downloadCsv = () => {
    const params = new URLSearchParams();
    if (searchAccount) params.append("accountNo", searchAccount);
    if (searchName) params.append("username", searchName);

    window.open(
      `http://localhost:8088/EV/api/admins/ev-owners/csv?${params.toString()}`,
      "_blank"
    );
  };

  return (
    <>
      {/* ✅ card goes UP + stays IN FRONT of red header */}
      <div className="relative z-30 -mt-28 px-4 md:px-10 pb-6">
        <div className="w-full">
          <div className="overflow-hidden bg-white border shadow-lg border-blueGray-100 rounded-2xl">
            {/* Title + Filters */}
            <div className="px-6 py-5 border-b border-blueGray-100">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-[220px]">
                  <h2 className="text-xl font-extrabold" style={{ color: BASE }}>
                    EV Owner Details
                  </h2>
                  <p className="text-xs text-blueGray-400">
                    Filter by Month • Account No • User Name
                  </p>
                </div>

                {/* ✅ responsive controls */}
                <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-6">
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="h-10 px-3 text-sm bg-white border rounded-lg border-blueGray-200 text-blueGray-700 focus:outline-none focus:ring-2 focus:ring-blueGray-200"
                  />

                  <input
                    type="text"
                    placeholder="Account No"
                    value={searchAccount}
                    onChange={(e) => setSearchAccount(e.target.value)}
                    className="h-10 px-3 text-sm bg-white border rounded-lg border-blueGray-200 text-blueGray-700 focus:outline-none focus:ring-2 focus:ring-blueGray-200"
                  />

                  <input
                    type="text"
                    placeholder="User Name"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="h-10 px-3 text-sm bg-white border rounded-lg border-blueGray-200 text-blueGray-700 focus:outline-none focus:ring-2 focus:ring-blueGray-200"
                  />

                  <button
                    onClick={clearFilters}
                    className="h-10 px-4 text-sm font-bold transition border rounded-lg border-blueGray-200 text-blueGray-600 hover:bg-blueGray-50"
                  >
                    Clear
                  </button>

                  <button
                    onClick={loadData}
                    className="h-10 px-4 text-sm font-extrabold text-white transition rounded-lg shadow hover:shadow-md"
                    style={{ backgroundColor: BASE }}
                  >
                    Apply
                  </button>

                  <button
                    onClick={downloadCsv}
                    className="h-10 px-4 text-sm font-extrabold text-white transition rounded-lg shadow hover:shadow-md"
                    style={{ backgroundColor: "#0f766e" }}
                  >
                    Download CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1200px] text-sm">
                <thead>
                  <tr
                    style={{ backgroundColor: "rgba(178, 50, 0, 0.9)" }}
                    className="border-b border-blueGray-100"
                  >
                    {[
                      "Account No",
                      "User Name",
                      "Sessions",
                      "Email",
                      "Contact",
                      "Vehicles Owned",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-xs font-extrabold tracking-wider text-left uppercase"
                        style={{ color: "#ffffff" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-blueGray-100">
                  {loading ? (
                    <tr>
                      <td className="px-6 py-8 text-blueGray-500" colSpan={7}>
                        Loading...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td className="px-6 py-8 text-blueGray-500" colSpan={7}>
                        No records found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r, idx) => (
                      <tr
                        key={`${r.username}-${idx}`}
                        className={
                          (idx % 2 === 0 ? "bg-white" : "bg-blueGray-50/40") +
                          " hover:bg-blueGray-50 transition"
                        }
                      >
                        <td className="px-6 py-4 font-semibold text-blueGray-700">
                          {r.accountNo}
                        </td>
                        <td className="px-6 py-4 text-blueGray-700">
                          {r.username}
                        </td>
                        <td className="px-6 py-4 text-blueGray-700">
                          {r.totalSessions ?? 0}
                        </td>
                        <td className="px-6 py-4 text-blueGray-700">
                          {r.email || "-"}
                        </td>
                        <td className="px-6 py-4 text-blueGray-700">
                          {r.contactNo || "-"}
                        </td>
                        <td className="px-6 py-4 text-blueGray-700">
                          {r.noOfVehiclesOwned ?? 0}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleCreateBill(r)}
                            className="px-4 py-2 text-xs font-extrabold text-white transition rounded-lg shadow hover:shadow-md"
                            style={{ backgroundColor: BASE }}
                          >
                            Create Bill
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 text-xs bg-white border-t text-blueGray-400 border-blueGray-100">
              Showing <span className="font-bold">{filtered.length}</span>{" "}
              records • Selected Month <span className="font-bold">{month}</span>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </>
  );
}

import { useState } from 'react';
import { FaDownload, FaTrash, FaGasPump, FaTachometerAlt, FaCalendar } from 'react-icons/fa';
import { Card } from '@web/ui/components/Card';
import { Button } from '@web/ui/components/Button';
import { useMileages } from '../api/use-mileages';
import { formatCurrency, formatDate } from '@web/shared/helpers/format';

export function MileageListScreen() {
  const { mileages, loading, error, deleteMileage, clearAllData, exportToCSV } = useMileages();
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const handleClearAll = async () => {
    await clearAllData();
    setShowConfirmClear(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this log?')) {
      await deleteMileage(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mileage logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Mileage Logs</h2>
          <p className="text-gray-600 mt-1">View and manage your mileage entries</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={exportToCSV} variant="secondary" className="flex items-center gap-2">
            <FaDownload />
            <span>Export CSV</span>
          </Button>
          <Button onClick={() => setShowConfirmClear(true)} variant="danger" className="flex items-center gap-2">
            <FaTrash />
            <span>Clear All</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {showConfirmClear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Clear All Data</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete all mileage logs? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowConfirmClear(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleClearAll}>
                Yes, Clear All
              </Button>
            </div>
          </Card>
        </div>
      )}

      {mileages.length === 0 ? (
        <Card className="text-center py-12">
          <FaTachometerAlt className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Mileage Logs</h3>
          <p className="text-gray-600">You haven't added any mileage logs yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {mileages.map((log) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <FaCalendar className="text-sm" />
                      <span className="text-sm font-medium">Date</span>
                    </div>
                    <p className="text-gray-900 font-semibold">{formatDate(log.timestamp)}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <FaTachometerAlt className="text-sm" />
                      <span className="text-sm font-medium">Mileage</span>
                    </div>
                    <p className="text-gray-900 font-semibold">{log.currentReading.toLocaleString()} mi</p>
                    <p className="text-sm text-gray-500">Fuel Gauge: {log.fuelGauge}/11</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <FaGasPump className="text-sm" />
                      <span className="text-sm font-medium">Fuel Purchase</span>
                    </div>
                    {log.justBoughtFuel ? (
                      <>
                        <p className="text-green-600 font-semibold">Yes</p>
                        <p className="text-sm text-gray-900">
                          {log.fuelAmount ? formatCurrency(log.fuelAmount) : 'N/A'}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500 font-semibold">No</p>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2">
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(log.id)}
                    className="px-3 py-2"
                  >
                    <FaTrash />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {mileages.length > 0 && (
        <div className="mt-6 text-center text-gray-600">
          <p>Total: {mileages.length} log{mileages.length !== 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  );
}

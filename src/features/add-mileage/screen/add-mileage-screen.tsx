import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTachometerAlt, FaGasPump, FaCar } from 'react-icons/fa';
import { Card } from '@web/ui/components/Card';
import { Button } from '@web/ui/components/Button';
import { Input } from '@web/ui/components/Input';
import { appService } from '@web/shared/services/app.service';
import { ROUTES } from '@web/shared/constants/routes';

export function AddMileageScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    currentReading: '',
    fuelGauge: '',
    justBoughtFuel: false,
    fuelAmount: '',
    fuelPricePerLiter: '',
    fuelLiters: '',
    carRangeEstimate: '',
    carTankAverage: '',
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentReading) {
      newErrors.currentReading = 'Current reading is required';
    } else if (Number(formData.currentReading) <= 0) {
      newErrors.currentReading = 'Current reading must be greater than 0';
    }

    if (!formData.fuelGauge) {
      newErrors.fuelGauge = 'Fuel gauge is required';
    } else {
      const gauge = Number(formData.fuelGauge);
      if (gauge < 1 || gauge > 11) {
        newErrors.fuelGauge = 'Fuel gauge must be between 1 and 11';
      }
    }

    if (formData.justBoughtFuel) {
      if (formData.fuelPricePerLiter && Number(formData.fuelPricePerLiter) <= 0) {
        newErrors.fuelPricePerLiter = 'Fuel price must be greater than 0';
      }

      if (formData.fuelLiters && Number(formData.fuelLiters) <= 0) {
        newErrors.fuelLiters = 'Fuel liters must be greater than 0';
      }

      if (formData.fuelAmount && Number(formData.fuelAmount) <= 0) {
        newErrors.fuelAmount = 'Fuel amount must be greater than 0';
      }
    }

    if (formData.carRangeEstimate && Number(formData.carRangeEstimate) <= 0) {
      newErrors.carRangeEstimate = 'Range estimate must be greater than 0';
    }

    if (formData.carTankAverage && Number(formData.carTankAverage) <= 0) {
      newErrors.carTankAverage = 'Tank average must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Auto-calculate fuelAmount if price and liters are provided
      let calculatedAmount = formData.fuelAmount ? Number(formData.fuelAmount) : undefined;
      if (!calculatedAmount && formData.fuelPricePerLiter && formData.fuelLiters) {
        calculatedAmount = Number(formData.fuelPricePerLiter) * Number(formData.fuelLiters);
      }

      await appService.addMileage({
        currentReading: Number(formData.currentReading),
        fuelGauge: Number(formData.fuelGauge),
        justBoughtFuel: formData.justBoughtFuel,
        fuelAmount: calculatedAmount,
        fuelPricePerLiter: formData.fuelPricePerLiter ? Number(formData.fuelPricePerLiter) : undefined,
        fuelLiters: formData.fuelLiters ? Number(formData.fuelLiters) : undefined,
        carRangeEstimate: formData.carRangeEstimate ? Number(formData.carRangeEstimate) : undefined,
        carTankAverage: formData.carTankAverage ? Number(formData.carTankAverage) : undefined,
      });

      setSuccessMessage('Mileage log added successfully!');

      setFormData({
        currentReading: '',
        fuelGauge: '',
        justBoughtFuel: false,
        fuelAmount: '',
        fuelPricePerLiter: '',
        fuelLiters: '',
        carRangeEstimate: '',
        carTankAverage: '',
      });
      setErrors({});

      setTimeout(() => {
        navigate(ROUTES.MILEAGE_LIST);
      }, 1500);
    } catch {
      setErrors({ submit: 'Failed to add mileage log. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Add Mileage Log</h2>
        <p className="text-gray-600 mt-1">Record your current mileage and fuel information</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">{successMessage}</p>
            </div>
          )}

          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          )}

          <div>
            <Input
              type="number"
              label="Current Mileage Reading"
              placeholder="e.g., 5000"
              value={formData.currentReading}
              onChange={(e) => setFormData({ ...formData, currentReading: e.target.value })}
              error={errors.currentReading}
              required
            />
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <FaTachometerAlt />
              <span>Enter your current odometer reading in miles</span>
            </div>
          </div>

          <div>
            <Input
              type="number"
              label="Fuel Gauge Level"
              placeholder="e.g., 5"
              min="1"
              max="11"
              step={0.1}
              value={formData.fuelGauge}
              onChange={(e) => setFormData({ ...formData, fuelGauge: e.target.value })}
              error={errors.fuelGauge}
              required
            />
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <FaGasPump />
              <span>Enter gauge level (1 = low, 11 = full tank)</span>
            </div>
          </div>

          <div className="border-t pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.justBoughtFuel}
                onChange={(e) => setFormData({ ...formData, justBoughtFuel: e.target.checked })}
                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="font-medium text-gray-900">Just bought fuel?</span>
            </label>
          </div>

          {formData.justBoughtFuel && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-4">
              <h3 className="font-semibold text-blue-900">Fuel Purchase Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Price per Liter (₦)"
                  placeholder="e.g., 750"
                  step="0.01"
                  value={formData.fuelPricePerLiter}
                  onChange={(e) => setFormData({ ...formData, fuelPricePerLiter: e.target.value })}
                  error={errors.fuelPricePerLiter}
                />

                <Input
                  type="number"
                  label="Liters Purchased"
                  placeholder="e.g., 20"
                  step="0.01"
                  value={formData.fuelLiters}
                  onChange={(e) => setFormData({ ...formData, fuelLiters: e.target.value })}
                  error={errors.fuelLiters}
                />
              </div>

              <Input
                type="number"
                label="Total Amount (₦)"
                placeholder="e.g., 15000"
                value={formData.fuelAmount}
                onChange={(e) => setFormData({ ...formData, fuelAmount: e.target.value })}
                error={errors.fuelAmount}
              />

              <div className="text-sm text-blue-700">
                {formData.fuelPricePerLiter && formData.fuelLiters && !formData.fuelAmount && (
                  <p>Calculated amount: ₦{(Number(formData.fuelPricePerLiter) * Number(formData.fuelLiters)).toFixed(2)}</p>
                )}
                <p className="mt-1">Enter price/liter + liters, or just the total amount</p>
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaCar className="text-gray-600" />
              Car Display Data (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Range Estimate (miles)"
                placeholder="e.g., 250"
                step="0.1"
                value={formData.carRangeEstimate}
                onChange={(e) => setFormData({ ...formData, carRangeEstimate: e.target.value })}
                error={errors.carRangeEstimate}
              />

              <Input
                type="number"
                label="Tank Average (MPG)"
                placeholder="e.g., 32.5"
                step="0.1"
                value={formData.carTankAverage}
                onChange={(e) => setFormData({ ...formData, carTankAverage: e.target.value })}
                error={errors.carTankAverage}
              />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Enter the values shown on your car's display (distance to empty and average MPG)
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(ROUTES.MILEAGE_LIST)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <FaPlus />
                  <span>Add Log</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Tips:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Record your mileage regularly for accurate tracking</li>
          <li>The fuel gauge ranges from 1 (nearly empty) to 11 (full tank)</li>
          <li>Only mark "Just bought fuel" when you've actually refueled</li>
          <li>Your data is saved locally and persists across sessions</li>
        </ul>
      </div>
    </div>
  );
}

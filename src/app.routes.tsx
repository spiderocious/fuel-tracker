import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@web/ui/components/Layout';
import { DashboardScreen } from '@web/features/dashboard/screen/dashboard-screen';
import { MileageListScreen } from '@web/features/mileage-list/screen/mileage-list-screen';
import { AddMileageScreen } from '@web/features/add-mileage/screen/add-mileage-screen';
import { ROUTES } from '@web/shared/constants/routes';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><DashboardScreen /></Layout>,
  },
  {
    path: ROUTES.DASHBOARD,
    element: <Layout><DashboardScreen /></Layout>,
  },
  {
    path: ROUTES.MILEAGE_LIST,
    element: <Layout><MileageListScreen /></Layout>,
  },
  {
    path: ROUTES.ADD_MILEAGE,
    element: <Layout><AddMileageScreen /></Layout>,
  },
]);

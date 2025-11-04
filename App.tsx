import React from 'react';
import { HashRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { DetailPage } from './pages/DetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { APP_ROUTES } from './constants';

const MainLayout: React.FC = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

const AuthLayout: React.FC = () => {
    return <Outlet />;
}

const App: React.FC = () => {
  return (
    <DataProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path={APP_ROUTES.HOME} element={<HomePage />} />
              <Route path={APP_ROUTES.DETAILS} element={<DetailPage />} />
              <Route path={APP_ROUTES.PROFILE} element={<ProfilePage />} />
              <Route path={APP_ROUTES.ADMIN} element={<AdminPage />} />
            </Route>
            <Route element={<AuthLayout />}>
                <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
                <Route path={APP_ROUTES.REGISTER} element={<RegisterPage />} />
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </DataProvider>
  );
}

export default App;
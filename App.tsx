
import React, { useState } from 'react';
import { useSessionStore } from './store';
import { Role } from './types';
import { AppLayout } from './components/Layout';
import { GlobalStyles } from './components/ui';
import { LoginPage } from './pages/Login';
import { PreDashboard } from './pages/PreDashboard';
import { AdminDashboard, AsmBdmDashboard } from './pages/AdminDashboard';
import { TeamSelectionPage } from './pages/TeamSelection';


const App: React.FC = () => {
  const { isAuthenticated, user, team, setTeam } = useSessionStore();
  const [activePage, setActivePage] = useState('dashboard');

  if (!isAuthenticated || !user) {
    return (
      <>
        <GlobalStyles />
        <LoginPage />
      </>
    );
  }

  if (user.role === Role.PRE && !team) {
      return (
          <>
            <GlobalStyles />
            <TeamSelectionPage onSubmit={setTeam} />
          </>
      )
  }

  const renderContent = () => {
    if (user.role === Role.ADMIN || user.role === Role.DATACR) {
        return <AdminDashboard activePage={activePage} />
    }
    if (user.role === Role.ASM || user.role === Role.BDM) {
        return <AsmBdmDashboard activePage={activePage} />
    }
    if (user.role === Role.PRE) {
        return <PreDashboard activePage={activePage} />
    }
    return <div>No dashboard available for your role.</div>
  };

  return (
    <>
      <GlobalStyles />
      <AppLayout activePage={activePage} setActivePage={setActivePage}>
        {renderContent()}
      </AppLayout>
    </>
  );
};

export default App;

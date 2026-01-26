
import React from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  const header = (
    <div className="h-8rem bg-red-100 flex align-items-center justify-content-center border-round-top">
        <i className="pi pi-ban text-6xl text-red-500"></i>
    </div>
  );

  return (
    <div className="flex align-items-center justify-content-center min-h-screen">
      <Card header={header} title="Access Denied" className="w-full md:w-30rem text-center shadow-4">
        <p className="mb-6 text-600">
            You do not have the necessary permissions to view this page. 
            Please contact your administrator if you believe this is an error.
        </p>
        <div className="flex justify-content-center gap-2">
            <Button label="Dashboard" icon="pi pi-home" onClick={() => navigate('/dashboard')} />
            <Button label="Switch Account" icon="pi pi-sign-in" severity="secondary" onClick={() => navigate('/login')} />
        </div>
      </Card>
    </div>
  );
};

export default Unauthorized;

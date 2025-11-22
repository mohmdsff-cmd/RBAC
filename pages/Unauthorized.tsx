import React from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  const header = (
    <div className="h-32 bg-red-100 flex items-center justify-center rounded-t-lg">
        <i className="pi pi-ban text-6xl text-red-500"></i>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card header={header} title="Access Denied" className="w-full max-w-md text-center shadow-xl">
        <p className="mb-6 text-slate-600">
            You do not have the necessary permissions to view this page. 
            Please contact your administrator if you believe this is an error.
        </p>
        <div className="flex justify-center gap-2">
            <Button label="Go Back" icon="pi pi-arrow-left" outlined onClick={() => navigate(-1)} />
            <Button label="Dashboard" icon="pi pi-home" onClick={() => navigate('/dashboard')} />
        </div>
      </Card>
    </div>
  );
};

export default Unauthorized;
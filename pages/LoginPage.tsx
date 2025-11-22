import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { loginUser, clearError } from '../slices/authSlice';
import { UserRole, LocationState } from '../types';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox, CheckboxChangeEvent } from 'primereact/checkbox';
import { Message } from 'primereact/message';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [roles, setRoles] = useState<UserRole[]>([UserRole.USER]);
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);

  const roleOptions = Object.values(UserRole).map(role => ({ label: role.replace('_', ' '), value: role }));

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to the page they came from or dashboard
      const from = (location.state as LocationState)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
    // Cleanup errors on unmount/change
    return () => { dispatch(clearError()); };
  }, [isAuthenticated, navigate, location, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ username, roles }));
  };

  const onRoleChange = (e: CheckboxChangeEvent) => {
    let _roles = [...roles];

    if (e.checked)
        _roles.push(e.value);
    else
        _roles = _roles.filter(role => role !== e.value);

    setRoles(_roles);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card title="Welcome Back" subTitle="Please sign in to continue" className="w-full max-w-md shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          
          {error && <Message severity="error" text={error} className="w-full" />}

          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm font-medium text-slate-700">Username</label>
            <span className="p-input-icon-left">
              <i className="pi pi-user" />
              <InputText 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Enter your username" 
                className="w-full"
                required
              />
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Select Roles</label>
            <div className="flex flex-wrap gap-3 p-3 border rounded-md bg-slate-50">
                {roleOptions.map((option) => (
                    <div key={option.value} className="flex items-center">
                        <Checkbox 
                            inputId={option.value} 
                            name="role" 
                            value={option.value} 
                            onChange={onRoleChange} 
                            checked={roles.includes(option.value)} 
                        />
                        <label htmlFor={option.value} className="ml-2 text-sm cursor-pointer select-none text-slate-700">
                            {option.label}
                        </label>
                    </div>
                ))}
            </div>
            <small className="text-slate-500">Select multiple roles to test permission combinations.</small>
          </div>

          <Button 
            label="Sign In" 
            icon="pi pi-sign-in" 
            loading={isLoading} 
            className="mt-4"
          />
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
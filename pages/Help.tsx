
import React from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';

const Help: React.FC = () => {
    return (
        <div className="w-full max-w-5xl mx-auto mt-6">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-800 m-0">Help Center</h1>
                <p className="text-500 m-0 mt-2">Find assistance and manage your account settings.</p>
            </div>
            
            <Card className="shadow-2">
                <div className="grid">
                    {/* My Profile */}
                    <div className="col-12 md:col-4">
                        <div className="surface-0 shadow-1 p-4 border-round flex flex-column align-items-center text-center h-full hover:shadow-3 transition-all transition-duration-300 cursor-pointer border-1 border-200">
                            <Avatar icon="pi pi-user" className="mb-3 bg-blue-100 text-blue-600" style={{ width: '4rem', height: '4rem', fontSize: '1.5rem' }} shape="circle" />
                            <div className="text-xl font-medium text-900 mb-2">My Profile</div>
                            <span className="text-600 line-height-3">View your personal information, roles, and account preferences.</span>
                        </div>
                    </div>

                    {/* Manuals */}
                    <div className="col-12 md:col-4">
                        <div className="surface-0 shadow-1 p-4 border-round flex flex-column align-items-center text-center h-full hover:shadow-3 transition-all transition-duration-300 cursor-pointer border-1 border-200">
                            <Avatar icon="pi pi-book" className="mb-3 bg-orange-100 text-orange-600" style={{ width: '4rem', height: '4rem', fontSize: '1.5rem' }} shape="circle" />
                            <div className="text-xl font-medium text-900 mb-2">Manuals</div>
                            <span className="text-600 line-height-3">Browse comprehensive user guides and system documentation.</span>
                        </div>
                    </div>

                    {/* FAQs */}
                    <div className="col-12 md:col-4">
                        <div className="surface-0 shadow-1 p-4 border-round flex flex-column align-items-center text-center h-full hover:shadow-3 transition-all transition-duration-300 cursor-pointer border-1 border-200">
                            <Avatar icon="pi pi-question" className="mb-3 bg-purple-100 text-purple-600" style={{ width: '4rem', height: '4rem', fontSize: '1.5rem' }} shape="circle" />
                            <div className="text-xl font-medium text-900 mb-2">FAQs</div>
                            <span className="text-600 line-height-3">Find answers to frequently asked questions and troubleshooting tips.</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Help;

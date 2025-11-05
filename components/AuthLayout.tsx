import React from 'react';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            {children}
        </div>
    );
};

export default AuthLayout;
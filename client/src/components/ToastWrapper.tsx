'use client'
import { Toaster } from 'react-hot-toast';
import React from 'react';
import './ToastWrapper.scss';

const ToastWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return <>
        {children}
        <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toasterId="default"
            toastOptions={{
                duration: 3000,
                removeDelay: 1000,
                className: 'toast-option',
            }}
        />
    </>;
};

export default ToastWrapper;

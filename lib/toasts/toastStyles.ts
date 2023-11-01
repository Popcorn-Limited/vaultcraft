import { ToastOptions, ToastPosition } from 'react-hot-toast';

export const loadingStyle: ToastOptions = {
    style: {
        border: '1px solid #A5A08C',
        padding: '16px',
        color: '#A5A08C',
        fontSize: '18px',
        backgroundColor: '#FFFFFF'
    },
    iconTheme: {
        primary: '#A5A08C',
        secondary: '#FFFFFF'
    },
    position: 'top-center' as ToastPosition
};

export const successStyle: ToastOptions = {
    style: {
        border: '1px solid #34C759',
        padding: '16px',
        color: '#34C759',
        fontSize: '18px',
        backgroundColor: '#FFFFFF'
    },
    iconTheme: {
        primary: '#34C759',
        secondary: '#FFFFFF'
    },
    position: 'top-center' as ToastPosition
};

export const errorStyle: ToastOptions = {
    style: {
        border: '1px solid #D43D44',
        padding: '16px',
        color: '#D43D44',
        fontSize: '18px',
        backgroundColor: '#FFFFFF'
    },
    iconTheme: {
        primary: '#D43D44',
        secondary: '#FFFFFF'
    },
    position: 'top-center' as ToastPosition
};
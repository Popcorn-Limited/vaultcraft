import { ToastOptions, ToastPosition } from 'react-hot-toast';

export const loadingStyle: ToastOptions = {
    style: {
        border: '1px solid #353945',
        padding: '16px',
        color: '#FFFFFF',
        fontSize: '18px',
        backgroundColor: '#23262f'
    },
    iconTheme: {
        primary: '#23262f',
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
        backgroundColor: '#23262f'
    },
    iconTheme: {
        primary: '#23262f',
        secondary: '#34C759'
    },
    position: 'top-center' as ToastPosition
};

export const errorStyle: ToastOptions = {
    style: {
        border: '1px solid #D43D44',
        padding: '16px',
        color: '#D43D44',
        fontSize: '18px',
        backgroundColor: '#23262f'
    },
    iconTheme: {
        primary: '#D43D44',
        secondary: '#FFFFFF'
    },
    position: 'top-center' as ToastPosition
};
import React from 'react';

const NotFound = () => {
    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>404 Not Found</h1>
            <p style={styles.message}>The page you are looking for does not exist.</p>
        </div>
    );
}

const styles = {
    container: {
        padding: '50px',
        textAlign: 'center',
    },
    heading: {
        fontSize: '3em',
        color: '#333',
    },
    message: {
        fontSize: '1.2em',
        color: '#666',
    },
};

export default NotFound;
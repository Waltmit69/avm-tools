function showNotification(message, type = 'info', duration = 3000) {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    let iconClass = 'bx-info-circle';
    if (type === 'success') iconClass = 'bx-check-circle';
    if (type === 'error') iconClass = 'bx-x-circle';
    notification.innerHTML = `
        <i class='bx ${iconClass}'></i>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
    `;
    container.appendChild(notification);
    notification.offsetHeight;
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    const remove = () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 400);
    };

    if (duration > 0) {
        setTimeout(remove, duration);
    }

    return { remove };
}

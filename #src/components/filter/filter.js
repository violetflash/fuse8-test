const filter = document.getElementById('filter');

const filterHandler = (e) => {
    const target = e.target;

    // if (target.value.length < 3) return;
    root.innerHTML = '';
    render(target.value);
};

filter.addEventListener('input', filterHandler);
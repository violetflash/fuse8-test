const filter = document.getElementById('filter');

const filterHandler = (e) => {
    const target = e.target;
    console.log(target.value);
    root.innerHTML = '';
    render(target.value);
};

filter.addEventListener('input', filterHandler);
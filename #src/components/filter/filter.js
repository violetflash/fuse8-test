const filter = document.getElementById('filter');
let scrollElements = document.querySelectorAll('.js-scroll');

const filterHandler = (e) => {
    const target = e.target;

    root.innerHTML = '';
    render(target.value);
    scrollElements = document.querySelectorAll('.js-scroll');

};

filter.addEventListener('input', filterHandler);

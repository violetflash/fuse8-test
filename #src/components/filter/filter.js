const filter = document.getElementById('filter');
let scrollElements;

const filterHandler = (e) => {
    const target = e.target;

    // if (target.value.length < 3) return;
    root.innerHTML = '';
    render(target.value);
    scrollElements = document.querySelectorAll('.js-scroll');

};

filter.addEventListener('input', filterHandler);
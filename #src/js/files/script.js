@@include('../../components/houses/houses.js', {})
@@include('../../components/filter/filter.js', {})

scrollElements = document.querySelectorAll('.js-scroll');
let throttleTimer = false;

const throttle = (callback, time) => {
    //don't run the function while throttle timer is true
    if (throttleTimer) return;

    //first set throttle timer to true so the function doesn't run
    throttleTimer = true;

    setTimeout(() => {
        //call the callback function in the setTimeout and set the throttle timer to false after the indicated time has passed
        callback();
        throttleTimer = false;
    }, time);
}

const elementInView = (elem, percentageScroll = 100) => {
    const elemTop = elem.getBoundingClientRect().top;

    return (
        ((elemTop <= window.innerHeight || elemTop <= document.documentElement.clientHeight) * (percentageScroll / 100))
    );
}

const setSrc = (root, target, tempAttr, newAttr) => {
    const elem = root.querySelector(target);
    elem.src = elem.getAttribute(tempAttr);
}

const displayElement = (element) => {
    element.classList.add("scrolled");
    setSrc(element, '.house-card__img', 'data-src');
};


const handleScrollAnimation = () => {
    scrollElements.forEach((elem) => {
        if (elementInView(elem, 100)) {
            displayElement(elem);
        }
    })
}


window.addEventListener('scroll', () => {
    throttle(handleScrollAnimation, 250);
})

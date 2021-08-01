const root = document.querySelector('.houses__list');

const fetchData = url => {
  return fetch(url).then(response => {
    if (!response.ok) {
      throw response;
    }

    return response.json();
  }).then(json => {
    return json;
  }).catch(err => {
    console.error(err);
  });
};

const beautifyPrice = price => {
  if (String(price).length > 3) {
    return `${price}`.replace(/\.|,/g, '').replace(/./, match => '£' + match).replace(/\d{3}$/, match => ',' + match);
  }

  return price;
};

const makeHouseCard = ({
  title,
  price,
  type,
  address
}, index) => {
  let cardCounter = 6;
  let src = '#';

  if (document.body.clientWidth < 1200) {
    cardCounter = 4;
  }

  if (document.body.clientWidth < 650) {
    cardCounter = 2;
  }

  if (index < cardCounter) {
    src = 'https://source.unsplash.com/400x300/?house';
  } // const cardCounter = document.body.clientWidth < 650 ? 2 :
  //     document.body.clientWidth < 1200 ? 4
  //         : 6


  let typeClass = 'house-card__label ';

  if (type === "SupportAvailable") {
    typeClass = 'house-card__label-orange';
  }

  let cardClass = 'houses__house house-card';

  if (index >= cardCounter) {
    cardClass = 'houses__house house-card scroll-element js-scroll fade-in-bottom';
  } // const src = '#';
  // typeClass = typeClass.toString().replace(/,/g, ' ')
  // console.log(typeClass);


  return `
        <a class='${cardClass}' href="#">
            <div class="house-card__wrapper">
                <div class="house-card__content">
                    <header class="house-card__header">
                        <figure class="house-card__figure">
                            <img id="lazy-img" class="house-card__img" data-src="https://source.unsplash.com/400x300/?house" src="${src}"
                                 alt="${title}" loading="lazy">
                            <span class=${typeClass}>${type}</span>
                        </figure>
                    </header>
                    <section class="house-card__body">
                        <h2 class="house-card__title">${title}</h2>
                        <address class="house-card__address">${address}</address>
                        <p>New Properties for Sale from <strong>${beautifyPrice(price)}</strong></p>
                    </section>
                </div>
                <footer class="house-card__footer">
                        Shared Ownership Available
                </footer>
            </div>
        </a>
    `;
};

const renderHouses = (root, data, searchTerm) => {
  let houses = data;

  if (searchTerm.length > 2) {
    houses = data.filter(elem => {
      const regex = new RegExp(searchTerm, 'i');
      return regex.test(elem.title);
    });
  }

  houses.forEach((elem, index) => {
    root.insertAdjacentHTML('beforeend', makeHouseCard(elem, index));
  });
};

const getData = async () => {
  const data = await fetchData('https://603e38c548171b0017b2ecf7.mockapi.io/homes');
  localStorage.setItem('houses', JSON.stringify(data));
  console.log(data);
  renderHouses(root, data);
};

const setCookie = (name, value, options = {}) => {
  options = {
    path: '/',
    // при необходимости добавить другие значения по умолчанию
    ...options
  };

  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];

    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }

  document.cookie = updatedCookie;
};

const getCookie = name => {
  let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
  return matches ? decodeURIComponent(matches[1]) : undefined;
};

const render = (searchTerm = '') => {
  if (!getCookie('houses')) {
    setCookie('houses', true, {
      secure: true,
      'max-age': 3600
    }); //на 1 час

    getData();
    return;
  }

  renderHouses(root, JSON.parse(localStorage.getItem('houses')), searchTerm);
};

render();
const filter = document.getElementById('filter');
let scrollElements;

const filterHandler = e => {
  const target = e.target; // if (target.value.length < 3) return;

  root.innerHTML = '';
  render(target.value);
  scrollElements = document.querySelectorAll('.js-scroll');
};

filter.addEventListener('input', filterHandler);
scrollElements = document.querySelectorAll('.js-scroll');
let throttleTimer = false;

const throttle = (callback, time) => {
  //don't run the function while throttle timer is true
  if (throttleTimer) return; //first set throttle timer to true so the function doesn't run

  throttleTimer = true;
  setTimeout(() => {
    //call the callback function in the setTimeout and set the throttle timer to false after the indicated time has passed
    callback();
    throttleTimer = false;
  }, time);
};

const elementInView = (elem, percentageScroll = 100) => {
  const elemTop = elem.getBoundingClientRect().top;
  return (elemTop <= window.innerHeight || elemTop <= document.documentElement.clientHeight) * (percentageScroll / 100);
};

const setSrc = (root, target, tempAttr, newAttr) => {
  const elem = root.querySelector(target);
  elem.src = elem.getAttribute(tempAttr);
};

const displayElement = element => {
  element.classList.add("scrolled");
  setSrc(element, '.house-card__img', 'data-src');
};

const handleScrollAnimation = () => {
  scrollElements.forEach(elem => {
    if (elementInView(elem, 100)) {
      displayElement(elem);
    }
  });
};

window.addEventListener('scroll', () => {
  throttle(handleScrollAnimation, 250);
});
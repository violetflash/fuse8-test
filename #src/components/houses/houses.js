const root = document.querySelector('.houses__list');

const fetchData = (url) => {
    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw response
            }
            return response.json();
        })
        .then((json) => {
            return json;
        })
        .catch((err) => {
            console.error(err);
        })

};

const beautifyPrice = (price) => {
    if (String(price).length > 3) {
        return `${price}`.replace(/\.|,/g, '')
            .replace(/./, match => '£' + match)
            .replace(/\d{3}$/, match => ',' + match);
    }
    return price;
}

const makeHouseCard = ({title, price, type, address}) => {
    let typeClass = 'house-card__label ';
    if (type === "SupportAvailable") {
        typeClass = 'house-card__label-orange';
    }

    // typeClass = typeClass.toString().replace(/,/g, ' ')
    // console.log(typeClass);

    return `
        <article class="houses__house house-card">
            <div class="house-card__wrapper">
                <div class="house-card__content">
                    <header class="house-card__header">
                        <figure class="house-card__figure">
                            <img class="house-card__img" src="https://source.unsplash.com/400x300/?house"
                                 alt="house footer sale">
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
        </article>
    `
};


const renderHouses = (root, data, searchTerm) => {
    let houses = data;

    if (searchTerm.length > 2) {
        houses = data.filter((elem) => {
            const regex = new RegExp(searchTerm, 'i');
            return regex.test(elem.title);
        })
    }

    houses.forEach((elem) => {
        root.insertAdjacentHTML('beforeend', makeHouseCard(elem));
    });
}

const getData = async () => {
    const data = await fetchData('https://603e38c548171b0017b2ecf7.mockapi.io/homes');
    localStorage.setItem('houses', JSON.stringify(data));
    console.log(data);
    renderHouses(root, data);
}

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


const getCookie = (name) => {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
};

const render = (searchTerm = '') => {
    if (!getCookie('houses')) {
        setCookie('houses', true, {secure: true, 'max-age': 3600}); //на 1 час
        getData();
        return;
    }

    renderHouses(root, JSON.parse(localStorage.getItem('houses')), searchTerm);
};

render();





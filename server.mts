import express from 'express';
import cors from 'cors';
import env from 'dotenv';
import axios from 'axios';
import iconv from 'iconv-lite';
import { load } from 'cheerio';
import { IMenuItem } from './types';

axios.interceptors.response.use((response) => {
    const ctype = response.headers['content-type'];
    // eslint-disable-next-line no-param-reassign
    response.data = ctype.includes('charset=windows-1250')
        ? iconv.decode(response.data, 'windows-1250')
        : iconv.decode(response.data, 'utf-8');
    return response;
});

env.config();
const app = express();
app.use(cors({ origin: '*' }));
app.set('view engine', 'ejs');

const getMenuKralovskaCesta = async () => {
    const url = 'https://menu2go.cz/';
    const krcRaw = (await axios.get(url, { responseType: 'arraybuffer' })).data;
    const $ = load(krcRaw);

    const menus: Partial<IMenuItem> = { restaurant: 'Královská cesta', url, meals: [] };

    $('.tabulka_jidla:first-of-type')
        .find('tr td:first-child')
        .each((i, e) => {
            if (i === 0) {
                menus.soup = {
                    name: $(e)
                        .text()
                        .trim()
                        .replace(/&nbsp;/g, ''),
                    price: 0,
                };
            } else {
                menus.meals!.push({
                    name: $(e)
                        .text()
                        .trim()
                        .replace(/&nbsp;/g, ''),
                    price: i === 1 ? 129 : i === 2 ? 139 : 149,
                });
            }
        });

    return menus;
};

const getMenuKlubCestovatelu = async () => {
    const today = new Date().getDay();
    const url = 'https://www.klubcestovatelubrno.cz/denni-menu/';

    const rawHTML = (await axios.get(url, { responseType: 'arraybuffer' })).data;
    const $ = load(rawHTML);

    const menus: Partial<IMenuItem> = {
        restaurant: 'Klub cestovatelů',
        url,
        meals: [],
    };

    const pricesText = $('.entry-content').find('p strong').first().text();
    const prices = pricesText.split(',- / ').map((price) => parseInt(price.substring(4, 4 + 3)));

    $('.entry-content')
        .find(`h3:nth-of-type(${today}) + *, ol:nth-of-type(${today}) li`)
        .each((i, e) => {
            if (i === 0) {
                menus.soup = {
                    name: $(e)
                        .text()
                        .trim()
                        .replace(/&nbsp;/g, ''),
                    price: 0,
                };
            } else {
                menus.meals!.push({
                    name: $(e)
                        .text()
                        .trim()
                        .replace(/&nbsp;/g, ''),
                    price: prices[i - 1],
                });
            }
        });

    return menus;
};

const getMenuMaHostina = async () => {
    const url = 'https://www.mahostina.cz/';
    const rawHTML = (await axios.get(url, { responseType: 'arraybuffer' })).data;
    const $ = load(rawHTML);

    const menus: Partial<IMenuItem> = { restaurant: 'Má Hostina', url, meals: [] };
    $('ul:first-of-type, ul:nth-of-type(2)')
        .find('li p')
        .each((i, e) => {
            const text = $(e)
                .text()
                .trim()
                .replace(/&nbsp;/g, '');
            const meal = {
                name: text.split(',-')[0].substr(0, text.split(',-')[0].length - 3) + text.split(',-')[1],
                price: parseInt(text.split(',-')[0].substr(text.split(',-')[0].length - 3)),
            };
            if (meal.price < 30) {
                menus.soup = meal;
            } else if (meal.price > 100) {
                menus.meals!.push(meal);
            }
        });
    return menus;
};

const getMenuRacek = async () => {
    const today = new Date().getDay();
    const days = ['PONDĚLÍ', 'ÚTERÝ', 'STŘEDA', 'ČTVRTEK', 'PÁTEK'];
    const url = 'https://www.restauraceracek.cz/tydenni-menu/';

    const rawHTML = (await axios.get(url, { responseType: 'arraybuffer' })).data;
    const $ = load(rawHTML);
    const menus: Partial<IMenuItem> = { restaurant: 'Racek', url, meals: [] };
    const rawData: any[] = [];
    //* Původní selector:
    // 'tr:not(:first-child) > td:not(:first-child) strong:not(:empty)'
    $('tbody')
        .find('tr:not(:first-child) > td:not(:first-child):not(:empty)')
        .each((i, e) => {
            const text = $(e)
                .text()
                .trim()
                .replace(/&nbsp;/g, '');
            rawData.push(text);
        });

    const todayIndex = rawData.findIndex((e) => e === days[today - 1]);
    for (let i = todayIndex; i < rawData.length; i++) {
        if (rawData[i] === days[today]) break;
        if (i === todayIndex + 1) menus.soup = { name: rawData[i] };
        else if (i > todayIndex + 1 && i % 2 === 0) {
            menus.meals!.push({ name: rawData[i], price: parseInt(rawData[i + 1]) });
        }
    }

    return menus;
};

const getMenuBorgeska = async () => {
    // const today = new Date().getDay();
    const menus: IMenuItem[] = [];
    const url = 'https://www.menicka.cz/4919-borgeska.html';

    const rawHTML = (await axios.get(url, { responseType: 'arraybuffer' })).data;
    const $ = load(rawHTML);

    $('.obsah')
        .find('.menicka')
        .each((i, e) => {
            const soupName = $(e).find('ul .polevka .polozka').text();
            const meals: IMenuItem['meals'] = [];
            $(e)
                .find('ul .jidlo')
                .each((ii, meal) => {
                    let mealName = $(meal).find('.polozka').text();
                    const mealPrice = $(meal).find('.cena').text();
                    if (mealName.includes('GULÁŠ')) mealName += ' (ale tentokrát fakt je, přísahám)';
                    meals.push({ name: mealName, price: parseInt(mealPrice) });
                });
            menus.push({
                restaurant: 'Borgeska',
                url,
                soup: { name: soupName },
                meals,
            });
        });

    return menus[0];
};

app.get('/ma-hostina', async (req, res) => {
    const menu = await getMenuMaHostina();
    res.json(menu);
});
app.get('/klub-cestovatelu', async (req, res) => {
    const menu = await getMenuKlubCestovatelu();
    res.json(menu);
});
app.get('/borgeska', async (req, res) => {
    const menu = await getMenuBorgeska();
    res.json(menu);
});
app.get('/kralovska-cesta', async (req, res) => {
    const menu = await getMenuKralovskaCesta();
    res.json(menu);
});
app.get('/racek', async (req, res) => {
    const menu = await getMenuRacek();
    res.json(menu);
});

app.get('/simple|/simplified|/old|/original|/legacy|/no-script', async (req, res) => {
    const results = await Promise.all(
        [
            getMenuMaHostina(),
            getMenuKlubCestovatelu(),
            getMenuBorgeska(),
            getMenuKralovskaCesta(),
            getMenuRacek(),
        ].map((p) => p.catch((e) => console.error(e))),
    );
    const menus = results.filter((result) => !(result instanceof Error));
    res.render('index', { menus });
});

app.use(express.static('dist'));

app.listen(process.env.PORT);

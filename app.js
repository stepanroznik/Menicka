import express from 'express';
import env from 'dotenv';
import axios from 'axios'
import cheerio from 'cheerio'

env.config()
const app = express()
app.set('view engine', 'ejs');


app.get('/', async (req, res) => {
    const results = await Promise.all([
        getMenuKralovskaCesta(),
        getMenuRacek(),
        getMenuKlubCestovatelu(),
        getMenuMaHostina(),
    ].map(p => p.catch(e => e)));
    const menus = results.filter(result => !(result instanceof Error));
    res.render('index', { menus })
})


const getMenuKralovskaCesta = async () => {
    const krcRaw = (await axios.get('https://menu2go.cz/')).data
    const $ = cheerio.load(krcRaw)

    const kralovskaCesta = { restaurant: 'Královská cesta', soup: {}, meals: [] };

    $('.tabulka_jidla').find('tr td:first-child').each((i, e) => {
        if (i === 0) {
            kralovskaCesta.soup = { name: $(e).text().trim().replace(/&nbsp;/g, ''), price: 0 }
        } else {
            kralovskaCesta.meals.push({
                name: $(e).text().trim().replace(/&nbsp;/g, ''),
                price: i === 3 ? 135 : 119,
            })
        }
    })

    return kralovskaCesta
}

const getMenuKlubCestovatelu = async () => {
    const today = new Date().getDay();

    const klcRaw = (await axios.get('https://www.klubcestovatelubrno.cz/denni-menu/')).data
    const $ = cheerio.load(klcRaw)

    const klubCestuvatelu = { restaurant: 'Klub cestovatelů', soup: {}, meals: [] };

    $('.entry-content').find(`h3:nth-of-type(${today}) + *, ol:nth-of-type(${today}) li`).each((i, e) => {
        if (i === 0) {
            klubCestuvatelu.soup = { name: $(e).text().trim().replace(/&nbsp;/g, ''), price: 0 }
        } else {
            klubCestuvatelu.meals.push({
                name: $(e).text().trim().replace(/&nbsp;/g, ''),
                price: i === 1 ? 119 : i === 2 ? 125 : 129,
            })
        }
    })

    return klubCestuvatelu
}

const getMenuMaHostina = async () => {
    const mhRaw = (await axios.get('https://www.mahostina.cz/')).data
    const $ = cheerio.load(mhRaw)
    const maHostina = { restaurant: 'Má Hostina', soup: {}, meals: [] };
    $('ul:first-of-type, ul:nth-of-type(2)').find('li p').each((i, e) => {
        const text = $(e).text().trim().replace(/&nbsp;/g, '')
        const meal = {
            name: text.split(',-')[0].substr(0, text.split(',-')[0].length - 3) + text.split(',-')[1],
            price: parseInt(text.split(',-')[0].substr(text.split(',-')[0].length - 3))
        }
        if (meal.price < 30) {
            maHostina.soup = meal
        } else if (meal.price > 100) {
            maHostina.meals.push(meal)
        }
    })
    return maHostina
}

const getMenuRacek = async () => {
    const today = new Date().getDay();
    const days = ['PONDĚLÍ', 'ÚTERÝ', 'STŘEDA', 'ČTVRTEK', 'PÁTEK']

    const rRaw = (await axios.get('https://www.restauraceracek.cz/tydenni-menu/')).data
    const $ = cheerio.load(rRaw)
    const racek = { restaurant: 'Racek', soup: {}, meals: [] };
    const rawData = []
    $('tbody').find('tr:not(:first-child) > td:not(:first-child) strong:not(:empty)').each((i, e) => {
        const text = $(e).text().trim().replace(/&nbsp;/g, '')
        rawData.push(text)
    })

    const todayIndex = rawData.findIndex(e => e === days[today - 1])
    for (let i = todayIndex; i < rawData.length ; i++ ) {
        if (rawData[i] === days[today]) break
        if (i === todayIndex + 1) racek.soup.name = rawData[i]
        else if (i > todayIndex + 1 && i % 2 === 0 ) racek.meals.push({ name: rawData[i], price: parseInt(rawData[i + 1]) })
    }

    return racek
}


app.listen(process.env.port)

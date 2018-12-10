const fs = require('fs');
const webdriver = require('selenium-webdriver');

function log(text) {
    console.log('------------------------------------------------');
    console.log(text);
    console.log('------------------------------------------------');
}

async function login(driver) {

    await driver.get('https://tracegenie.com/amember4/amember/login');

    await driver.findElement(webdriver.By.id('amember-login')).sendKeys('henrrypires@gmail.com');
    await driver.findElement(webdriver.By.id('amember-pass')).sendKeys('Nelson.796\n');

    await driver.wait(webdriver.until.elementLocated(webdriver.By.id('menu-member')), 2000);
}

async function getData(driver, surname, area, page) {

    let url = `https://tracegenie.com/amember4/amember/1DAY/twnsearch.php?q52=${surname}&q222=&q3222=&q322=${area}&D99=2018vr`;
    let command = `var tables = document.getElementsByTagName('table');
    var data = [];

    for (var i = 0; i < tables.length; i++) { 
        var addressArray = tables[i].rows[1].cells[0].innerText;
        var address = addressArray.split('\\n').filter(value => value != '' && !value.startsWith('Years at address')).reduce((current, newValue) => current + ' ' + newValue)

        var entry = {name: tables[i].rows[0].cells[1].innerText.replace(/\\s\\s+/g, ' ').trim(), address: address};
        data.push(entry);
    }
    
    return data;
    `;
    if(page){
        url = url + `&s=${page}`;
    }

    await driver.get(url);

    let result = await driver.executeScript(command);

    return result;
}

async function getNext(driver) {
    return await driver.executeScript("return document.evaluate('/html/body/font/font/a', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue");
}

class Requester {

    async request(surname, area){

        let page = 0;
        let driver = new webdriver
            .Builder()
            .forBrowser('chrome')
            .build();

        await login(driver);

        let json = await getData(driver, surname, area, page);

        let next = await getNext(driver);

        while(next !== null) {
            page = page + 10;
            
            const newData = await getData(driver, surname, area, page);
            json = json.concat(newData);

            next = await getNext(driver);
        }
        driver.close();

        var fields = Object.keys(json[0])
        var csv = json.map(row => {
            return fields.map(fieldName => {
                return JSON.stringify(row[fieldName]);
            }).join(',') + '\n';
        });

        csv.unshift(fields.join(',') + '\n') // add header column

        await fs.writeFile('data.csv', csv.reduce((a,b) => a = a + b));
    }
}

module.exports = Requester;
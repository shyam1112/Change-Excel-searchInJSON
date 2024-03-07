const express = require('express');
const router = express.Router();
const axios = require('axios');
const ExcelJS = require('exceljs');
const fs = require('fs').promises;

const app = express();
app.use(express.json());

const excelFilePath = 'customer_maxwell.xlsx';
const countriesFilePath = 'countries 1.json'; 

router.get('/', async (req, res) => {
    let countriesData;
    try {
        const data = await fs.readFile(countriesFilePath, 'utf8');
        countriesData = JSON.parse(data).countries;
    } catch (err) {
        console.error("Failed to read countries data:", err);
        return res.status(500).send("Failed to process request.");
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelFilePath);
    const worksheet = workbook.getWorksheet(1);

    let updatesMade = false;

    worksheet.eachRow({ includeEmpty: true }, async (row, rowNumber) => {
        const column7ValueRaw = row.getCell(7).value;
        const column7Value = typeof column7ValueRaw === 'string' ? column7ValueRaw.trim() : column7ValueRaw;
        
        const column8ValueRaw = row.getCell(8).value;
        const column8Value = typeof column8ValueRaw === 'string' ? column8ValueRaw.trim() : column8ValueRaw;
        
        if (typeof column7Value === 'string' &&
            column7Value.length >= 2 &&
            column7Value.length <= 3 &&
            column7Value === column7Value.toUpperCase()) {
            // fs.appendFile('column7.txt', `${rowNumber} , ${column7Value}\n`, function (err) {
            //     if (err) throw err;
            // });
            // console.log(column7Value);
        }else if(typeof column7Value === 'string' && column7Value.length != 0 && column7Value != 'PH-00'  &&  column7Value != 'D' && column7Value != 'Default Address Province Code' && column7Value != 'US-WI'){
            fs.appendFile('column7BadValue.txt', `${rowNumber} , ${column7Value}\n`, function (err) {
                if (err) throw err;
            });

            // const matchingCountry = countriesData.find(country => {
            //     // if (country.code.toLowerCase() === column8Value.toLowerCase() && country.provinces) {
            //     //     return true;
            //     // }
            //     return country.code.toLowerCase() === column8Value.toLowerCase() && (country.provinces.length === 0);
            // });
            
            // if (matchingCountry) {
                // console.log(column8Value +" "+ column7Value);
                // console.log(column8Value);
                row.getCell(7).value = '';
                updatesMade = true; 
                await fs.appendFile('column7BadValuePresentIntoFile.txt', `${rowNumber}, ${column7Value}, ${column8Value}\n`);
            // }
        }
    });
    if (updatesMade) {
        await workbook.xlsx.writeFile(excelFilePath); 
    }

    res.send("Hello");
})


module.exports = router;
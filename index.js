const express = require("express");
const app = express();
const participantData = require("./data/participant.js")
const winnerData = require("./data/winner")
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib")
const { readFile, writeFile } = require("fs/promises")
const cors = require("cors")
const path = require("path")
const alert = require('alert')


app.set('view engine', 'ejs')
app.use(express.json());      // for json format
app.use(express.urlencoded({
    extended: false
}));
app.use(express.static('public'))

app.use(cors());
app.use((req, res, next) => {  // To remove CROS (cross-resource-origin-platform) problem
    res.setHeader('Access-Control-Allow-Origin', "*"); // to allow all client we use *
    res.setHeader('Access-Control-Allow-Methods', "OPTIONS,GET,POST,PUT,PATCH,DELETE"); //these are the allowed methods
    res.setHeader('Access-Control-Allow-Headers', "*"); // allowed headers (Auth for extra data related to authoriaztiom)
    next();
})



async function createPdf(input, output, name, student_no) {
    try {
        const pdfDoc = await PDFDocument.load(await readFile(input));

        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
        const pages = pdfDoc.getPages()
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize()
        firstPage.drawText(`${name}`, {
            x: width / 2 - 110,
            y: height - 320,
            size: 25,
            font: helveticaFont,
            color: rgb(0, 0, 0.3)
        })
        firstPage.drawText(`${student_no}`, {
            x: 384,
            y: height - 528,
            size: 18,
            font: helveticaFont,
            color: rgb(0, 0, 0.3)
        })

        const pdfBytes = await pdfDoc.save()
        await writeFile(output, pdfBytes)
    } catch (error) {
        console.log(error)
    }

}
// for (var i = 0; i < participantData.length; i++) {
//     createPdf("./data/certiParticipant.pdf", `./certificate/${participantData[i].name}.pdf`, `${participantData[i].name.toUpperCase()}`, `${participantData[i].student_no}`)
// }

var flag = 0;
const verifyCerti = (name, student_no) => {
    for (var i = 0; i < participantData.length; i++) {
        if (name.toUpperCase() === participantData[i].name.toUpperCase() && student_no === participantData[i].student_no) {
            flag = 1;
            return;
        }
    }


    for (var i = 0; i < winnerData.length; i++) {
        if (name.toUpperCase() === winnerData[i].name.toUpperCase() && student_no === winnerData[i].student_no) {
            flag = 2;
            return;
        }
    }
}
app.get('/', (req, res) => {
    res.render("verify")
})

app.post("/download", async (req, res) => {
    try {
        // res.send(path.resolve(__dirname) + '/certificate/satyam singh.pdf');
        const data = {
            name: req.body.name,
            student_no: parseInt(req.body.student_no)
        }
        console.log(data)
        await verifyCerti(data.name, data.student_no);
        if (flag === 1) {
            flag = 0;
            await createPdf("./data/certiParticipant.pdf", `./certificate/${data.name}.pdf`, `${data.name.toUpperCase()}`, `${data.student_no}`)
            // res.download(`./certificate/${data.name}.pdf`)
            res.download(`./certificate/${data.name}.pdf`)
        }
        else if (flag === 2) {
            flag = 0;
            await createPdf("./data/winnerCerti.pdf", `./certificate/${data.name}.pdf`, `${data.name.toUpperCase()}`, `${data.student_no}`)
            // res.download(`./certificate/${data.name}.pdf`)
            res.download(`./certificate/${data.name}.pdf`)
        }
        else {
            // res.render(  [, locals] [, callback])
            alert("Authentication failed");
            res.render("verify")


        }
    } catch (error) {
        res.send(error)
    }
})




let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port, (err) => {
    if (err) {
        console.log("something is wrong");
    }
    else {
        console.log(`server is running on port ${port}`)
    }
})
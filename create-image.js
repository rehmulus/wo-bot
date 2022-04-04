const { createCanvas, loadImage, registerFont } = require('canvas')

const fs = require('fs');
const { pipeline } = require('stream/promises');

function clamp(min, number, max){
    return Math.min(Math.max(number, min), max);
}

function makeId(length) {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function generateRandomFilename(){
    return makeId(16);
}

function wrapText(context, textFunction, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';

    for(var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = context.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        textFunction(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    textFunction(line, x, y);
}

async function createImage(subject, where = 'WO'){
    const subjectUpperCase = subject.toUpperCase();
    const printSequence = `${where} ${subjectUpperCase}`.split("").join(String.fromCharCode(8202));
    
    const woImage = await loadImage('assets/wo.jpg');

    const size = {width: woImage.width*2, height : woImage.height*2};
    
    const canvas = createCanvas(size.width, size.height)
    const ctx = canvas.getContext('2d')
    
    ctx.drawImage(woImage, 0, 0, size.width, size.height);

    registerFont('./assets/impact.ttf', { family: 'Impact Condensed' })

    const fontSize = 40;
    const lineWidth = 10;
    ctx.textAlign = 'center';
    ctx.lineWidth = lineWidth;
    ctx.font = `${fontSize}pt Impact`;
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'white';
    ctx.lineJoin = 'round';
    const x = 710;
    const y = 125;
    const maxLength = 350;
    const length = ctx.measureText(printSequence).width;

    const relativeFontSizeFactor = maxLength / length * 2 * fontSize;
    const relativeFontSizeCapped = clamp(10, relativeFontSizeFactor, fontSize);
    const relativeFontSizeFloored = Math.floor(relativeFontSizeCapped)
    const relativeFontSize = relativeFontSizeFloored;

    const relativeLineWidth = lineWidth * relativeFontSize / fontSize;

    ctx.font = `${relativeFontSize}pt Impact`;
    ctx.lineWidth = relativeLineWidth;
    //ctx.strokeText(printSequence, x, y, maxLength)
    //ctx.fillText(printSequence, x, y, maxLength)
    const lineHeight = relativeFontSize * 1.5;
    const strokeFunction = (text,x,y) => { ctx.strokeText(text,x,y) }
    const fillFunction = (text,x,y) => { ctx.fillText(text,x,y) }
    wrapText(ctx, strokeFunction, printSequence, x, y, maxLength, lineHeight);
    wrapText(ctx, fillFunction, printSequence, x, y, maxLength, lineHeight);

    var dir = './tmp';
    
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    let filename = generateRandomFilename();
    const filepath = `tmp/${filename}.jpg`
    const out = fs.createWriteStream(`${__dirname}/${filepath}`)

    const stream = canvas.createJPEGStream({ quality: 0.95 })

    await pipeline(stream, out);

    return {
        attachment: filepath,
        name: 'wo.jpg'
    }
}

const deleteFile = (file) => {
    if(!file || !file.attachment){
        return;
    }
    
    fs.unlink(file.attachment, (err) => {
        if(!err){
            return;
        }
        console.error(err);
    });
}

module.exports = {
    createImage,
    deleteFile
};
const { registerFont, createCanvas, loadImage } = require("canvas");

const Jimp = require("jimp");
const fs = require("fs");

// Caching frequently used images
let cachedImages = {};
async function loadImageAsync(path) {
  if (!cachedImages[path]) {
    cachedImages[path] = await loadImage(path);
  }
  return cachedImages[path];
}

async function hsrStats(stat) {
  let specialStats = [];
  const result = [
    {
      id: stat.attributes[0].name, //PV
      icon: stat.attributes[0].icon,
      value: Number(stat.attributes[0].value)
    },
    {
      id: stat.attributes[1].name, //ATK
      icon: stat.attributes[1].icon,
      value: Number(stat.attributes[1].value)
    },
    {
      id: stat.attributes[2].name, //DEF
      icon: stat.attributes[2].icon,
      value: Number(stat.attributes[2].value)
    },
    {
      id: stat.attributes[3].name, //VIT
      icon: stat.attributes[3].icon,
      value: Number(stat.attributes[3].value)
    },
    {
      id: stat.attributes[4].name, //Crit Rate
      icon: stat.attributes[4].icon,
      value: stat.attributes[4].display
    },
    {
      id: stat.attributes[5].name, //Crit Damage
      icon: stat.attributes[5].icon,
      value: stat.attributes[5].display
    },
  ];

  for(let i = 0; i < stat.additions.length; i++)
  {
    if(stat.additions[i].name === result[0].id) //PV
    {
      result[0].value = Number(stat.attributes[0].value) + Number(stat.additions[i].value);
      result[0].value = Math.floor(result[0].value);
      continue;
    }
    if(stat.additions[i].name === result[1].id) //ATK
    {
      result[1].value = Number(stat.attributes[1].value) + Number(stat.additions[i].value);
      result[1].value = Math.floor(result[1].value);
      continue;
    }
    if(stat.additions[i].name === result[2].id) //DEF
    {
      result[2].value = Number(stat.attributes[2].value) + Number(stat.additions[i].value);
      result[2].value = Math.floor(result[2].value);
      continue;
    }
    if(stat.additions[i].name === result[3].id) //VIT
    {
      result[3].value = Number(stat.attributes[3].value) + Number(stat.additions[i].value);
      result[3].value = Math.floor(result[3].value);
      continue;
    }
    if(stat.additions[i].name === result[4].id) //Crit Rate
    {
      result[4].value = Number(stat.attributes[4].value) + Number(stat.additions[i].value);
      result[4].value = (result[4].value * 100).toFixed(1) + "%";
      continue;
    }
    if(stat.additions[i].name === result[5].id) //Crit Damage
    {
      result[5].value = Number(stat.attributes[5].value) + Number(stat.additions[i].value);
      result[5].value = (result[5].value * 100).toFixed(1) + "%";
      continue;
    }

    specialStats.push(i);
  }

  for(let i = 0; i < specialStats.length; i++)
  {
    if(stat.additions[specialStats[i]].field === 'sp_rate')
    {
      result.push({
        id: "Régen d\'énergie",
        icon: stat.additions[specialStats[i]].icon,
        value: ((1 + stat.additions[specialStats[i]].value) * 100).toFixed(1) + "%"
      });
    }
    else
    {
      result.push({
        id: stat.additions[specialStats[i]].name,
        icon: stat.additions[specialStats[i]].icon,
        value: stat.additions[specialStats[i]].display
      });
    }
  }

  return result;
}

function applyText(text, fontSize, backgroundColor, textColor, radius) {
  // Create a canvas with dimensions based on the text length
  const canvas = createCanvas(0, 0);
  const ctx = canvas.getContext("2d");

  // Set text properties
  ctx.font = `${fontSize}px 'HYWenHei 85W'`;

  // Measure the text width
  const textMetrics = ctx.measureText(text);

  // Set canvas dimensions based on text length
  const canvasWidth = textMetrics.width + 20;
  const canvasHeight = fontSize + 20;

  // Set canvas size
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Set canvas background with rounded corners effect
  const cornerRadius = radius;
  ctx.fillStyle = backgroundColor;

  ctx.beginPath();
  ctx.moveTo(cornerRadius, 0); // Top-left corner
  ctx.lineTo(canvasWidth - cornerRadius, 0);
  ctx.arcTo(canvasWidth, 0, canvasWidth, cornerRadius, cornerRadius); // Top-right corner
  ctx.lineTo(canvasWidth, canvasHeight - cornerRadius);
  ctx.arcTo(
    canvasWidth,
    canvasHeight,
    canvasWidth - cornerRadius,
    canvasHeight,
    cornerRadius
  ); // Bottom-right corner
  ctx.lineTo(cornerRadius, canvasHeight);
  ctx.arcTo(0, canvasHeight, 0, canvasHeight - cornerRadius, cornerRadius); // Bottom-left corner
  ctx.lineTo(0, cornerRadius);
  ctx.arcTo(0, 0, cornerRadius, 0, cornerRadius); // Top-left corner
  ctx.closePath();
  ctx.fill();

  // Set text properties
  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px 'HYWenHei 85W'`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Add text shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 7;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  // Write the text on the canvas
  ctx.fillText(text, canvasWidth / 2, canvasHeight / 2);

  return canvas.toBuffer();
}

async function applyTextWithIcon(
  text,
  fontSize,
  iconFile,
  iconSize,
  backgroundColor,
  textColor,
  radius
) {
  // Create a canvas with dimensions based on the text length
  const canvas = createCanvas(0, 0);
  const ctx = canvas.getContext("2d");

  // Set text properties
  ctx.font = `${fontSize}px 'HYWenHei 85W'`;

  // Measure the text width
  const textMetrics = ctx.measureText(text);

  // Set canvas dimensions based on text length
  const canvasWidth = textMetrics.width + iconSize + 50;
  const canvasHeight = Math.max(fontSize, iconSize) + 20;

  // Set canvas size
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Set canvas background with rounded corners effect
  const cornerRadius = radius;
  ctx.fillStyle = backgroundColor;

  ctx.beginPath();
  ctx.moveTo(cornerRadius, 0); // Top-left corner
  ctx.lineTo(canvasWidth - cornerRadius, 0);
  ctx.arcTo(canvasWidth, 0, canvasWidth, cornerRadius, cornerRadius); // Top-right corner
  ctx.lineTo(canvasWidth, canvasHeight - cornerRadius);
  ctx.arcTo(
    canvasWidth,
    canvasHeight,
    canvasWidth - cornerRadius,
    canvasHeight,
    cornerRadius
  ); // Bottom-right corner
  ctx.lineTo(cornerRadius, canvasHeight);
  ctx.arcTo(0, canvasHeight, 0, canvasHeight - cornerRadius, cornerRadius); // Bottom-left corner
  ctx.lineTo(0, cornerRadius);
  ctx.arcTo(0, 0, cornerRadius, 0, cornerRadius); // Top-left corner
  ctx.closePath();
  ctx.fill();

  // Set text properties
  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px 'HYWenHei 85W'`;
  ctx.textBaseline = "middle";

  // Add text shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 7;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  // Add Icon
  const icon = await loadImage(iconFile);
  const iconX = 20;
  const iconY = canvasHeight / 2 - iconSize / 2 - 5;
  ctx.drawImage(icon, iconX, iconY, iconSize, iconSize + 8);

  // Write the text on the canvas
  const textX = iconX + iconSize + 10;
  ctx.fillText(text, textX, canvasHeight / 2);

  return canvas.toBuffer();
}

async function compositeImagesWithMask(
  idchar,
  baseImagePath,
  overlayImagePath,
  maskImagePath
) {
  try {
    const baseImage = await Jimp.read(baseImagePath);
    const overlayImage = await Jimp.read(overlayImagePath);
    const maskImage = await Jimp.read(maskImagePath);

    overlayImage.contain(baseImage.getWidth(), baseImage.getHeight());

    overlayImage.mask(maskImage, 0, 0);

    baseImage.composite(overlayImage, 0, 0);

    const image = await baseImage.getBufferAsync(Jimp.AUTO);
    fs.writeFileSync(`./FolderContainer/HSRAsset/${idchar}_bg.png`, image);
  } catch (error) {
    console.error("Error:", error);
  }
}

function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength - 3) + "...";
  }
  return text;
}

function createRoundedRectangle(width, height, cornerRadius, fillColor) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.beginPath();
  ctx.moveTo(cornerRadius, 0);
  ctx.lineTo(width - cornerRadius, 0);
  ctx.quadraticCurveTo(width, 0, width, cornerRadius);
  ctx.lineTo(width, height - cornerRadius);
  ctx.quadraticCurveTo(width, height, width - cornerRadius, height);
  ctx.lineTo(cornerRadius, height);
  ctx.quadraticCurveTo(0, height, 0, height - cornerRadius);
  ctx.lineTo(0, cornerRadius);
  ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
  ctx.closePath();

  ctx.fillStyle = fillColor;

  ctx.fill();

  return canvas.toBuffer();
}

async function relicfactCard(
  artid,
  baseImagePath,
  overlayImagePath,
  maskImagePath
) {
  try {
    const baseImage = await Jimp.read(baseImagePath);
    const overlayImage = await Jimp.read(overlayImagePath);
    const maskImage = await Jimp.read(maskImagePath);

    overlayImage.resize(128, 128);

    //Base size : 712/170
    baseImage.resize(722, 150);
    maskImage.resize(722, 150);

    overlayImage.mask(maskImage, 45, 45);

    baseImage.composite(overlayImage, 10, 10);

    const image = await baseImage.getBufferAsync(Jimp.AUTO);
    fs.writeFileSync(`./FolderContainer/HSRAsset/${artid}_relic.png`, image);
  } catch (error) {
    console.error("Error:", error);
  }
}

function getSizeForNbStats(charStat)
{
  let size = 0;
  switch(charStat.length)
  {
    case 6:
      size = 90;
      break;
    case 7:
      size = 85;
      break;
    case 8:
      size = 75;
      break;
    case 9:
      size = 65;
      break;
    case 10:
      size = 58;
      break;
    case 11:
      size = 53;
      break;
    case 12:
      size = 50;
      break;
    default:
      size = 45;
  }

  return Number(size);
}

module.exports = {
  loadImageAsync,
  hsrStats,
  applyText,
  applyTextWithIcon,
  compositeImagesWithMask,
  truncateText,
  createRoundedRectangle,
  relicfactCard,
  getSizeForNbStats
};

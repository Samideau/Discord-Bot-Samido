const { registerFont, createCanvas, loadImage } = require("canvas");

const fs = require("fs");
const {
  hsrStats,
  applyText,
  applyTextWithIcon,
  compositeImagesWithMask,
  truncateText,
  createRoundedRectangle,
  relicfactCard,
  getSizeForNbStats
} = require("./HSRDetailedCardFunction.js");

async function giDetailedCreateCard(chardata, splashart) {

  //Starting URL des images
  const startUrl = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/";

  // Create a canvas
  const canvas = createCanvas(2605, 997);
  const ctx = canvas.getContext("2d");

  // Draw background image
  const idchar = chardata.id;
  const bg = `./FolderContainer/HSRAsset/background/character_bg.png`;
  const mask = `./FolderContainer/HSRAsset/background/MASK.png`;
  await compositeImagesWithMask(idchar, bg, splashart, mask);
  const bgImage = await loadImage(`./FolderContainer/HSRAsset/${idchar}_bg.png`);
  const bgshadow = await loadImage(
    `./FolderContainer/HSRAsset/background/SHADOW.png`
  );
  ctx.drawImage(bgImage, 0, 0);
  ctx.drawImage(bgshadow, 0, 540);

  // Draw weapon
  const weapon = chardata.light_cone;
  const weaponIcon = await loadImage(startUrl + weapon.icon);

  const star = await loadImage(
    `./FolderContainer/HSRAsset/stars/${weapon.rarity}_stars_light.png`
  );

  //console.log(weapon.attributes);
  const pvStat = await applyTextWithIcon(
      weapon.attributes[0].display,
      32,
      `${startUrl}${weapon.attributes[0].icon}`,
      40,
      "rgba(0, 0, 0, 0.5)",
      "white",
      10
  );
  const atkStat = await applyTextWithIcon(
      weapon.attributes[1].display,
      32,
      `${startUrl}${weapon.attributes[1].icon}`,
      40,
      "rgba(0, 0, 0, 0.5)",
      "white",
      10
  );
  const defStat = await applyTextWithIcon(
    weapon.attributes[2].display,
    32,
    `${startUrl}${weapon.attributes[2].icon}`,
    40,
    "rgba(0, 0, 0, 0.5)",
    "white",
    10
  );

  const pvWeaponImage = await loadImage(pvStat);
  const atkWeaponImage = await loadImage(atkStat);
  const defWeaponImage = await loadImage(defStat);
  const bgweapon = await loadImage(
    createRoundedRectangle(712, 261, 34, "rgba(0, 0, 0, 0.5)")
  );

  ctx.drawImage(bgweapon, 42, 42, 735, 261);
  ctx.drawImage(weaponIcon, 55, 77, 191, 191);
  ctx.drawImage(star, 55, 256, 191, 23);
  ctx.font = "36px 'HYWenHei 85W'";
  ctx.fillStyle = "white";
  ctx.fillText(truncateText(weapon.name, 25), 265, 108);
  ctx.font = "32px 'HYWenHei 85W'";
  ctx.fillStyle = "white";
  ctx.fillText(`LVL ${weapon.level}/80`, 265, 162);
  ctx.fillStyle = "#ff8900";
  ctx.fillText("S" + weapon.rank, 480, 163);
  ctx.drawImage(pvWeaponImage, 265, 188);
  ctx.drawImage(atkWeaponImage, 430, 188);
  ctx.drawImage(defWeaponImage, 595, 188);


  // Draw stats
  const bgstats = await loadImage(
    createRoundedRectangle(712, 628, 34, "rgba(0, 0, 0, 0.5)")
  );
  ctx.drawImage(bgstats, 42, 327, 735, 628);
  const charStats = await hsrStats(chardata);
  let ynya = getSizeForNbStats(charStats);

  ctx.font = "32px 'HYWenHei 85W'";
  ctx.fillStyle = "white";
  for (let i = 0; i < charStats.length; i++) {
    const icon = await loadImage(
      `${startUrl}${charStats[i].icon}`
    );
    ctx.drawImage(icon, 82, 390 + (i * ynya - 37), 40, 50);
    ctx.textAlign = "left";
    ctx.fillText(charStats[i].id, 135, 390 + i * ynya);
    ctx.textAlign = "right";
    ctx.fillText(charStats[i].value, 733, 390 + i * ynya);
  }

  // Draw traces
  const basic = await loadImage(startUrl+chardata.skills[0].icon);
  const skill = await loadImage(startUrl+chardata.skills[1].icon);
  const ultimate = await loadImage(startUrl+chardata.skills[2].icon);
  const talent = await loadImage(startUrl+chardata.skills[3].icon);

  const traceLevelBasic = await applyText(
      chardata.skills[0].level,
      32,
      "rgba(0, 0, 0, 0.5)",
      "white",
      20
  );

  const traceLevelSkill = await applyText(
      chardata.skills[1].level,
      32,
      "rgba(0, 0, 0, 0.5)",
      "white",
      20
  );

  const traceLevelUltimate = await applyText(
      chardata.skills[2].level,
      32,
      "rgba(0, 0, 0, 0.5)",
      "white",
      20
  );

  const traceLevelTalent = await applyText(
      chardata.skills[3].level,
      32,
      "rgba(0, 0, 0, 0.5)",
      "white",
      20
  );

  const basicLevelImage = await loadImage(traceLevelBasic);
  const skillLevelImage = await loadImage(traceLevelSkill);
  const ultimateLevelImage = await loadImage(traceLevelUltimate);
  const talentLevelImage = await loadImage(traceLevelTalent);

  ctx.drawImage(basic, 1060, 825, 128, 128);
  ctx.drawImage(skill, 1185, 825, 128, 128);
  ctx.drawImage(ultimate, 1310, 825, 128, 128);
  ctx.drawImage(talent, 1435, 825, 128, 128);

  let offsetXText = 45;
  ctx.drawImage(basicLevelImage, 1060 + offsetXText, 930);

  if(chardata.skills[1].level < 10)
    offsetXText = 37;
  ctx.drawImage(skillLevelImage, 1185 + offsetXText, 930);

  offsetXText = 45;
  if(chardata.skills[2].level < 10)
    offsetXText = 37;
  ctx.drawImage(ultimateLevelImage, 1310 + offsetXText, 930);

  offsetXText = 45;
  if(chardata.skills[3].level < 10)
    offsetXText = 37;
  ctx.drawImage(talentLevelImage, 1435 + offsetXText, 930);

  // Draw Name
  const rarity = await loadImage(
    `./FolderContainer/HSRAsset/stars/${chardata.rarity}_stars_frame.png`
  );
  const bglevel = await applyText(
    `Level ${chardata.level}/80`,
    32,
    "rgba(0, 0, 0, 0.5)",
    "white",
    10
  );

  const bgElementImage = await loadImage(startUrl+chardata.element.icon);
  const bgPathImage = await loadImage(startUrl+chardata.path.icon);
  const bglevelImage = await loadImage(bglevel);
  const bgname = await loadImage(
    createRoundedRectangle(461, 57, 10, "rgba(0, 0, 0, 0.5)")
  );
  ctx.drawImage(rarity, 1235, 20);
  ctx.drawImage(bgname, 1072, 50);
  ctx.font = "36px 'HYWenHei 85W'";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(chardata.name, 1302, 85);
  ctx.drawImage(bglevelImage, 1162, 110);
  ctx.drawImage(bgElementImage, 795, 30, 90, 100);
  ctx.drawImage(bgPathImage, 890, 37, 80, 90);

  // Draw constellation
  const bgEidolon = await applyText(
      `E${chardata.rank}`,
      32,
      "rgba(0, 0, 0, 0.5)",
      "#ff8900",
      10
  );
  const bgEidolonImage = await loadImage(bgEidolon);
  ctx.drawImage(bgEidolonImage, 1390, 110);

  // Draw Relics
  async function drawRelic(ctx, relicdata, position) {
    const relicon = startUrl + relicdata[position].icon;
    await relicfactCard(relicdata[position].id, relbg, relicon, maskarte);
    const relicfak = await loadImage(`./FolderContainer/HSRAsset/${relicdata[position].id}_relic.png`);
    const mainicon = await loadImage(`${startUrl}${relicdata[position].main_affix.icon}`);
    const rarity = await loadImage(`./FolderContainer/HSRAsset/stars/Star${relicdata[position].rarity}.png`);

    const y = position * 165 + 10; // Vertical position based on the index

    ctx.drawImage(relicfak, 1850, y);
    fs.unlinkSync(`./FolderContainer/HSRAsset/${relicdata[position].id}_relic.png`);
    ctx.drawImage(mainicon, 2050, y + 10, 40, 50);
    ctx.textAlign = "right";
    ctx.font = "30px 'HYWenHei 85W'";
    ctx.fillStyle = "white";
    let statvalue = relicdata[position].main_affix.display;

    ctx.fillText(statvalue, 2080, y + 100);
    ctx.drawImage(rarity, 1870, y + 110, 150, 42);
    ctx.font = "24px 'HYWenHei 85W'";
    ctx.fillStyle = "white";
    ctx.fillText("+" + relicdata[position].level, 2080, y + 140);

    if (relicdata[position].sub_affix) {
      for (let i = 0; i < relicdata[position].sub_affix.length; i++) {
        const subicon = await loadImage(`${startUrl}${relicdata[position].sub_affix[i].icon}`);
        const row = Math.floor(i / 2); // Calculate row based on current index
        const col = i % 2; // Calculate column based on current index
        const offsetX = 2115;
        const offsetY = y + 15;
        const spacingX = 170;
        const spacingY = 70;
        const iconWidth = 40;
        const iconHeight = 50;
        const posX = offsetX + col * (iconWidth + spacingX);
        const posY = offsetY + row * spacingY;

        ctx.drawImage(subicon, posX, posY + 5, iconWidth, iconHeight);
        ctx.textAlign = "left";
        ctx.font = "30px 'HYWenHei 85W'";
        ctx.fillStyle = "white";
        const statValue = relicdata[position].sub_affix[i].display;
        ctx.fillText("+" + statValue, posX + 50, posY + 40);

        if(relicdata[position].sub_affix[i].count > 1)
        {
          let pathMultipleRoll = `./FolderContainer/HSRAsset/relics/`;
          switch(relicdata[position].sub_affix[i].count)
          {
            case 2:
              pathMultipleRoll += "RollOnce.png";
              break;
            case 3:
              pathMultipleRoll += "RollTwice.png";
              break;
            case 4:
              pathMultipleRoll += "Roll3.png";
              break;
            case 5:
              pathMultipleRoll += "Roll4.png";
              break;
            case 6:
              pathMultipleRoll += "Roll5.png";
              break;
            default:
              return;
          }
          const multipleRoll = await loadImage(pathMultipleRoll);
          ctx.drawImage(multipleRoll, posX + 165, posY, iconWidth, iconHeight);
        }

      }
    }
  }

  //console.log(chardata.relics[0].sub_affix);
  const reldata = chardata.relics;
  const relbg = `./FolderContainer/HSRAsset/relics/bg-relic.png`;
  const maskarte = `./FolderContainer/HSRAsset/relics/mask.png`;

  const relicPositions = ["Head", "Hands", "Chest", "Boots", "Planar", "Rope"];
  for (let i = 0; i < relicPositions.length; i++) {
    await drawRelic(ctx, reldata, i);
  }

  //delete bgImage
  fs.unlinkSync(`./FolderContainer/HSRAsset/${idchar}_bg.png`);

  return canvas.toBuffer();
}

module.exports = giDetailedCreateCard;

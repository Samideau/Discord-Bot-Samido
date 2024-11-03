const { registerFont, createCanvas, loadImage } = require("canvas");

const fs = require("fs");
const {
  genshinStats,
  applyText,
  applyTextWithIcon,
  compositeImagesWithMask,
  truncateText,
  talentColor,
  createRoundedRectangle,
  artifactCard,
  addPercentageIfPercentStat,
} = require("./GiDetailedCardFunction.js");

async function giDetailedCreateCard(chardata, splashart) {

  // Create a canvas
  const canvas = createCanvas(2605, 997);
  const ctx = canvas.getContext("2d");

  // Draw background image
  const idchar = chardata.id;
  const bg = `https://raw.githubusercontent.com/FajarCly/encly-bg/main/${chardata.element}.png`;
  const mask = `./FolderContainer/GIAsset/background/MASK.png`;
  await compositeImagesWithMask(idchar, bg, splashart, mask);
  const bgImage = await loadImage(`./FolderContainer/GIAsset/${idchar}_bg.png`);
  const bgshadow = await loadImage(
    `./FolderContainer/GIAsset/background/SHADOW.png`
  );
  ctx.drawImage(bgImage, 0, 0);
  ctx.drawImage(bgshadow, 0, 540);

  // Draw weapon
  const weapon = chardata.weapon;
  const weaponIcon = await loadImage(weapon.icon);

  const star = await loadImage(
    `./FolderContainer/GIAsset/stars/${weapon.rarity}_stars_light.png`
  );

  const mainStats = await applyTextWithIcon(
    weapon.mainStat.statValue,
    32,
    `./FolderContainer/GIAsset/icon/ATTACK.png`,
    40,
    "rgba(0, 0, 0, 0.5)",
    "white",
    10
  );

  const mainImage = await loadImage(mainStats);
  const bgweapon = await loadImage(
    createRoundedRectangle(712, 261, 34, "rgba(0, 0, 0, 0.5)")
  );

  ctx.drawImage(bgweapon, 42, 42);
  ctx.drawImage(weaponIcon, 55, 77, 191, 191);
  ctx.drawImage(star, 55, 256, 191, 23);
  ctx.font = "36px 'HYWenHei 85W'";
  ctx.fillStyle = "white";
  ctx.fillText(truncateText(weapon.name, 25), 265, 108);
  ctx.font = "32px 'HYWenHei 85W'";
  ctx.fillStyle = "white";
  ctx.fillText(`LVL ${weapon.level}/90`, 265, 162);
  ctx.fillStyle = "#ff8900";
  ctx.fillText("R" + weapon.improvement, 480, 163);
  ctx.drawImage(mainImage, 265, 188);
  if (weapon.subStat) {
    let statvalue = 0;
    if (weapon.subStat.appendPropId === "FIGHT_PROP_ELEMENT_MASTERY") {
      statvalue = weapon.subStat.statValue;
    } else {
      statvalue = weapon.subStat.statValue + "%";
    }
    const subStats = await applyTextWithIcon(
      statvalue,
      32,
      `./FolderContainer/GIAsset/icon/${weapon.subStat.appendPropId.replace(
        "FIGHT_PROP_",
        ""
      )}.png`,
      40,
      "rgba(0, 0, 0, 0.5)",
      "white",
      10
    );
    const subImage = await loadImage(subStats);
    ctx.drawImage(subImage, 440, 188);
  }

  // Draw stats
  const bgstats = await loadImage(
    createRoundedRectangle(712, 628, 34, "rgba(0, 0, 0, 0.5)")
  );
  ctx.drawImage(bgstats, 42, 327, 712, 628);
  const charStats = await genshinStats(chardata);
  let ynya = 0;
  if (charStats.length === 9) {
    ynya = 63;
  } else if (charStats.length === 8) {
    ynya = 73;
  } else if (charStats.length === 7) {
    ynya = 83;
  }
  ctx.font = "32px 'HYWenHei 85W'";
  ctx.fillStyle = "white";
  for (let i = 0; i < charStats.length; i++) {
    const icon = await loadImage(
      `./FolderContainer/GIAsset/icon/${charStats[i].icon}`
    );
    ctx.drawImage(icon, 82, 400 + (i * ynya - 37), 40, 50);
    ctx.textAlign = "left";
    ctx.fillText(charStats[i].id, 135, 400 + i * ynya);
    ctx.textAlign = "right";
    ctx.fillText(charStats[i].value, 710, 400 + i * ynya);
  }

  // Draw talent
  const tdata = chardata;
  const talent = await loadImage(`./FolderContainer/GIAsset/bg-talent.png`);
  const talentIcons = [];
  const talentLevelImages = [];

  for (let i = 0; i < tdata.skills.length; i++) {
    const talentIcon = await loadImage(tdata.skills[i].icon);
    const talentLevel = await applyText(
      tdata.skills[i].level,
      32,
      talentColor(tdata.skills[i].isBoosted),
      "white",
      20
    );
    const talentLevelImage = await loadImage(talentLevel);
    talentIcons.push(talentIcon);
    talentLevelImages.push(talentLevelImage);
  }

  ctx.drawImage(talent, 774, 327, 142, 440);
  if(talentIcons[0] && talentLevelImages[0])
  {
    ctx.drawImage(talentIcons[0], 800, 327, 90, 90);
    ctx.drawImage(talentLevelImages[0], 825, 410);
  }
  if(talentIcons[1] && talentLevelImages[1])
  {
    ctx.drawImage(talentIcons[1], 800, 487, 90, 90);
    ctx.drawImage(talentLevelImages[1], 825, 567);
  }
  if(talentIcons[2] && talentLevelImages[2])
  {
    ctx.drawImage(talentIcons[2], 800, 647, 90, 90);
    ctx.drawImage(talentLevelImages[2], 825, 724);
  }

  // Draw Name
  const cname = chardata;
  const rarity = await loadImage(
    `./FolderContainer/GIAsset/stars/${cname.rarity}_stars_frame.png`
  );
  const bglevel = await applyText(
    `Level ${cname.level}/90`,
    32,
    "rgba(0, 0, 0, 0.5)",
    "white",
    10
  );
  const bgfriend = await applyTextWithIcon(
    cname.friendshipLevel,
    32,
    `./FolderContainer/GIAsset/icon/FRIENDS.png`,
    30,
    "rgba(0, 0, 0, 0.5)",
    "white",
    10
  );
  const bgfriendImage = await loadImage(bgfriend);
  const bglevelImage = await loadImage(bglevel);
  const bgname = await loadImage(
    createRoundedRectangle(461, 57, 10, "rgba(0, 0, 0, 0.5)")
  );
  ctx.drawImage(rarity, 1235, 815);
  ctx.drawImage(bgname, 1072, 847);
  ctx.font = "36px 'HYWenHei 85W'";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(cname.name, 1302, 887);
  ctx.drawImage(bglevelImage, 1135, 910);
  ctx.drawImage(bgfriendImage, 1365, 910);

  // Draw constellation
  const constdata = chardata;
  for (let i = 0; i < constdata.constellations.length; i++) {
    let constbg;
    let consticon;
    if (constdata.constellations[i].unlocked === true) {
      constbg = await loadImage(
        `./FolderContainer/GIAsset/const/open/OPEN_CONST_${constdata.element}.png`
      );
      consticon = await loadImage(constdata.constellations[i].icon);
    } else {
      constbg = await loadImage(
        `./FolderContainer/GIAsset/const/closed/CLOSE_CONST_${constdata.element}.png`
      );
      consticon = await loadImage(
        `./FolderContainer/GIAsset/const/closed/CLOSED.png`
      );
    }
    ctx.drawImage(constbg, 1715, 125 + i * 125, 112, 119);
    ctx.drawImage(consticon, 1736, 150 + i * 125, 70, 70);
  }

  // Draw Artifact
  async function drawArtifact(ctx, artdata, position) {
    const articon = await artdata.icon;
    await artifactCard(artdata.id, artbg, articon, maskarte);
    const artefak = await loadImage(`${artdata.id}_arte.png`);
    const mainicon = await loadImage(
      `./FolderContainer/GIAsset/icon/${artdata.mainStats.mainPropId.replace(
        "FIGHT_PROP_",
        ""
      )}.png`
    );
    const rarity = await loadImage(
      `./FolderContainer/GIAsset/stars/Star${artdata.rarity}.png`
    );

    const y = position * 186 + 42; // Vertical position based on the index

    ctx.drawImage(artefak, 1850, y);
    fs.unlinkSync(`${artdata.id}_arte.png`);
    ctx.drawImage(mainicon, 2032, y + 18, 40, 50);
    ctx.textAlign = "right";
    ctx.font = "48px 'HYWenHei 85W'";
    ctx.fillStyle = "white";
    let statvalue = 0;
    const noPercent = [
      "FIGHT_PROP_ELEMENT_MASTERY",
      "FIGHT_PROP_HP",
      "FIGHT_PROP_ATTACK",
    ];
    const isNoPercent = noPercent.includes(artdata.mainStats.mainPropId);
    if (isNoPercent) {
      statvalue = artdata.mainStats.statValue;
    } else {
      statvalue = artdata.mainStats.statValue + "%";
    }
    ctx.fillText(statvalue, 2080, y + 118);
    ctx.drawImage(rarity, 1870, y + 117, 170, 52);
    ctx.font = "24px 'HYWenHei 85W'";
    ctx.fillStyle = "white";
    ctx.fillText("+" + artdata.level, 2080, y + 153);

    if (artdata.subStats) {
      for (let i = 0; i < artdata.subStats.length; i++) {
        const subicon = await loadImage(
          `./FolderContainer/GIAsset/icon/${artdata.subStats[
            i
          ].appendPropId.replace("FIGHT_PROP_", "")}.png`
        );
        const row = Math.floor(i / 2); // Calculate row based on current index
        const col = i % 2; // Calculate column based on current index
        const offsetX = 2130;
        const offsetY = y + 26;
        const spacingX = 170;
        const spacingY = 70;
        const iconWidth = 40;
        const iconHeight = 50;
        const posX = offsetX + col * (iconWidth + spacingX);
        const posY = offsetY + row * spacingY;

        ctx.drawImage(subicon, posX, posY, iconWidth, iconHeight);
        ctx.textAlign = "left";
        ctx.font = "36px 'HYWenHei 85W'";
        ctx.fillStyle = "white";
        const statValue = artdata.subStats[i].statValue;
        const appendPropId = artdata.subStats[i].appendPropId;
        ctx.fillText(
          "+" + addPercentageIfPercentStat(statValue, appendPropId),
          posX + 50,
          posY + 40
        );
      }
    }
  }

  const artdata = chardata.reliquaries;
  const artbg = `./FolderContainer/GIAsset/arte/bg-arte.png`;
  const maskarte = `./FolderContainer/GIAsset/arte/mask.png`;

  const artPositions = ["Flower", "Feather", "Sands", "Goblet", "Circlet"];
  for (let i = 0; i < artPositions.length; i++) {
    const artType = artPositions[i];
    const artItem = artdata.find((item) => item.type === artType);
    if (artItem) {
      await drawArtifact(ctx, artItem, i);
    } else {
      const notStats = await loadImage(
        createRoundedRectangle(712, 170, 34, "rgba(0, 0, 0, 0.2)")
      );
      ctx.drawImage(notStats, 1850, i * 186 + 42);
    }
  }

  //delete bgImage
  fs.unlinkSync(`./FolderContainer/GIAsset/${idchar}_bg.png`);

  return canvas.toBuffer();
}

module.exports = giDetailedCreateCard;

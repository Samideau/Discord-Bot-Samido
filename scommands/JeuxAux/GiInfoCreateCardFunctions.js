const { registerFont, createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const Jimp = require("jimp");


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

async function compositeImagesWithMask(
    idchar,
    baseImagePath,
    overlayImagePath,
    maskImagePath,
    positionCharacter
) {
    try {
        const baseImage = await Jimp.read(baseImagePath);
        const overlayImage = await Jimp.read(overlayImagePath);
        const maskImage = await Jimp.read(maskImagePath);

        overlayImage.contain(baseImage.getWidth(), baseImage.getHeight());

        overlayImage.mask(maskImage, 0, 0);
        if(positionCharacter === "gauche")
            baseImage.composite(overlayImage, -baseImage.getWidth()/4, 0);
        else if (positionCharacter === "droite")
            baseImage.composite(overlayImage, baseImage.getWidth()/4, 0);
        else
            baseImage.composite(overlayImage, 0, 0);

        const image = await baseImage.getBufferAsync(Jimp.AUTO);
        fs.writeFileSync(`./FolderContainer/GIAsset/${idchar}_bg.png`, image);
    } catch (error) {
        console.error("Error:", error);
    }
}

function getIconSpecialStat(substatText) {
    switch(substatText)
    {
        case "CRIT DMG":
            return "CRITICAL_HURT";
        case "CRIT Rate":
            return "CRITICAL";
        case "Elemental Mastery":
            return "ELEMENT_MASTERY";
        case "Energy Recharge":
            return "CHARGE_EFFICIENCY";
        case "DEF":
            return "DEFENSE_PERCENT";
        case "ATK":
            return "ATTACK_PERCENT";
        case "HP":
            return "HP_PERCENT";
        case "Cyro DMG Bonus":
            return "CRYO";
        case "Hydro DMG Bonus":
            return "HYDRO";
        case "Anemo DMG Bonus":
            return "ANEMO";
        case "Pyro DMG Bonus":
            return "PYRO";
        case "Electro DMG Bonus":
            return "ELECTRO";
        case "Geo DMG Bonus":
            return "GEO";
        case "Dendro DMG Bonus":
            return "DENDRO";
        case "Physical DMG Bonus":
            return "PHYSICAL_ADD_HURT";
        case "Healing Bonus":
            return "HEAL";
        default:
            return "FRIENDS";
    }
}

function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength - 3) + "...";
    }
    return text;
}

async function createCanvasCharacter(characterInfoFr, characterInfoEn, characterInfoStatsLvl1, characterInfoStatsLvl90) {
    // Create a canvas
    const canvas = createCanvas(2605, 997);
    const ctx = canvas.getContext("2d");

    // Draw background image
    const idchar = characterInfoEn.id;

    let bg = "";
    if(characterInfoEn.elementText === "None")
        bg = `./FolderContainer/GIAsset/background/None.png`;
    else
        bg = `https://raw.githubusercontent.com/FajarCly/encly-bg/main/${characterInfoEn.elementText}.png`;
    const mask = `./FolderContainer/GIAsset/background/MASK.png`;

    //console.log(characterInfoEn.images);
    let splashCharacter = (characterInfoEn.images.filename_gachaSplash ? "https://enka.network/ui/" + characterInfoEn.images.filename_gachaSplash + ".png" : (characterInfoEn.name === "Aether" ? "https://enka.network/ui/UI_Gacha_AvatarImg_PlayerBoy.png" : "https://enka.network/ui/UI_Gacha_AvatarImg_PlayerGirl.png"));
    //console.log(splashCharacter);

    await compositeImagesWithMask(idchar, bg, splashCharacter, mask, "milieu");
    const bgImage = await loadImage(`./FolderContainer/GIAsset/${idchar}_bg.png`);
    const bgshadow = await loadImage(
        `./FolderContainer/GIAsset/background/SHADOW.png`
    );
    ctx.drawImage(bgImage, 0, 0);
    ctx.drawImage(bgshadow, 0, 540);

    // Draw weapon
    /*const weapon = chardata.weapon;
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

    const mainImage = await loadImage(mainStats);*/
    let nbReturnLineTitle = 0;
    let titleFormated = (characterInfoFr.title ? characterInfoFr.title : "Aucun Titre");
    //console.log(titleFormated);
    if(titleFormated !== "Aucun Titre"){
        titleFormated = characterInfoFr.title.replace(/.{35}/g, '$&-\n');
        if(titleFormated.match(new RegExp("\n", "g")))
            nbReturnLineTitle = (titleFormated.match(new RegExp("\n", "g"))).length;
    }

    let descFormated = characterInfoFr.description.replace(/.{35}/g, '$&-\n');
    let nbReturnLineDesc = (descFormated.match(new RegExp("\n", "g"))).length;
    let nbReturnLineTotal = nbReturnLineDesc + nbReturnLineTitle;
    //console.log(nbReturnLineDesc);

    const bgweapon = await loadImage(
        createRoundedRectangle(712, 200 + (nbReturnLineTotal * 40), 34, "rgba(0, 0, 0, 0.5)")
    );

    ctx.drawImage(bgweapon, 42, 42);
    //ctx.drawImage(weaponIcon, 55, 77, 191, 191);
    //ctx.drawImage(star, 55, 256, 191, 23);
    ctx.font = "36px 'HYWenHei 85W'";
    ctx.fillStyle = "white";
    ctx.fillText(characterInfoFr.name, 82, 108);
    ctx.font = "32px 'HYWenHei 85W'";
    ctx.fillStyle = "white";
    ctx.fillText(titleFormated, 82, 162);
    ctx.fillStyle = "#ff8900";
    ctx.fillText(descFormated, 82, 223 + (nbReturnLineTitle * 25));
    /*ctx.drawImage(mainImage, 265, 188);
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
    }*/

    // Draw stats
    const bgstats = await loadImage(
        createRoundedRectangle(712, 330, 34, "rgba(0, 0, 0, 0.5)")
    );
    ctx.drawImage(bgstats, 42, 650, 712, 330);
    /*const charStats = await genshinStats(chardata);
    let ynya = 0;
    if (charStats.length === 9) {
        ynya = 63;
    } else if (charStats.length === 8) {
        ynya = 73;
    } else if (charStats.length === 7) {
        ynya = 83;
    }*/
    ctx.font = "32px 'HYWenHei 85W'";
    ctx.fillStyle = "white";
    //for (let i = 0; i < charStats.length; i++) {
    const iconBaseStat = ["HP.png", "ATTACK.png", "DEFENSE.png"]
    const iconHp = await loadImage(
        `./FolderContainer/GIAsset/icon/${iconBaseStat[0]}`
    );
    ctx.drawImage(iconHp, 82,720 - 37, 40, 50);
    ctx.textAlign = "left";
    ctx.fillText(`HP`, 135, 720);
    ctx.textAlign = "right";
    ctx.fillText(`${characterInfoStatsLvl1.hp.toFixed(0)} -> ${characterInfoStatsLvl90.hp.toFixed(0)}`, 710, 720);

    const iconAtk = await loadImage(
        `./FolderContainer/GIAsset/icon/${iconBaseStat[1]}`
    );
    ctx.drawImage(iconAtk, 82, 790 - 37, 40, 50);
    ctx.textAlign = "left";
    ctx.fillText(`Attaque`, 135, 790);
    ctx.textAlign = "right";
    ctx.fillText(`${characterInfoStatsLvl1.attack.toFixed(0)} -> ${characterInfoStatsLvl90.attack.toFixed(0)}`, 710, 790);

    const iconDef = await loadImage(
        `./FolderContainer/GIAsset/icon/${iconBaseStat[2]}`
    );
    ctx.drawImage(iconDef, 82, 860 - 37, 40, 50);
    ctx.textAlign = "left";
    ctx.fillText(`Defense`, 135, 860);
    ctx.textAlign = "right";
    ctx.fillText(`${characterInfoStatsLvl1.defense.toFixed(0)} -> ${characterInfoStatsLvl90.defense.toFixed(0)}`, 710, 860);

    const iconSpecial = await loadImage(
        `./FolderContainer/GIAsset/icon/${getIconSpecialStat(characterInfoEn.substatText)}.png`
    );
    ctx.drawImage(iconSpecial, 82, 930 - 37, 40, 50);
    ctx.textAlign = "left";
    ctx.fillText(truncateText(characterInfoFr.substatText, 16), 135, 930);
    ctx.textAlign = "right";
    if(characterInfoStatsLvl90.specialized < 1)
        ctx.fillText(`${(characterInfoStatsLvl1.specialized * 100).toFixed(1)}% -> ${(characterInfoStatsLvl90.specialized * 100).toFixed(1)}%`, 710, 930);
    else
        ctx.fillText(`${characterInfoStatsLvl1.specialized.toFixed(0)} -> ${characterInfoStatsLvl90.specialized.toFixed(0)}`, 710, 930);
    //}

    // Draw talent
    /*const tdata = chardata;
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
    }*/

    // Draw Name
    /*const cname = chardata;
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
    ctx.drawImage(bgfriendImage, 1365, 910);*/

    // Draw constellation
    /*const constdata = chardata;
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
    }*/

    // Draw Artifact
    /*async function drawArtifact(ctx, artdata, position) {
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
    }*/

    const weaponType = await loadImage(
        createRoundedRectangle(712, 70, 34, "rgba(0, 0, 0, 0.2)")
    );
    ctx.drawImage(weaponType, 1850, 42);
    ctx.font = "32px 'HYWenHei 85W'";
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.fillText("Arme : " + characterInfoFr.weaponText, 1900, 87);

    const rareteType = await loadImage(
        createRoundedRectangle(712, 70, 34, "rgba(0, 0, 0, 0.2)")
    );
    ctx.drawImage(rareteType, 1850, 132);
    ctx.font = "32px 'HYWenHei 85W'";
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.fillText("Rareté : " + characterInfoFr.rarity + " étoiles", 1900, 177);

    const elementType = await loadImage(
        createRoundedRectangle(712, 70, 34, "rgba(0, 0, 0, 0.2)")
    );
    ctx.drawImage(elementType, 1850, 222);
    ctx.font = "32px 'HYWenHei 85W'";
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.fillText("Élément : " + (characterInfoFr.elementText ? characterInfoFr.elementText : "Plusieurs") , 1900, 267);

    const birthday = await loadImage(
        createRoundedRectangle(712, 70, 34, "rgba(0, 0, 0, 0.2)")
    );
    ctx.drawImage(birthday, 1850, 312);
    ctx.font = "32px 'HYWenHei 85W'";
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.fillText("Anniversaire : " + (characterInfoFr.birthday ? characterInfoFr.birthday : "Date inconnue"), 1900, 357);

    const region = await loadImage(
        createRoundedRectangle(712, 70, 34, "rgba(0, 0, 0, 0.2)")
    );
    ctx.drawImage(region, 1850, 402);
    ctx.font = "32px 'HYWenHei 85W'";
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.fillText("Région : " + (characterInfoFr.region ? characterInfoFr.region : "Inconnue"), 1900, 447);

    const constellation = await loadImage(
        createRoundedRectangle(712, 70, 34, "rgba(0, 0, 0, 0.2)")
    );
    ctx.drawImage(constellation, 1850, 492);
    ctx.font = "32px 'HYWenHei 85W'";
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.fillText("Constellation : " + (characterInfoFr.constellation ? characterInfoFr.constellation : "Inconnue"), 1900, 537);

    const affiliation = await loadImage(
        createRoundedRectangle(712, 70, 34, "rgba(0, 0, 0, 0.2)")
    );
    ctx.drawImage(affiliation, 1850, 582);
    ctx.font = "32px 'HYWenHei 85W'";
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.fillText("Affiliation : " + truncateText((characterInfoFr.affiliation ? characterInfoFr.affiliation : "Inconnue"), 21), 1900, 627);

    const versionSortie = await loadImage(
        createRoundedRectangle(712, 70, 34, "rgba(0, 0, 0, 0.2)")
    );
    ctx.drawImage(versionSortie, 1850, 672);
    ctx.font = "32px 'HYWenHei 85W'";
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.fillText("Sorti(e) en version : " + characterInfoFr.version, 1900, 717);

    //delete bgImage
    fs.unlinkSync(`./FolderContainer/GIAsset/${idchar}_bg.png`);

    return canvas.toBuffer();
}

async function createCanvasTalentCharacter(characterInfoFr, characterInfoEn, talentInfo) {
    // Create a canvas
    const canvas = createCanvas(2605, 997);
    const ctx = canvas.getContext("2d");

    // Draw background image
    const idchar = characterInfoEn.id;

    let bg = "";
    if(characterInfoEn.elementText === "None")
        bg = `./FolderContainer/GIAsset/background/None.png`;
    else
        bg = `https://raw.githubusercontent.com/FajarCly/encly-bg/main/${characterInfoEn.elementText}.png`;
    const mask = `./FolderContainer/GIAsset/background/MASK.png`;

    let splashCharacter = (characterInfoEn.images.cover1 ? characterInfoEn.images.cover1 : (characterInfoEn.name === "Aether" ? "https://enka.network/ui/UI_Gacha_AvatarImg_PlayerBoy.png" : "https://enka.network/ui/UI_Gacha_AvatarImg_PlayerGirl.png"));


    await compositeImagesWithMask(idchar, bg, splashCharacter, mask, "droite");
    const bgImage = await loadImage(`./FolderContainer/GIAsset/${idchar}_bg.png`);
    const bgshadow = await loadImage(
        `./FolderContainer/GIAsset/background/SHADOW.png`
    );
    ctx.drawImage(bgImage, 0, 0);
    ctx.drawImage(bgshadow, 0, 540);

    //Talents
    //https://enka.network/ui/Skill_A_01.png combat1
    //https://enka.network/ui/Skill_S_Keqing_01.png combat2
    //https://enka.network/ui/Skill_E_Keqing_01.png combat3


    const bgName = await applyText(
        `${characterInfoFr.name} - ${talentInfo.name}`,
        32,
        "rgba(0, 0, 0, 0.5)",
        "white",
        10
    );
    const bgNameImage = await loadImage(bgName);
    ctx.drawImage(bgNameImage, 42, 37);

    let descriptionTotal = talentInfo.description.split("\n\n");
    let nbReturnLineDesc = 0;
    if(talentInfo.description.match(new RegExp("\n", "g")))
        nbReturnLineDesc = (talentInfo.description.match(new RegExp("\n", "g"))).length;

    const combat1 = await loadImage(
        createRoundedRectangle(1450, 880, 34, "rgba(0, 0, 0, 0.2)")
    );
    ctx.drawImage(combat1, 42, 100);

    let decalage = 0;
    let descFormated = "";
    for(let i = 0; i < descriptionTotal.length; i++)
    {
        textValue = descriptionTotal[i].split(/\n(.*)/s);
        //console.log(textValue);
        if(textValue.length > 1) {
            descFormated = textValue[0].replace(/.{80}/g, '$&-\n');
            ctx.font = "28px 'HYWenHei 85W'";
            ctx.textAlign = "left";
            ctx.fillStyle = "#ff8900";
            ctx.fillText(descFormated, 82, 142 + (i * 100) + (decalage * 35));

            if(descFormated.match(new RegExp("\n", "g")))
                decalage += (descFormated.match(new RegExp("\n", "g"))).length;

            descFormated = textValue[1].replace(/.{125}/g, '$&-\n');
            ctx.font = "20px 'HYWenHei 85W'";
            ctx.textAlign = "left";
            ctx.fillStyle = "white";
            ctx.fillText(descFormated, 82, 184 + (i * 100) + (decalage * 35));

            if(descFormated.match(new RegExp("\n", "g")))
                decalage += (descFormated.match(new RegExp("\n", "g"))).length;
        }
        else{
            descFormated = textValue[0].replace(/.{80}/g, '$&-\n');
            ctx.font = "28px 'HYWenHei 85W'";
            ctx.textAlign = "left";
            ctx.fillStyle = "#ff8900";
            ctx.fillText(descFormated, 82, 142 + (i * 100) + (decalage * 35));

            if(descFormated.match(new RegExp("\n", "g")))
                decalage += (descFormated.match(new RegExp("\n", "g"))).length;
        }
    }

    //delete bgImage
    fs.unlinkSync(`./FolderContainer/GIAsset/${idchar}_bg.png`);

    return canvas.toBuffer();
}

module.exports = {
    createCanvasCharacter,
    createCanvasTalentCharacter
};
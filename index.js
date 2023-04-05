
"use strict";
const { BufferJSON, WA_DEFAULT_EPHEMERAL, proto, prepareWAMessageMedia, areJidsSameUser, getContentType } = require('@adiwajshing/baileys')
const { downloadContentFromMessage, generateWAMessage, generateWAMessageFromContent, MessageType, buttonsMessage } = require("@adiwajshing/baileys")
const { exec, spawn } = require("child_process");
const { color, bgcolor, pickRandom, randomNomor } = require('./function/console.js')

// apinya
const fs = require("fs");
const ms = require("ms");
const chalk = require('chalk');
const axios = require("axios");
const colors = require('colors/safe');
const ffmpeg = require("fluent-ffmpeg");
const moment = require("moment-timezone");

// Database
const setting = JSON.parse(fs.readFileSync('./setting.json'));
const antilink = JSON.parse(fs.readFileSync('./database/antilink.json'));
const mess = JSON.parse(fs.readFileSync('./mess.json'));
const db_error = JSON.parse(fs.readFileSync('./database/error.json'));
const db_user = JSON.parse(fs.readFileSync('./database/pengguna.json'));
const db_respon_list = JSON.parse(fs.readFileSync('./database/list.json'));

moment.tz.setDefault("Asia/Jakarta").locale("id");
module.exports = async(ramz, msg, m, setting, store) => {
try {
let { ownerNumber, botName } = setting
const { type, quotedMsg, mentioned, now, fromMe, isBaileys } = msg
if (msg.isBaileys) return
const jam = moment.tz('asia/jakarta').format('HH:mm:ss')
const tanggal = moment().tz("Asia/Jakarta").format("ll")
let dt = moment(Date.now()).tz('Asia/Jakarta').locale('id').format('a')
const ucapanWaktu = "Selamat "+dt.charAt(0).toUpperCase() + dt.slice(1)
const content = JSON.stringify(msg.message)
const from = msg.key.remoteJid
const time = moment(new Date()).format("HH:mm");
var chats = (type === 'conversation' && msg.message.conversation) ? msg.message.conversation : (type === 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : (type === 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : (type === 'extendedTextMessage') && msg.message.extendedTextMessage.text ? msg.message.extendedTextMessage.text : (type === 'buttonsResponseMessage') && quotedMsg.fromMe && msg.message.buttonsResponseMessage.selectedButtonId ? msg.message.buttonsResponseMessage.selectedButtonId : (type === 'templateButtonReplyMessage') && quotedMsg.fromMe && msg.message.templateButtonReplyMessage.selectedId ? msg.message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') ? (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId) : (type == 'listResponseMessage') && quotedMsg.fromMe && msg.message.listResponseMessage.singleSelectReply.selectedRowId ? msg.message.listResponseMessage.singleSelectReply.selectedRowId : ""
if (chats == undefined) { chats = '' }
const prefix = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/.test(chats) ? chats.match(/^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/gi) : '#'
const isGroup = msg.key.remoteJid.endsWith('@g.us')
const sender = isGroup ? (msg.key.participant ? msg.key.participant : msg.participant) : msg.key.remoteJid
const isOwner = [`${setting.ownerNumber}`,"6289637196946@s.whatsapp.net","6288296785106@s.whatsapp.net"].includes(sender) ? true : false
const pushname = msg.pushName
const body = chats.startsWith(prefix) ? chats : ''
const args = body.trim().split(/ +/).slice(1);
const q = args.join(" ");
const isCommand = body.startsWith(prefix);
const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
const isCmd = isCommand ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : null;
const botNumber = ramz.user.id.split(':')[0] + '@s.whatsapp.net'

// Group
const groupMetadata = isGroup ? await ramz.groupMetadata(from) : ''
const groupName = isGroup ? groupMetadata.subject : ''
const groupId = isGroup ? groupMetadata.id : ''
const participants = isGroup ? await groupMetadata.participants : ''
const groupMembers = isGroup ? groupMetadata.participants : ''
const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
const isGroupAdmins = groupAdmins.includes(sender)
const isAntiLink = antilink.includes(from) ? true : false

// Quoted
const quoted = msg.quoted ? msg.quoted : msg
const isImage = (type == 'imageMessage')
const isQuotedMsg = (type == 'extendedTextMessage')
const isMedia = (type === 'imageMessage' || type === 'videoMessage');
const isQuotedImage = isQuotedMsg ? content.includes('imageMessage') ? true : false : false
const isVideo = (type == 'videoMessage')
const isQuotedVideo = isQuotedMsg ? content.includes('videoMessage') ? true : false : false
const isSticker = (type == 'stickerMessage')
const isQuotedSticker = isQuotedMsg ? content.includes('stickerMessage') ? true : false : false 
const isQuotedAudio = isQuotedMsg ? content.includes('audioMessage') ? true : false : false
var dataGroup = (type === 'buttonsResponseMessage') ? msg.message.buttonsResponseMessage.selectedButtonId : ''
var dataPrivate = (type === "messageContextInfo") ? (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId) : ''
const isButton = dataGroup.length !== 0 ? dataGroup : dataPrivate
var dataListG = (type === "listResponseMessage") ? msg.message.listResponseMessage.singleSelectReply.selectedRowId : ''
var dataList = (type === 'messageContextInfo') ? (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId) : ''
const isListMessage = dataListG.length !== 0 ? dataListG : dataList

function mentions(teks, mems = [], id) {
if (id == null || id == undefined || id == false) {
let res = ramz.sendMessage(from, { text: teks, mentions: mems })
return res
} else {
let res = ramz.sendMessage(from, { text: teks, mentions: mems }, { quoted: msg })
return res
}
}

const mentionByTag = type == "extendedTextMessage" && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.mentionedJid : []
const mentionByReply = type == "extendedTextMessage" && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.participant || "" : ""
const mention = typeof(mentionByTag) == 'string' ? [mentionByTag] : mentionByTag
mention != undefined ? mention.push(mentionByReply) : []
const mentionUser = mention != undefined ? mention.filter(n => n) : []



const reply = (teks) => {ramz.sendMessage(from, { text: teks }, { quoted: msg })}

//Antilink
if (isGroup && isAntiLink && isBotGroupAdmins){
if (chats.match(/(https:\/\/chat.whatsapp.com)/gi)) {
if (!isBotGroupAdmins) return reply('Untung gw bukan admin')
if (isOwner) return reply('Untung lu owner ku:')
if (isGroupAdmins) return reply('Admin grup mah bebas ygy')
if (fromMe) return reply('Gw bebas share link')
await ramz.sendMessage(from, { delete: msg.key })
reply(`*「 GROUP LINK DETECTOR 」*\n\nTerdeteksi mengirim link group,Maaf sepertinya kamu akan di kick`)
ramz.groupParticipantsUpdate(from, [sender], "remove")
}
}

const sendContact = (jid, numbers, name, quoted, mn) => {
let number = numbers.replace(/[^0-9]/g, '')
const vcard = 'BEGIN:VCARD\n' 
+ 'VERSION:3.0\n' 
+ 'FN:' + name + '\n'
+ 'ORG:;\n'
+ 'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n'
+ 'END:VCARD'
return ramz.sendMessage(from, { contacts: { displayName: name, contacts: [{ vcard }] }, mentions : mn ? mn : []},{ quoted: quoted })
}

let cekUser = (satu, dua) => { 
let x1 = false
Object.keys(db_user).forEach((i) => {
if (db_user[i].id == dua){x1 = i}})
if (x1 !== false) {
if (satu == "id"){ return db_user[x1].id }
if (satu == "name"){ return db_user[x1].name }
if (satu == "seri"){ return db_user[x1].seri }
if (satu == "premium"){ return db_user[x1].premium }
}
if (x1 == false) { return null } 
}

let setUser = (satu, dua, tiga) => { 
Object.keys(db_user).forEach((i) => {
if (db_user[i].id == dua){
if (satu == "±id"){ db_user[i].id = tiga
fs.writeFileSync('./database/pengguna.json', JSON.stringify(db_user))} 
if (satu == "±name"){ db_user[i].name = tiga 
fs.writeFileSync('./database/pengguna.json', JSON.stringify(db_user))} 
if (satu == "±seri"){ db_user[i].seri = tiga 
fs.writeFileSync('./database/pengguna.json', JSON.stringify(db_user))} 
if (satu == "±premium"){ db_user[i].premium = tiga 
fs.writeFileSync('./database/pengguna.json', JSON.stringify(db_user))} 
}})
}





// Console
if (isGroup && isCmd) {
console.log(colors.green.bold("[Group]") + " " + colors.brightCyan(time,) + " " + colors.black.bgYellow(command) + " " + colors.green("from") + " " + colors.blue(groupName));
}

if (!isGroup && isCmd) {
console.log(colors.green.bold("[Private]") + " " + colors.brightCyan(time,) + " " + colors.black.bgYellow(command) + " " + colors.green("from") + " " + colors.blue(pushname));
}

// Casenya
switch(command) {
case 'list':
case 'listmenu':
case 'menu':{
if (isGroup) return 
const mark_slebew = '0@s.whatsapp.net'
const more = String.fromCharCode(8206)
const strip_ny = more.repeat(4001)
var footer_nya =`information from  - ${setting.ownerName}`
let tampilan_nya = `Hallo Kak..👋
🇮🇩 Yang sudah pernah dan sering pakai kuro nanya kenapa tampilan kuro seperti ini bingung bukan? Oke gua jelasin kalau kuro di rubah jadi pusat informasi dengan adanya beberapa bot baru, kalian bisa pakai KuroBotz v2 dan jika merasa kurang puas kalian bisa pakai Ailia Asisten

🇬🇧 Kuro has updates and adjustments, this is not the right bot you can use KuroBotz v2 or Ailia Assistant 

Nomor Ailia Asisten 
*wa.me/12019778056*

Alasannya karena gua malas aja banyak nomor asing masuk ke nomor personal gua jadi gua putuskan membuatnya jadi seperti ini😅

ENJOY YOUR FUCKING TIME
`
ramz.sendMessage(from,
{text: tampilan_nya,
buttonText: "KLICK DISINI",
sections: [{title: "━━━━━━━━━━━━[ 𝗗𝗔𝗦𝗕𝗢𝗔𝗥𝗗 ]━━━━━━━━━━━━",
rows: [
{title: "🎦 « YouTube", rowId: prefix+"yt", description: "YouTube Admin"},
{title: "👥 « GroupWhatsapp", rowId: prefix+"gc", description: "Group Admin"},
{title: "🌐 « Website", rowId: prefix+"web", description: "My fucking Website 🥰"},
{title: "🆙 « Pembaruan", rowId: prefix+"s", description: "Update seputar kuro bot"}]},
{title: "━━━━━━━━━━━━[ 𝗦𝗨𝗣𝗣𝗢𝗥𝗧 ]━━━━━━━━━━━━",
rows: [
{title: "💸 « Donate", rowId: prefix+"donasi", description: "Support owner to keep updating bot and information"}]},
{title: "━━━━━━━━━━━━[ 𝗕𝗜𝗢𝗗𝗔𝗧𝗔 ]━━━━━━━━━━━━",
rows: [
{title: "❄️ « 𝗜𝗻𝘁𝗿𝗼𝗱𝘂𝗰𝘁𝗶𝗼𝗻", rowId: prefix+"sewabot", description: "🅆🄷🄾 🄰🄼 🄸?"}]},
{title: "━━━━━━━━━━━━[ 𝗜𝗡𝗙𝗢 𝗧𝗘𝗥𝗦𝗘𝗗𝗜𝗔 ]━━━━━━━━━━━━",
rows: [
{title: "🏃‍♂️ « 𝗥𝘂𝗻 𝗯𝗼𝘁 𝗯𝗲𝗿𝗯𝗮𝘆𝗮𝗿", rowId: prefix+"jasapromosi", description: "lu ga perlu pusing soal bot lu biar gua aja"},
{title: "️☢️ « 𝗛𝗮𝗰𝗸𝗶𝗻𝗴 𝘁𝗼𝗼𝗹𝘀", rowId: prefix+"desinglogo", description: "Tool hack terbaru maybe work 80% "},
{title: "‍🏫🛠️« 𝗕𝗶𝗸𝗶𝗻 𝗯𝗼𝘁 𝗽𝗿𝗶𝗯𝗮𝗱𝗶", rowId: prefix+"pengajaran", description: "Miliki bot pribadi mu sendiri, slot 0/5"}]},
{title: "━━━━━━━━━━━━[ 𝗞𝗨𝗥𝗢 𝗕𝗢𝗧]━━━━━━━━━━━━",
rows: [
{title: "💌 « 𝗕𝗼𝘁 𝗖𝗼𝗻𝗳𝗲𝘀𝘀", rowId: prefix+"confess", description: "Bot khusus Confess"},
{title: "🌟 « 𝗞𝘂𝗿𝗼𝗕𝗼𝘁𝘇 𝘃2", rowId: prefix+"kuro", description: "KuroBotz Lanjutan dari sebelumnya"},
{title: "👾 « 𝗘𝗻𝗴𝗹𝗶𝘀𝗵 𝗯𝗼𝘁", rowId: prefix+"english", description: "English-only bots "}]},
],
footer: footer_nya,
mentions:[setting.ownerNumber, sender]})
}
break
case 's':
if (isGroup) return 
	ramz.sendMessage(from, {text: `
Sorry gan ga ada fitur stiker disini, pakai kuro yang lain, ketik aja .help

NEW UPDATE

•New Hack tools
•Slot Owner Bot

•Ailia is now available
•Confess bot is now available
•English bot is now available 


	*⫍ THANKS TO ⫎*
	
   •Allah Swt
   •Ortu
   •Greyfs *[Creator]*`},
{quoted: msg})
break
case 'help':
if (isGroup) return 
let rama = `*Bantuan penggunaan bot*
🇮🇩 Perintah kamu salah, ketik .menu untuk semua informasi yang tersedia

🇬🇧 Hello, your command is wrong, please type .menu

Hai👋 ini adalah pusat informasi dari KuroBotz, dan bot ini hanya berguna untuk kebutuhan *owner* guna membantu mengelola grup serta memberi informasi ke *kalian,* jika ingin membuat *sticker* dan lain lain, kamu bisa pakai *Ailia Assisten* atau pakai *KuroBotz v2* yang dimana adalah bot kedua milik grey

*Other commands:*
-${prefix}menu
-${prefix}donasi
-${prefix}bayar
-${prefix}pembayaran 
-${prefix}proses
-${prefix}done

*GROUP ONLY*
-${prefix}hidetag
-${prefix}kick 
-${prefix}antilink
-${prefix}group _(open/close)_

Thank you for using KuroBotz, I will always update so that it can be useful for many people
`
	ramz.sendMessage(from, {text: rama},
{quoted: msg})
break
case 'yt':
case 'youtube':
if (isGroup) return 
	ramz.sendMessage(from, {text: `Jangan Lupa Subscriber yah kak😉🙏\n*Link* : https://youtube.com/@novxler9753`},
{quoted: msg})
break
case 'web':
case 'website':
if (isGroup) return 
	ramz.sendMessage(from, {text: `Jangan lupa mampi kali aja bisa bikin lu pinter\n\nhttps://grey.biz.id`},
{quoted: msg})
break
case 'gc':
case 'group':
case 'grup':
case 'groupadmin':
if (isGroup) return 
	ramz.sendMessage(from, {text: `*Join My Group*\n\nGroup1 :https://chat.whatsapp.com/GMKCDy07dzX6o2T040NpAd\nGroup2 : https://chat.whatsapp.com/EmINVQX65JV5ojf7bz7Lqj`},
{quoted: msg})
break
case 'donasi': case 'donate':{
	if (isGroup) return 
let tekssss = `───「  *DONATE*  」────

*Payment donasi💰* 

- *Dana :* 089637196946
- *Gopay :*  089637196946
- *Ovo :* Maaf tidak tersedia 
- *Saweria :* https://saweria.co/Greyx
- *Paypal :* Not yet available 

berapapun donasi dari kalian itu sangat berarti bagi kami 
`
ramz.sendMessage(from, { image: fs.readFileSync(`./gambar/qris.jpg`),
 caption: tekssss, 
footer: `${setting.ownerName} © 2022`},
{quoted: msg})
}
break
case 'payment':
case 'pembayaran':
case 'bayar':{
	if (isGroup) return 
let tekssss = `───「  *PAYMENT*  」────

- *Dana :* 089637196946
- *Gopay :*  089637196946
- *Ovo :* Not yet available
- *Paypal :* Not yet available 

OK, thanks udah order di *Ramaa gnzz*
`
ramz.sendMessage(from, { image: fs.readFileSync(`./gambar/qris.jpg`),
 caption: tekssss, 
footer: `${setting.ownerName} © 2022`},
{quoted: msg})
}
break
case 'swa':
case 'sewa':
case 'sewabot':{
	if (isGroup) return 
let teq =`*ABOUT ME*

_My name is grey, I live in Tegal Jawa Tengah, Indonesia 🇮🇩_
*I'm 17 y.o in 2023* 
*I hope it can be useful for others*
 
                   *Motivation* 
                 
*Believe in yourself and cover your ears, don't listen to those around you. BE YOURSELF 🔥*

For u

Report to me if there is an error in one of the bots
`
let btn_menu = [
{buttonId: `${prefix}proses`, buttonText: { displayText: 'YESSSS' }, type: 1 },
]
ramz.sendMessage(from,
{text: teq,
buttons: btn_menu},
{quoted: msg})
}
break
case 'jasapromosi':
case 'promosi':
case 'jasapromosiviayt':{
	if (isGroup) return 
let teq =`*RUN BOT*

TINGGAL TERIMA JADI, 

Price 10K/5d

keuntungan?
•Kalian ga perlu pusing biar gua aja yang pusing
•Bot on 24 jam kecuali sc lu berat njir
•Bukan pake termux, pakai server jadi kecepatan internet beda ya..
•FAST RESPON!!!
`
let btn_menu = [
{buttonId: `${prefix}proses`, buttonText: { displayText: 'BUY🛒' }, type: 1 },
]
ramz.sendMessage(from,
{text: teq,
buttons: btn_menu},
{quoted: msg})
}
break
case 'desinglogo':
case 'logo':
case 'jasalogo':{
	if (isGroup) return 
let teq =`*RED ZONE😈*

⚠️Aku peringati kamu, tools ini bisa merugikan bahkan memiliki konsekuensi untuk penggunanya jika di salah gunakan, tolong gunakan dengan bijak!!!⚠️

THIS TOOL IS ONLY FOR EDUCATION!!
USE THIS AT YOUR OWN RISK☣️

Gunakan dengan bijak, saya tidak bertanggung jawab, konsekuensinya kau terima sendiri😈⚠️

*Hack camera*


*Hack CCTV*


*All hacking packages in onepack*



`
let btn_menu = [
{buttonId: `${prefix}proses`, buttonText: { displayText: 'HEHE BOY🔥😈' }, type: 1 },
]
ramz.sendMessage(from,
{text: teq,
buttons: btn_menu},
{quoted: msg})
}
break
case 'openmurid':
case 'jadibot':
case 'pengajaran':
case 'pengajaranbot':{
	if (isGroup) return 
let teq =`*JADI BOT GRATIS/BERBAYAR*

\`\`\`MILIKI BOT ATAS NAMA KALIAN SENDIRI)\`\`\`

---------------------------------------------------
PEMBERITAHUAN : 

JIKA KALIAN MENGINGINKAN BOT DAN GA MAU RIBET CODING KALIAN BISA CHAT SAYA DAN MINTA DI BUATKAN BOTNYA

Sistem?

Bot jadi langsung scan QR

Syarat 
- Siapin 2 hp untuk Scan QR code
- Nomor kedua 

Atau jika tidak punya dan tidak mau beli lalu daftar kartunya

kalian bisa beli nomor virtual dari saya, so.. kalian hanya bayar untuk nomor virtual pembuatan bot FULL GRATIS 


Kalian serius silahkan klik tombol di bawah, dan salin pesan yang keluar setelah kalian pencet lalu katakan kalian ingin punya bot di chat prbadi


SLOT TERBATAS !!! JIKA SLOT PENUH TIDAK GRATIS YAH

this is just to help someone who wants to have a bot
`
let btn_menu = [
{buttonId: `${prefix}proses`, buttonText: { displayText: 'AKU MW😋' }, type: 1 },
]
ramz.sendMessage(from,
{text: teq,
buttons: btn_menu},
{quoted: msg})
}
break
case 'kuro':
case 'kurov2':
case 'kurobotz':{
	if (isGroup) return 
let teq =`*KuroBotz v2*
(Free invite bots)

🇬🇧 𝗞𝘂𝗿𝗼𝗯𝗼𝘁𝘇 𝘃2 𝗶𝘀 𝗮𝗻 𝗮𝗱𝘃𝗮𝗻𝗰𝗲𝗱 𝗯𝗼𝘁 𝗮𝗻𝗱 𝗮 𝗰𝗵𝗮𝗻𝗴𝗲 𝗳𝗿𝗼𝗺 𝘁𝗵𝗲 𝗽𝗿𝗲𝘃𝗶𝗼𝘂𝘀 𝗞𝘂𝗿𝗼𝗕𝗼𝘁, 𝘆𝗼𝘂 𝗰𝗮𝗻 𝘂𝘀𝗲 𝗔𝗶𝗹𝗶𝗮 𝗔𝘀𝘀𝗶𝘀𝘁𝗮𝗻𝘁 𝗳𝗼𝗿 𝗶𝘁𝘀 𝗳𝘂𝗹𝗹 𝗳𝗲𝗮𝘁𝘂𝗿𝗲𝘀

🇮🇩 Kurobotz v2 adalah bot lanjutan dan perubahan dari KuroBot sebelumnya, Kamu dapat menggunakan Asisten Ailia untuk fitur lengkapnya

_Nomor bot:_
*wa.me/12393882191*



`
let btn_menu = [
{buttonId: `${prefix}proses`, buttonText: { displayText: 'THANKS🌟' }, type: 1 },
]
ramz.sendMessage(from,
{text: teq,
buttons: btn_menu},
{quoted: msg})
}
break
case 'ailia':
case 'confess':
case 'confes':
case 'menfess':{
	if (isGroup) return 
let teq =`*-----Ailia Confess Bot-----*

-🇮🇩 bot confess adalah bot khusus mengirim pesan tanpa target kamu mengetahui siapa kamu.

-🇬🇧 a confess bot is a special bot that sends messages without your target knowing who you are.

_Bot number:_
*wa.me/13852761307*

Hope it is useful📌

`
let btn_menu = [
{buttonId: `${prefix}proses`, buttonText: { displayText: 'Thanks🌟' }, type: 1 },
]
ramz.sendMessage(from,
{text: teq,
buttons: btn_menu},
{quoted: msg})
}
break
case 'botenglishversion':
case 'english':
case 'englisbot':{
	if (isGroup) return 
let teq =`*-Bot MD English-*

𝗖𝘂𝗿𝗿𝗲𝗻𝘁𝗹𝘆 𝘂𝗻𝗱𝗲𝗿 𝗱𝗲𝘃𝗲𝗹𝗼𝗽𝗺𝗲𝗻𝘁  






 `
let btn_menu = [
{buttonId: `${prefix}proses`, buttonText: { displayText: 'Letsgo' }, type: 1 },
]
ramz.sendMessage(from,
{text: teq,
buttons: btn_menu})
}
break

case 'proses':{
let tek = (`「 *PESAN KAMU TELAH TERKIRIM* 」\n\n\`\`\`📆 TANGGAL : ${tanggal}\n⌚ JAM     : ${jam}\n✨ STATUS  : SUCCESS DI KIRIM✅\`\`\`\n\n*--------------------------*\n\n*Berikan terus saran sama admin,* *Makssih ya, Thanks*`)
let btn_menu = [
{buttonId: `${prefix}aokeguwgw`, buttonText: { displayText: 'THANK YOU BRO👍' }, type: 1 },
]
ramz.sendMessage(from,
{text: tek,
buttons: btn_menu})
ramz.sendMessage(`${setting.ownerNumber}`, {text: `📛ADA PESAN NIH📛`})
}
break
case 'done':{
	if (!fromMe) return reply('Ngapain..?')
let tek = (`「 *PESAN BERHASIL* 」\n\n\`\`\`📆 TANGGAL : ${tanggal}\n⌚ JAM     : ${jam}\n✨ STATUS  : Berhasil\`\`\`\n\nTerimakasih Telah menggunakan bot salam*Greyfs*\nTerus pantau kuro ya🙏`)
let btn_menu = [
{buttonId: `${prefix}aokeguwgw`, buttonText: { displayText: 'OKE👍' }, type: 1 },
]
ramz.sendMessage(from,
{text: tek,
buttons: btn_menu})
}
break
case 'hidetag':
if (!isGroup) return reply(mess.OnlyGrup)
if (!fromMe) return reply('Nagapain banv?')
let mem = [];
groupMembers.map( i => mem.push(i.id) )
ramz.sendMessage(from, { text: q ? q : '', mentions: mem })
break
case 'antilink':{
if (!isGroup) return reply(mess.OnlyGrup)
if (!fromMe) return reply('Ngapain deck?')
if (!args[0]) return reply(`Kirim perintah #${command} _options_\nOptions : on & off\nContoh : #${command} on`)
if (args[0] == 'ON' || args[0] == 'on' || args[0] == 'On') {
if (isAntiLink) return reply('Antilink sudah aktif')
antilink.push(from)
fs.writeFileSync('./database/antilink.json', JSON.stringify(antilink, null, 2))
reply('Successfully Activate Antilink In This Group')
} else if (args[0] == 'OFF' || args[0] == 'OF' || args[0] == 'Of' || args[0] == 'Off' || args[0] == 'of' || args[0] == 'off') {
if (!isAntiLink) return reply('Antilink belum aktif')
let anu = antilink.indexOf(from)
antilink.splice(anu, 1)
fs.writeFileSync('./database/antilink.json', JSON.stringify(antilink, null, 2))
reply('Successfully Disabling Antilink In This Group')
} else { reply('Kata kunci tidak ditemukan!') }
}
break
case 'group':
case 'grup':
if (!isGroup) return reply(mess.OnlyGrup)
if (!fromMe) return reply('ngapain?')
if (!q) return reply(`Kirim perintah #${command} _options_\nOptions : close & open\nContoh : #${command} close`)
if (args[0] == "close") {
ramz.groupSettingUpdate(from, 'announcement')
reply(`Sukses mengizinkan hanya admin yang dapat mengirim pesan ke grup ini`)
} else if (args[0] == "open") {
ramz.groupSettingUpdate(from, 'not_announcement')
reply(`Sukses mengizinkan semua peserta dapat mengirim pesan ke grup ini`)
} else {
reply(`Kirim perintah #${command} _options_\nOptions : close & open\nContoh : #${command} close`)
}
break
case 'kick':
if (!isGroup) return reply(mess.OnlyGroup)
if (!fromMe) return reply('ngapainn?')
var number;
if (mentionUser.length !== 0) {
number = mentionUser[0]
ramz.groupParticipantsUpdate(from, [number], "remove")
.then( res => 
reply(`*Sukses mengeluarkan member..!*`))
.catch((err) => reply(mess.error.api))
} else if (isQuotedMsg) {
number = quotedMsg.sender
ramz.groupParticipantsUpdate(from, [number], "remove")
.then( res => 
reply(`*Sukses mengeluarkan member..!*`))
.catch((err) => reply(mess.error.api))
} else {
reply(`Tag atau balas pesan orang yang ingin dikeluarkan dari grup`)
}
break
default:


}} catch (err) {
console.log(color('[ERROR]', 'red'), err)
const isGroup = msg.key.remoteJid.endsWith('@g.us')
const sender = isGroup ? (msg.key.participant ? msg.key.participant : msg.participant) : msg.key.remoteJid
const moment = require("moment-timezone");
const jam = moment.tz('asia/jakarta').format('HH:mm:ss')
const tanggal = moment().tz("Asia/Jakarta").format("ll")
let kon_erorr = {"tanggal": tanggal, "jam": jam, "error": err, "user": sender}
db_error.push(kon_erorr)
fs.writeFileSync('./database/error.json', JSON.stringify(db_error))
var errny =`*SERVER ERROR*
*Dari:* @${sender.split("@")[0]}
*Jam:* ${jam}
*Tanggal:* ${tanggal}
*Tercatat:* ${db_error.length}
*Type:* ${err}`
ramz.sendMessage(setting.ownerNumber, {text:errny, mentions:[sender]})
}}
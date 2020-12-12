const discord = require('discord.js');
const bot = new discord.Client();
const {
    token,
    prefix
} = require("./jsonFiles/config.json");
const db = require('better-sqlite3');
const sql = new db('./data.sqlite');
const jobs = require('./jsonFiles/jobs.json');
const {
    SqliteError
} = require('better-sqlite3');

bot.on('ready', () => {

    console.log('bot online');
    
    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'eco';").get();
    if (!table['count(*)']) {
        sql.prepare("CREATE TABLE eco(id TEXT PRIMARY KEY,xp INT,lvl INT,cash INT,jobid TEXT,username TEXT);").run();
        sql.prepare("CREATE UNIQUE INDEX idx_eco_id ON eco (id);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");

    }
    bot.getEco = sql.prepare("SELECT * FROM eco WHERE id = ?");
    bot.setEco = sql.prepare("INSERT OR REPLACE INTO eco (id,xp,lvl,cash,jobid,username) VALUES (@id,@xp,@lvl,@cash,@jobid,@username);");
    bot.getEcos = sql.prepare("SELECT * FROM eco").all();

    const table1 = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'companies';").get();
    if (!table1['count(*)']) {
        sql.prepare("CREATE TABLE companies(id TEXT PRIMARY KEY,upgrades TEXT,totalprofit INT,companytype INT,lastchecked INT);").run();
        sql.prepare("CREATE UNIQUE INDEX idx_companies_id ON companies (id);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");

    }
    bot.getCompanies = sql.prepare("SELECT * FROM companies WHERE id = ?");
    bot.setCompanies = sql.prepare("INSERT OR REPLACE INTO companies (id,upgrades,totalprofit,companytype,lastchecked) VALUES (@id,@upgrades,@totalprofit,@companytype,@lastchecked);");

    const table2 = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'moderation';").get();
    if (!table2['count(*)']) {
        sql.prepare("CREATE TABLE moderation(id TEXT PRIMARY KEY,warns TEXT);").run();
        sql.prepare("CREATE UNIQUE INDEX idx_moderation_id ON moderation (id);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");

    }
    bot.getModeration = sql.prepare("SELECT * FROM moderation WHERE id = ?");
    bot.setModeration = sql.prepare("INSERT OR REPLACE INTO moderation (id,warns) VALUES (@id,@warns);");


    var x = ["Prefix: ';'","Submit and bug reports or suggested features on the bot's github https://github.com/ThatDutchBoio/archivebot/issues"]
    var y = () =>{
        for(var i in x){
            bot.user.setActivityx[i]
            setTimeout(() => {
                
            }, 10000);
        }
        y()
    }
})

function getEco(userId, guildId, username) {
    console.log(`username: ${username}`)
    let score = bot.getEco.get(`${userId}_${guildId}`);
    if (!score) {
        score = {
            id: `${userId}_${guildId}`,
            xp: 0,
            lvl: 0,
            cash: 0,
            jobid: "none",
            username: username
        }
        bot.setEco.run(score);
    }
    return bot.getEco.get(`${userId}_${guildId}`);
}

function getModeration(userId, guildId) {
    let score = bot.getModeration.get(`${userId}_${guildId}`);
    var warnsstring = []
    warnsstring = JSON.stringify(warnsstring);
    if (!score) {
        score = {
            id: `${userId}_${guildId}`,
            warns: warnsstring
        }
        bot.setModeration.run(score);
    }
    return bot.getModeration.get(`${userId}_${guildId}`);
}

function getCompany(userId, guildId) {
    let score = bot.getCompanies.get(`${userId}_${guildId}`);
    var x = {
        "upgrades": {
            "Product Quality": 0,
            "Production Speed": 0
        }
    }
    x = JSON.stringify(x)
    if (!score) {
        score = {
            id: `${userId}_${guildId}`,
            upgrades: x,
            totalprofit: 0,
            companytype: 0,
            lastchecked: 0
        }
        bot.setCompanies.run(score);
    }
    return bot.getCompanies.get(`${userId}_${guildId}`);
}

function addCash(userId, guildId, amnt) {
    var eco = getEco(userId, guildId);

    eco.cash += amnt;

    bot.setEco.run(eco);
    return;
}

function checklvlroles(user, eco, guild) {
    const lvlroles = require("./jsonFiles/lvlroles.json");
    for (var i in lvlroles) {
        if (eco.lvl >= lvlroles[i].levelrequired) {
            var role = guild.roles.cache.find(r => r.id === lvlroles[i].id)
            user.roles.add(role)
        }
    }

}

function addExp(eco, amnt) {
    var x = false;
    eco.xp += amnt;
    // 10 * (5 + (5*x))
    for (var i = eco.lvl; eco.xp >= (10 + ((10 * i) + (15.5 * i + 1))); i++) {
        eco.lvl++
        x = true
    }


    bot.setEco.run(eco);

    return x;
}
var oldRoles = new Map()
function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}
var lastWorked = new Map();
bot.on('message', async (msg) => {
    if (!msg.author.bot && msg.guild.id != "769655079174930462") {

        var user = msg.guild.members.cache.find(i => i.id === msg.author.id)
        console.log(user.user.username)
        var eco1 = getEco(msg.author.id, msg.guild.id, msg.author.username)
        const lvlroles = require("./jsonFiles/lvlroles.json");
        for (var i in lvlroles) {
            if (eco1.lvl >= lvlroles[i].levelrequired) {
                var role = msg.guild.roles.cache.find(r => r.id === lvlroles[i].id)

                user.roles.add(role)
            }
        }
        let args = msg.content.substring(prefix.length).split(' ');
        let cName = msg.channel.name
        var eco = getEco(msg.author.id, msg.guild.id, msg.author.username);
        var x = addExp(eco, 1);
        if (x) msg.reply(`You leveled up to lvl ${eco.lvl}!`);
        if (cName == "creations" || cName == "Creations") {
            msg.react('⭐');
        }
        console.log(args);
        if (msg.content.startsWith(prefix)) {
            let archiveChannel = bot.channels.cache.find(c => c.id === "770325208132747304");
            switch (args[0]) {
                case 'makeembed':
                    /*    // 1 = string; 2 = string ; 3 = string; 4 = bool; 5 = bool; 6 = string; 7 = object;
                        // args[ 1 = title; 2 = description; 3 = color; 4 = timestamp(bool); 5 = author(bool); 6 = url; 7 = image; 8 = thumbnail; 9-inf = Fields; 
                    if(!args[1]) return msg.reply("Please specify a title!");*/
                    const embedA = new discord.MessageEmbed()
                    msg.reply("What would you like the embed title to be?").then(async message => {
                        if (message.author == msg.author && !message.author.bot) {
                            embedA.setTitle(message.content);
                            message.reply("What would you like the Description to be?").then(async message => {

                                if (message.author == msg.author && !message.author.bot) {
                                    embedA.setDescription(message.content);
                                    message.reply("What would like the embed color to be? (Type color in all caps Ex: RED, BLUE").then(async message => {
                                        if (message.author == msg.author && !message.author.bot) {
                                            embedA.setColor(message.content);
                                            msg.channel.send(embedA);
                                        }
                                    })
                                }
                            })
                        }
                    })




                    break;
                case 'bal':
                    if (!msg.mentions.members.first()) {
                        var eco = getEco(msg.author.id, msg.guild.id, msg.author.username);
                        const balEmb = new discord.MessageEmbed()
                            .setTitle(`${msg.author.username}'s Balance`)
                            .setDescription(`$${eco.cash}`)
                            .setColor("BLUE")
                            .setAuthor(msg.author.tag, msg.author.avatarURL({
                                dynamic: false,
                                format: 'png',
                                size: 512
                            }));
                        msg.channel.send(balEmb);
                    } else {
                        var eco = getEco(msg.mentions.members.first().id, msg.guild.id, msg.mentions.members.first().user.username);
                        const balEmb = new discord.MessageEmbed()
                            .setTitle(`${msg.mentions.members.first().user.username}'s Balance`)
                            .setDescription(`$${eco.cash}`)
                            .setColor("BLUE")
                            .setAuthor(msg.mentions.members.first().user.tag, msg.mentions.members.first().user.avatarURL({
                                dynamic: false,
                                format: 'png',
                                size: 512
                            }));
                        msg.channel.send(balEmb);
                    }
                    break;
                case 'setbal':
                    if (msg.member.hasPermission("ADMINISTRATOR")) {
                        if (!msg.mentions.members.first()) {
                            var eco = getEco(msg.author.id, msg.guild.id, msg.author.username);
                            var x = msg.content.substring(args[0].length + 2);
                            x = parseInt(x);
                            eco.cash = x;
                            bot.setEco.run(eco);
                            const scEmb = new discord.MessageEmbed()
                                .setTitle(":white_check_mark: Succesfully set balance")
                                .setColor("GREEN")
                                .setAuthor(msg.author.tag, msg.author.avatarURL({
                                    dynamic: false,
                                    format: 'png',
                                    size: 512
                                }));
                            msg.channel.send(scEmb);
                        } else {
                            var eco = getEco(msg.mentions.members.first().id, msg.guild.id, msg.mentions.members.first().user.username);
                            var x = msg.content.substring(args[1].length + 8);
                            x = parseInt(x);

                            eco.cash = x;
                            bot.setEco.run(eco);
                            if (!args[1]) return msg.reply("Specify an amount!");

                            const scEmb = new discord.MessageEmbed()
                                .setTitle(":white_check_mark: Succesfully set balance")
                                .setColor("GREEN")
                                .setAuthor(msg.mentions.members.first().tag, msg.mentions.members.first().user.avatarURL({
                                    dynamic: false,
                                    format: 'png',
                                    size: 512
                                }));
                            msg.channel.send(scEmb);
                        }

                    }
                    break;
                case 'jobs':

                    const jobsemb = new discord.MessageEmbed()
                        .setTitle("Job list")
                        .setColor("BLUE")
                        .setTimestamp()
                        .setFooter("Type 'jobs.join (jobid)' to join a job")
                    for (var i in jobs) {
                        jobsemb.addField(`${jobs[i].index}. ` + jobs[i].name, `income: $${jobs[i].income[0]}-$${jobs[i].income[1]} \n ***Required Level: ${jobs[i].lvl}***`);
                    }
                    msg.channel.send(jobsemb);
                    break;
                case 'jobs.join':
                    var eco = getEco(msg.author.id, msg.guild.id, msg.author.username);
                    var x = msg.content;
                    x = x.substring(args[0].length + 2);
                    x = parseInt(x);

                    if (!x) return msg.reply("Specify a job Id!");;
                    var joinEmb = new discord.MessageEmbed()
                        .setColor("GREEN")
                        .setTimestamp()
                        .setAuthor(msg.author.tag, msg.author.avatarURL({
                            dynamic: false,
                            format: 'png',
                            size: 512
                        }))
                    for (var i in jobs) {

                        if (jobs[i].index == x) {
                            if (eco.lvl >= jobs[i].lvl) {
                                eco.jobid = jobs[i].id;

                                bot.setEco.run(eco);
                                joinEmb.setTitle(`:white_check_mark: Joined job: ${jobs[i].name}`)
                                return msg.channel.send(joinEmb);
                            } else {
                                const aB = new discord.MessageEmbed()
                                    .setTitle("You're too low level to join this job!")
                                    .setColor("RED")
                                    .setAuthor(bot.user.tag, bot.user.avatarURL({
                                        dynamic: false,
                                        format: 'png',
                                        size: 512
                                    }))
                                return msg.channel.send(aB);
                            }
                        }
                    }

                    return msg.channel.send("Invalid Job ID!");
                    break;
                case 'ban':

                    if (msg.member.hasPermission("BAN_MEMBERS") && msg.mentions.members.first() != undefined) {
                        msg.mentions.members.first().ban();
                        const bannedMember = new discord.MessageEmbed()
                            .setTitle(":white_check_mark: Banned " + msg.mentions.members.first().displayName)
                            .setAuthor(bot.user.tag, bot.user.avatarURL({
                                dynamic: false,
                                format: 'png',
                                size: 512
                            }))
                            .setTimestamp()
                            .setColor("GREEN")
                        msg.channel.send({
                            embed: bannedMember
                        })

                    } else if (msg.mentions.members.first() === undefined) {
                        const specifyMember = new discord.MessageEmbed()
                            .setTitle(":x: Specify a user to ban!")
                            .setColor("RED")
                            .setAuthor(bot.user.tag, bot.user.avatarURL({
                                dynamic: false,
                                format: 'png',
                                size: 512
                            }))
                        msg.channel.send({
                            embed: specifyMember
                        })
                    }
                    break;
                case 'warn':
                    if (msg.member.hasPermission('ADMINISTRATOR')) {
                        let score = getModeration(msg.mentions.members.first().id, msg.guild.id)
                        let towarn = msg.mentions.members.first()
                        let towarnId = msg.mentions.members.first().id
                        let warns = score.warns
                        warns = JSON.parse(warns)
                        let warnmsg = msg.content.substring(args[1].length + 8, msg.content.length);
                        if (warnmsg === "" || undefined) {
                            warnmsg = "No reason"
                        }
                        warns.push(warnmsg);
                        console.log(warns)
                        warns = JSON.stringify(warns)
                        score.warns = warns
                        bot.setModeration.run(score);
                        console.log(score.warns)

                        const warnembed = new discord.MessageEmbed()
                            .setTitle("Warned " + towarn.displayName + " for " + warnmsg)
                            .setColor("GREEN")
                            .setAuthor(bot.user.tag, bot.user.avatarURL({
                                dynamic: false,
                                format: 'png',
                                size: 512
                            }))
                            .setTimestamp()
                        msg.channel.send({
                            embed: warnembed
                        })

                    }
                    break;
                case 'kick':

                    if (msg.member.hasPermission("KICK_MEMBERS") && msg.mentions.members.first() != undefined) {
                        msg.mentions.members.first().kick();
                        const bannedMember = new discord.MessageEmbed()
                            .setTitle(":white_check_mark: kicked " + msg.mentions.members.first().displayName)
                            .setAuthor(bot.user.tag, bot.user.avatarURL({
                                dynamic: false,
                                format: 'png',
                                size: 512
                            }))
                            .setTimestamp()
                            .setColor("GREEN")
                        msg.channel.send({
                            embed: bannedMember
                        })

                    } else if (msg.mentions.members.first() === undefined) {
                        const specifyMember = new discord.MessageEmbed()
                            .setTitle(":x: Specify a user to kick!")
                            .setColor("RED")
                            .setAuthor(bot.user.tag, bot.user.avatarURL({
                                dynamic: false,
                                format: 'png',
                                size: 512
                            }))
                        msg.channel.send({
                            embed: specifyMember
                        })
                    }
                    break;
                case 'jobs.join.admin':
                    if (msg.member.hasPermission("ADMINISTRATOR")) {
                        var eco = getEco(msg.author.id, msg.guild.id, msg.author.username);
                        var x = msg.content;
                        x = x.substring(args[0].length + 2);
                        x = parseInt(x);

                        if (!x) return msg.reply("Specify a job Id!");;
                        var joinEmb = new discord.MessageEmbed()
                            .setColor("GREEN")
                            .setTimestamp()
                            .setAuthor(msg.author.tag, msg.author.avatarURL({
                                dynamic: false,
                                format: 'png',
                                size: 512
                            }))
                        for (var i in jobs) {

                            if (jobs[i].index == x) {

                                eco.jobid = jobs[i].id;

                                bot.setEco.run(eco);
                                joinEmb.setTitle(`:white_check_mark: Joined job: ${jobs[i].name}`)
                                return msg.channel.send(joinEmb);

                            }
                        }

                        return msg.channel.send("Invalid Job ID!");
                    }
                    break;
                    //var elapsed = Math.ceil((Date.now()-lastWorked.get(msg.author.id))/1000)
                case 'givecash':
                    var xEco = getEco(msg.author.id, msg.guild.id, msg.author.username);
                    var yEco = getEco(msg.mentions.members.first().id, msg.guild.id, msg.mentions.members.first().user.username);

                    break;
                case 'jobs.work':
                    var eco = getEco(msg.author.id, msg.guild.id, msg.author.username);
                    if (eco.jobid != "none") {
                        var cooldown = jobs[eco.jobid].cooldown;
                        if (lastWorked.has(msg.author.id) == false) {

                            var z = jobs[eco.jobid].income[0];
                            var y = jobs[eco.jobid].income[1];
                            const a = Math.floor(Math.random() * y) + z;
                            lastWorked.set(msg.author.id, Date.now())
                            var amntXP = (10 + (100 * (eco.lvl / 100)))
                            addExp(eco, amntXP)
                            const workedEmb = new discord.MessageEmbed()
                                .setTitle(`:white_check_mark: ${jobs[eco.jobid].message}`)
                                .setDescription(`You earned: $${a} and ${amntXP} XP`)
                                .setColor("GREEN")
                                .setTimestamp()
                            msg.channel.send(workedEmb)
                            addCash(msg.author.id, msg.guild.id, a);

                        } else {
                            var elapsed = Math.ceil((Date.now() - lastWorked.get(msg.author.id)) / 1000)

                            if (elapsed >= cooldown) {
                                lastWorked.set(msg.author.id, Date.now());
                                var z = jobs[eco.jobid].income[0];
                                var y = jobs[eco.jobid].income[1];
                                const a = randomIntFromInterval(z, y);
                                var amntXP = (10 + (100 * (eco.lvl / 100)))
                                var x = addExp(eco, amntXP)
                                if (x) msg.reply(`You leveled up to lvl ${eco.lvl}!`);
                                const workedEmb = new discord.MessageEmbed()
                                    .setTitle(`:white_check_mark: ${jobs[eco.jobid].message}`)
                                    .setDescription(`You earned: $${a} and ${amntXP} XP`)
                                    .setColor("GREEN")
                                    .setTimestamp()
                                msg.channel.send(workedEmb)
                                addCash(msg.author.id, msg.guild.id, a);

                            } else {
                                msg.reply(`You can work in ${cooldown-elapsed} Second(s)`)
                            }
                        }
                    } else {
                        const failedemb = new discord.MessageEmbed()
                            .setTitle(":x: You dont have a job!")
                            .setColor("RED")
                            .setTimestamp()
                        msg.channel.send(failedemb)
                    }

                    break;
                    case 'mute':
                if (msg.member.hasPermission("MUTE_MEMBERS")) {
                    if (msg.mentions.members.first() != undefined) {
                        let toMute = msg.mentions.members.first();
                        oldRoles.set(msg.guild.id + "_" + toMute.id, toMute.roles.cache);
                        console.log(oldRoles.get(msg.guild.id + "_" + toMute.id))
                        let rolescache = oldRoles.get(msg.guild.id + "_" + toMute.id)
                        let aooga = msg.content.substring(args[1].length + 7, msg.content.length);
                        let length = aooga.toLowerCase();
                        console.log(length)
                        let indentifier;
                        if (length.includes("h")) {
                            console.log('hours')
                            length.replace('h', '');
                            length = parseInt(length);
                            indentifier = length + " Hours";
                            length = length * 3600000;

                        } else if (length.includes("d")) {
                            console.log('days')
                            length.replace('d', '');
                            length = parseInt(length);
                            indentifier = length + " Days";
                            length = length * 86400000;

                        } else if (length.includes("m")) {
                            console.log('minutes')
                            length.replace('m', '');
                            length = parseInt(length);
                            length = length * 60000
                            indentifier = length + " Minutes";
                        } else if (length.includes("s")) {
                            console.log('seconds')
                            length.replace('s', '');
                            length = parseInt(length);
                            indentifier = length + " Seconds";
                            length = length * 1000

                        }
                        toMute.roles.set([])
                        let muterole = msg.guild.roles.create({
                            data: {
                                name: 'muted',
                                color: 'BLACK',
                                permissions: [],
                            }
                        }).then(function (role) {
                            const mutedEmb = new discord.MessageEmbed()
                                .setTitle(":white_check_mark: Muted " + toMute.displayName + " for " + indentifier)
                                .setAuthor(bot.user.tag, bot.user.avatarURL({
                                    dynamic: false,
                                    format: 'png',
                                    size: 512
                                }))
                                .setColor("GREEN")
                                .setTimestamp()
                                .setFooter("Muted by: " + msg.author.tag)
                            toMute.roles.add(role);
                            msg.channel.send({
                                embed: mutedEmb
                            })
                            logchannel.send({
                                embed: mutedEmb
                            })
                            setTimeout(() => {

                                const unmutedEmb = new discord.MessageEmbed()
                                    .setTitle(":white_check_mark: Un-Muted " + toMute.displayName + " after " + indentifier)
                                    .setAuthor(bot.user.tag, bot.user.avatarURL({
                                        dynamic: false,
                                        format: 'png',
                                        size: 512
                                    }))
                                    .setColor("GREEN")
                                    .setTimestamp()
                                    .setFooter("Muted by: " + msg.author.tag)
                                toMute.roles.add(role);
                                msg.channel.send({
                                    embed: unmutedEmb
                                })
                                logchannel.send({
                                    embed: unmutedEmb
                                })
                                toMute.roles.set(rolescache);
                                role.delete();
                            }, length);
                        })
                    } else {
                        const specUser = new discord.MessageEmbed()
                            .setTitle(":x: Specify someone to mute!")
                            .setAuthor(bot.user.tag, bot.user.avatarURL({
                                dynamic: false,
                                format: 'png',
                                size: 512
                            }))
                            .setColor("RED")
                            .setTimestamp()
                        return msg.channel.send({
                            embed: specUser
                        })
                    }
                }
                break;
                case 'warns':
                    const warnsemb = new discord.MessageEmbed()
                    if (msg.mentions.members.first() != undefined) {
                        let score = getModeration(msg.mentions.members.first.id, msg.guild.id);
                        let warns = score.warns
                        warns = JSON.parse(warns)
                        console.log(warns)
                        warnsemb.setTitle(`${msg.mentions.members.first().user.username}` + "'s warns");
                        if (warns[0] != undefined) {
                            for (i = 0; i < warns.length; i++) {
                                warnsemb.addField("Warn " + (i + 1), warns[i], false)
                            }
                        } else {
                            warnsemb.addField("This user has no warns!")
                        }
                        warnsemb.setAuthor(bot.user.tag, bot.user.avatarURL({
                            dynamic: false,
                            format: 'png',
                            size: 512
                        }))
                        warnsemb.setColor("BLUE")
                        msg.channel.send({
                            embed: warnsemb
                        })
                    } else {
                        let score = getModeration(msg.author.id, msg.guild.id)
                        let warns = score.warns
                        warns = JSON.parse(warns)
                        warnsemb.setTitle(msg.author.username + "'s warns");
                        if (warns[0] != undefined) {
                            for (i = 0; i < warns.length; i++) {
                                warnsemb.addField("Warn" + (i + 1), warns[i], false)
                            }
                        } else {
                            warnsemb.addField("This user has no warns!")
                        }
                        warnsemb.setAuthor(bot.user.tag, bot.user.avatarURL({
                            dynamic: false,
                            format: 'png',
                            size: 512
                        }))
                        warnsemb.setColor("BLUE")
                        msg.channel.send({
                            embed: warnsemb
                        })
                    }




                    break;
                case 'jobs.work.admin':

                    if (msg.member.hasPermission("ADMINISTRATOR") || msg.author.id == "188708544269254656") {
                        var eco = getEco(msg.author.id, msg.guild.id, msg.author.username);
                        var z = jobs[eco.jobid].income[0];
                        var y = jobs[eco.jobid].income[1];
                        const a = randomIntFromInterval(z, y);
                        var amntXP = (10 + (100 * (eco.lvl / 100)))
                        var x = addExp(eco, amntXP)
                        if (x) msg.reply(`You leveled up to lvl ${eco.lvl}!`);
                        const workedEmb = new discord.MessageEmbed()
                            .setTitle(`:white_check_mark: ${jobs[eco.jobid].message}`)
                            .setDescription(`You earned: $${a} and ${amntXP} XP`)
                            .setColor("GREEN")
                            .setTimestamp()
                        msg.channel.send(workedEmb)
                        addCash(msg.author.id, msg.guild.id, a);
                    }
                    break;
                case 'xpneeded':
                    var eco = getEco(msg.author.id, msg.guild.id, msg.author.username);
                    return msg.reply(`${10 + (10 + (15.5*eco.lvl+1))} needed for lvl: ${eco.lvl+1}`);
                    break;
                case 'lvl':
                    if (!msg.mentions.members.first()) {
                        var eco = getEco(msg.author.id, msg.guild.id, msg.author.username);
                        const lvlemb = new discord.MessageEmbed()
                            .setTitle(`${msg.author.username}'s level: ${eco.lvl}`)
                            .setDescription(`XP: ${eco.xp}/${(10 + ((10*eco.lvl) + (15.5 * eco.lvl + 1)))}`)
                            .setTimestamp()
                            .setColor("BLUE")
                        msg.channel.send(lvlemb);
                    } else {
                        var eco = getEco(msg.mentions.members.first().id, msg.guild.id, msg.mentions.members.first().user.username);
                        const lvlemb = new discord.MessageEmbed()
                            .setTitle(`${msg.mentions.members.first().user.username}'s level: ${eco.lvl}`)
                            .setDescription(`XP: ${eco.xp}/${10 + (10 + (15.5*eco.lvl+1))}`)
                            .setTimestamp()
                            .setColor("BLUE")
                        msg.channel.send(lvlemb);
                    }
                    break;
                case 'help':
                    var cmds = {
                        ";help": {
                            "description": "List all commands."
                        },
                        ";lvl": {
                            "description": "Posts your level in chat."
                        },
                        ";bal": {
                            "description": "Posts your balance in chat."
                        },
                        ";jobs": {
                            "description": "Posts a list of all jobs with their id in chat."
                        },
                        ";jobs.join": {
                            "description": "Lets you join a job. Usage: ***;jobs.join (jobid Eg: 1,2,3,etc)***."
                        },
                        ";jobs.work": {
                            "description": "Lets you work with your chosen job."
                        },
                        ";archive": {
                            "description": "Displays all the user's archived creations. Usage: ***;archive @User***"
                        },
                        ";leaderboard": {
                            "description": "Displays the top 10 highest levels."
                        },
                        ";foundcompany": {
                            "description": "Lets you found a company, usage: ***;foundcompany (companyid) to found a company, ;foundcompany to display the types of company***"
                        },
                        ";company.info": {
                            "description": "Displays info about  your company."
                        },
                        ";company.sellproducts": {
                            "description": "Sells all products your company has in stock"
                        }
                    }

                    var helpemb = new discord.MessageEmbed()
                        .setTitle("List of commands.")
                        .setColor("BLUE")
                        .setTimestamp()
                        .setAuthor(msg.author.tag, msg.author.avatarURL({
                            dynamic: false,
                            format: 'png',
                            size: 512
                        }));
                    for (var i in cmds) {

                        helpemb.addField(i, cmds[i].description);
                    }
                    msg.channel.send(helpemb);
                    break;
                case 'leaderboard':

                    var x = sql.prepare("SELECT * FROM eco ORDER BY lvl DESC").all();
                    var leadEmb = new discord.MessageEmbed()
                        .setTitle("Top 10 highest levels")
                        .setColor("BLUE")
                    for (var i in x) {
                        if (i < 10) {

                            var index = parseInt(i)
                            leadEmb.addField(`${index+1}.${x[i].username}`, `Level: ${x[i].lvl}`);
                        } else {
                            break;
                        }
                    }
                    msg.channel.send(leadEmb);


                    break;
                case 'archive':
                    if (!msg.mentions.members.first()) {
                        var x = bot.channels.cache.get('770325208132747304').messages.fetch(id => id == msg.author.id).then(messages => {
                            var bool = false
                            messages.forEach(element => {
                                if (element.author.id == bot.user.id) {
                                    element.embeds.forEach(embeds => {
                                        if (!embeds.footer) return;
                                        if (embeds.footer.text && embeds.footer.text == msg.author.id) {

                                            var creationEmb = new discord.MessageEmbed()
                                                .setTitle(`${embeds.title}`)
                                                .setColor("BLUE")
                                                .setTimestamp(embeds.timestamp)
                                            if (embeds.image.url) {
                                                creationEmb.setImage(embeds.image.url);
                                            }
                                            msg.channel.send(creationEmb);
                                            bool = true
                                        }
                                    })


                                }
                            });
                            if (!bool) return msg.reply("This user has no archived creations!")

                        })
                    } else {
                        var x = bot.channels.cache.get('770325208132747304').messages.fetch(id => id == msg.mentions.members.first().id).then(messages => {
                            var bool = false;

                            messages.forEach(element => {
                                if (element.author.id == bot.user.id) {

                                    element.embeds.forEach(embeds => {
                                        if (!embeds.footer) return;
                                        if (embeds.footer.text && embeds.footer.text == msg.mentions.members.first().id) {

                                            var creationEmb = new discord.MessageEmbed()
                                                .setTitle(`${embeds.title}`)
                                                .setColor("BLUE")
                                                .setTimestamp(embeds.timestamp)
                                            if (embeds.image.url) {
                                                creationEmb.setImage(embeds.image.url);
                                            }
                                            msg.channel.send(creationEmb);
                                            bool = true;

                                        }
                                    })



                                }

                            });
                            if (!bool) return msg.reply("This user has no archived creations!")
                        })
                    }
                    break;
                case 'foundcompany':
                    if (!args[1]) {
                        const companies = require('./jsonFiles/companies.json');
                        const optionsEmb = new discord.MessageEmbed()
                            .setTitle("Types of companies")
                            .setColor("BLUE")
                        for (var i in companies) {

                            optionsEmb.addField(`${companies[i].index}.${companies[i].name}`, `**Setup Cost**: $${companies[i].price}.\n**Estimated income:** $${companies[i].base_production *(companies[i].price_fluxuation[1]-companies[i].price_fluxuation[0])}/Hour `)
                        }
                        msg.channel.send(optionsEmb);
                    } else {

                        const companies = require('./jsonFiles/companies.json')
                        var type = parseInt(args[1])
                        for (var i in companies) {
                            if (companies[i].index == type) {
                                var comp = getCompany(msg.author.id, msg.guild.id);

                                if (comp.companytype == 0) {

                                    if (eco.cash - companies[i].price >= 0) {

                                        comp.companytype = type;
                                        comp.lastchecked = Date.now()
                                        bot.setCompanies.run(comp)
                                        const successemb = new discord.MessageEmbed()
                                            .setTitle(":white_check_mark: Succesfully founded company!")
                                            .setColor("GREEN")
                                        msg.channel.send(successemb);
                                        msg.delete();
                                    } else {
                                        const failedemb = new discord.MessageEmbed()
                                            .setTitle(":x: You don't have enough cash to do this!")
                                            .setColor("RED")
                                        msg.channel.send(failedemb)
                                    }
                                } else {
                                    msg.reply("Are you sure? Doing this will disband your other company.").then(message => {
                                        message.react("✔️").then(() => {
                                            bot.on('messageReactionAdd', (reaction, user) => {
                                                if (user.id == msg.author.id && reaction.emoji.name == '✔️') {
                                                    if (eco.cash - companies[i].price >= 0) {
                                                        comp.companytype = type;
                                                        comp.lastchecked = Date.now()
                                                        bot.setCompanies.run(comp)
                                                        const successemb = new discord.MessageEmbed()
                                                            .setTitle(":white_check_mark: Succesfully founded company!")
                                                            .setColor("GREEN")
                                                        message.channel.send(successemb);
                                                        message.delete();
                                                    } else {
                                                        const failedemb = new discord.MessageEmbed()
                                                            .setTitle(":x: You don't have enough cash to do this!")
                                                            .setColor("RED")
                                                        msg.channel.send(failedemb)
                                                    }
                                                }
                                            })
                                        })
                                    });

                                }
                            }
                        }
                    }

                    break;
                case 'company.info':
                    var company = getCompany(msg.author.id, msg.guild.id);
                    if (company.companytype == 0) {
                        const failedEmb = new discord.MessageEmbed()
                            .setTitle(":x: You don't have a company!")
                            .setColor("RED")
                        return msg.channel.send(failedEmb);
                    } else {
                        const companies = require('./jsonFiles/companies.json')
                        var base_production;
                        var price_fluxuation;
                        var comptype;
                        for (var i in companies) {
                            if (companies[i].index == company.companytype) {
                                base_production = companies[i]["base_production"];
                                price_fluxuation = companies[i]["price_fluxuation"];
                                comptype = companies[i].name
                            }
                        }
                        var upgrades = company.upgrades
                        upgrades = JSON.parse(upgrades);

                        var production = base_production + ((base_production / 10) * upgrades.upgrades["Production Speed"])
                        const infoEmb = new discord.MessageEmbed()
                            .setTitle("Company info:")
                            .setColor("BLUE")
                            .addField("Company Type", `${comptype}`)
                            .addField("Production", `${production}/Hour`)
                            .addField(`Total Profit`, `$${company.totalprofit}`)
                            .addField(`Total products`, `${Math.floor(production/60*Math.floor(((Date.now()-company.lastchecked)/60000)))}`)

                        msg.channel.send(infoEmb);
                    }
                    break;
                case 'company.sellproducts':
                    var company = getCompany(msg.author.id, msg.guild.id);
                    if (company.companytype == 0) {
                        const failedEmb = new discord.MessageEmbed()
                            .setTitle(":x: You don't have a company!")
                            .setColor("RED")
                        return msg.channel.send(failedEmb);
                    } else {
                        const companies = require('./jsonFiles/companies.json')
                        var base_production;
                        var price_fluxuation;
                        var comptype;
                        for (var i in companies) {
                            if (companies[i].index == company.companytype) {
                                base_production = companies[i]["base_production"];
                                price_fluxuation = companies[i]["price_fluxuation"];
                                comptype = companies[i].name
                            }
                        }
                        var upgrades = company.upgrades
                        upgrades = JSON.parse(upgrades);

                        var production = base_production + ((base_production / 10) * upgrades.upgrades["Production Speed"])
                        var products = Math.floor(production / 60 * Math.floor(((Date.now() - company.lastchecked) / 60000)))

                        var eco = getEco(msg.author.id, msg.guild.id, msg.author.username);
                        addExp(eco, (products * price_fluxuation[0]) / 100)
                        addCash(msg.author.id, msg.guild.id, (products * price_fluxuation[0]));
                        const successemb = new discord.MessageEmbed()
                            .setTitle(`:white_check_mark: You sold your products for a profit of: $${(products*price_fluxuation[0])}`)
                            .setColor("GREEN")
                        msg.channel.send(successemb)
                        company.lastchecked = Date.now();
                        bot.setCompanies.run(company)

                    }
                    break;
                case 'resetsql':
                    if (msg.author.id === '188708544269254656') {

                        sql.prepare('DROP TABLE IF EXISTS eco').run()
                        sql.prepare('DROP TABLE IF EXISTS companies').run()
                        sql.prepare("CREATE TABLE eco(id TEXT PRIMARY KEY,xp INT,lvl INT,cash INT,jobid TEXT,username TEXT);").run();
                        sql.prepare("CREATE UNIQUE INDEX idx_eco_id ON eco (id);").run();
                        sql.pragma("synchronous = 1");
                        sql.pragma("journal_mode = wal");
                        sql.prepare("CREATE TABLE companies(id TEXT PRIMARY KEY,upgrades TEXT,totalprofit INT,companytype INT,lastchecked INT);").run();
                        sql.prepare("CREATE UNIQUE INDEX idx_companies_id ON companies (id);").run();
                        sql.pragma("synchronous = 1");
                        sql.pragma("journal_mode = wal");
                    }
                    break;
                case 'addexp':
                    if (msg.member.hasPermission("ADMINISTRATOR")) {
                        var eco = getEco(msg.author.id, msg.guild.id, msg.author.username)
                        var x = addExp(eco, parseInt(args[1]))
                        if (x) msg.reply(`You leveled up to lvl ${eco.lvl}!`);
                    }
                    break;
                case 'postguildid':
                    msg.reply(msg.guild.id)
                break;
                    
            }
        }
    }
})
const checkMap = new Map();

bot.on('messageReactionAdd', async (reaction, user) => {
    if (!user.bot) {
        let msg = reaction.message


        if (reaction.count >= 3 && reaction.emoji.name === "⭐" && !checkMap.has(msg.id)) {
            checkMap.set(msg.id, 0)
            let archiveChannel = bot.channels.cache.find(c => c.id === "770325208132747304");
            if (!msg.attachments.first()) {
                const creationEmbed = new discord.MessageEmbed()
                    .setTitle(`${msg.author.username}'s creation`)
                    .setDescription(`***Description:*** ${msg.content} `)
                    .setTimestamp()
                    .setColor("BLUE")
                    .setFooter(`${msg.author.id}`)
                archiveChannel.send(creationEmbed);
            } else {
                const creationEmbed = new discord.MessageEmbed()
                    .setTitle(`${msg.author.username}'s creation`)
                    .setDescription(`***Description:*** ${msg.content} `)
                    .setImage(msg.attachments.first().attachment)
                    .setTimestamp()
                    .setColor("BLUE")
                    .setFooter(`${msg.author.id}`)
                archiveChannel.send(creationEmbed);

            }


        }
    }

})


bot.login(token);


/*

Economy system:

        Jobs:
            Work with Leveling system.
            Choose job using ;jobs -> work by typing ;work.
            Work cooldown depending on income.
            Each time you work you get XP.
            The more xp

























*/
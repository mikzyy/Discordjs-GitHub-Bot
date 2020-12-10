const Discord = require("discord.js")
const fetch = require('node-fetch');
const config = require("./config.json")

const bot = new Discord.Client()

const prefix = config.prefix
const activity = "WATCHING"
const token = config.token
const status = config.status
const printjsoninconsole = config.printjsoninconsole
const authtoken = config.githubAuthToken
const githubrepo = config.githubRepository
const embedcolor = config.embedColor

let commands = [
    "help",
    "issues",
    "pr",
    "pullrequest",
    "pullrequests"
]

bot.on('ready', () => {
    console.clear()
    console.log("github js bot is online.")
    console.log(`using: ${githubrepo}`)
    bot.user.setStatus(status)
    bot.user.setActivity("GitHub | git!help", {
        type: activity
    })
})

bot.on('message', message => {
    if (!message.content.startsWith(prefix)) return

    if (message.content == prefix + "issues") {
        getIssues(message)
    }
    if (message.content == prefix + "pullrequest" || message.content == prefix + "pr" || message.content == prefix + "pullrequests") {
        getPullRequests(message)
    }
    if (message.content == prefix + "help") {
        const embed = new Discord.RichEmbed
        embed.setTitle("Bot Commands")
        embed.setColor(embedcolor)
        let i2 = 1;
        for(let i = 0; i < commands.length; i++) {
            embed.addField("Command " + i2 + ":", prefix + commands[i], true)
            i2++;
        }
        message.channel.send(embed)
    }
});

function sleep(ms) {
    return new Promise(
      resolve => setTimeout(resolve, ms)
    );
}

async function getIssues(message) {
    message.channel.startTyping();
    sleep(1000)
    const headers = {
        "Authorization" : `Token ${authtoken}`
    }
    const url = `https://api.github.com/search/issues?q=repo:${githubrepo} type:issue`
    const response = await fetch(url, {
        "method": "GET",
        "headers": headers
    })
    const result = await response.json()

    if (printjsoninconsole)
        console.log(result);

    if (result.message == 'Bad credentials') {
        message.channel.send("You cannot access this repository or the credentials (authentication token) are wrong.")
        message.channel.stopTyping()
        return
    }
    if (result.message == 'Validation Failed') {
        message.channel.send("The listed users and repositories cannot be searched either because the resources do not exist or you do not have permission to view them.")
        message.channel.stopTyping()
        return
    }

    let openResults = 0;
    result.items.forEach(i => {
        if (i.state == 'open')
            openResults++
    })
    const embed = new Discord.RichEmbed()
    embed.setTimestamp()
    embed.setTitle(`${githubrepo} Repository Issues`)
    embed.setColor(embedcolor)
    embed.addField("Total Issues:", result.total_count, true)
    embed.addField("Issues Open:", openResults, true);
    embed.addField("Incomplete Results", result.incomplete_results == true ? "Yes" : "No", true)
    let b = 1;
    result.items.forEach(i => {
        let stateUp = i.state.toString().toUpperCase()
        let curState = (i.state == "" || i.state == null ? "[No Label]" : `**[${stateUp}]** `)
        embed.addField(curState + "Issue " + b + ": " + (i.title == "" ? "*No title." : i.title), (i.body == "" ? "*No body.*" : i.body) + `\n` ,false)
        b++;
    })
    embed.setFooter("(Bot by mikz#0001)")
    message.channel.send(embed)
    message.channel.stopTyping()
}

async function getPullRequests(message) {
    message.channel.startTyping();
    sleep(1000)
    const headers = {
        "Authorization" : `Token ${authtoken}`
    }
    const url = `https://api.github.com/repos/${githubrepo}/pulls`
    const response = await fetch(url, {
        "method": "GET",
        "headers": headers
    })
    const result = await response.json()

    if (printjsoninconsole)
        console.log(result);


    if (result == "") {
        message.channel.send("The repository has no active pull requests or cannot find any valid ones.")
        message.channel.stopTyping()
        return
    }
    if (result.message == 'Bad credentials') {
        message.channel.send("You cannot access this repository or the credentials (authentication token) are wrong.")
        message.channel.stopTyping()
        return
    }
    if (result.message == 'Validation Failed') {
        message.channel.send("The listed users and repositories cannot be searched either because the resources do not exist or you do not have permission to view them.")
        message.channel.stopTyping()
        return
    }

    let openResults = 0;
    result.forEach(i => {
        if (i.state == 'open')
            openResults++
    })
    const embed = new Discord.RichEmbed()
    embed.setTimestamp()
    embed.setTitle(`${githubrepo} Repository Pull Requests`)
    embed.setColor(embedcolor)
    embed.addField("Pull Requests Open:", openResults, true);
    let b = 1;
    result.forEach(i => {
        let stateUp = i.state.toString().toUpperCase()
        let curState = (i.state == "" || i.state == null ? "[No Label]" : `**[${stateUp}]** `)
        embed.addField(curState + "PR " + b + ": " + (i.title == "" ? "*No title." : i.title), (i.body == "" ? "*No body.*" : i.body) + `\n` ,false)
        b++;
    })
    embed.setFooter("(Bot by mikz#0001)")
    message.channel.send(embed)
    message.channel.stopTyping()
}

bot.login(token)
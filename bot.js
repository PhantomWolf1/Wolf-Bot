const Discord = require("discord.js");
const bot = new Discord.Client();
const fs = require("fs");
const mysql = require("mysql");
const config = require("./config.json");
var prefix = "!";
bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
  console.log("Loading commands...");
  if (err) return console.log(`Command loading failed!`);
  files.filter(f => f.split(".").pop() === "js").forEach((f, i) => {
    bot.commands.set(require(`./commands/${f}`).help.name, require(`./commands/${f}`));
  });
});

bot.on("ready", () => {
  bot.user.setActivity("Watching over your servers.")
});

function generateXP() {
  return Math.floor(Math.random() * (15 - 1 + 1)) + 10;
};

var con = mysql.createConnection({
  host: "remotemysql.com",
  user: "uAKsyahvjh",
  password: process.env.sqlpass,
  database: "uAKsyahvjh"
})

con.connect(err => {
  if(err) throw err
 console.log("Connected.")
})

bot.on("message", message => {
  con.query(`SELECT * FROM wolfbot WHERE id = '${message.author.id}'`, (err, rows) => {
    if(err) throw err
    let sql;
    if message.author.bot return;

    if(rows.length < 1) {
      sql = `INSERT INTO wolfbot (userid, xp) VALUES ('${message.author.id}, ${generateXP()}')`
    } else {
      let xp = rows[0].xp
      sql = `UPDATE wolfbot SET xp = ${xp + generateXP()} WHERE id = '${message.author.id}'`
    }
    con.query(sql, console.log);
  })
})

bot.on('message', message => {
  let mArray = message.content.split(" ")
  let args = mArray.slice(1)
  let cmd = bot.commands.get(mArray[0].slice(prefix.length))
  if (message.author.bot) return;
  if (message.channel.type == "dm") return;
  if (!message.content.startsWith(prefix)) return;
  if (cmd) {
    cmd.run(bot, message, args, Discord)
    console.log(`${message.author.username} used the ${message.content.split(" ")[0]} command.`)

  }
})

bot.login(process.env.token);

import { Sequelize } from 'sequelize'
import { Client, Intents } from 'discord.js'
import configFile, { sequelize as seqConfig, discord as discordConfig, packages } from './config/lotus.json'

const sequelize = new Sequelize(seqConfig)
const client = new Client({ intents: discordConfig.intents.map(i => Intents.FLAGS[i]) })

const commands = new Map()
const modules = new Map()
const config = {}
const global = { sequelize, client, commands, config, modules, configFile }
const eventModules = {}

async function start () {
  await Promise.all(packages.map(async pName => {
    const packageObj = await import(pName)
    const module = { name: pName, commandNames: [], enabled: {}, config: packageObj.config }

    for (const [name, fn] of Object.entries(packageObj.events)) {
      if (!eventModules[name]) eventModules[name] = [fn]
      else eventModules[name].push(fn)
    }

    for (const [name, command] of Object.entries(packageObj.commands)) {
      command.moduleName = pName
      command.name = name
      command.enabled = {}
      commands.set(name, command)
      module.commandNames.push(name)
    }

    modules.set(pName, module)
  }))

  for (const [eventName, events] of Object.entries(eventModules)) {
    client.on(eventName, (...args) =>
      events.forEach(item => item(global, ...args))
    )
  }

  client.once('ready', () => {
    console.log('Discord bot started!')
  })

  client.login(discordConfig.token)
}

start()

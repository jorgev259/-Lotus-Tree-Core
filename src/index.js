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
  await Promise.all(packages.map(async pPath => {
    const packageObj = await import(pPath)
    const { name: pName } = packageObj
    const module = { name: pName, commandNames: [], enabled: {}, config: packageObj.config }
    let commandSize = 0
    let eventSize = 0

    for (const [name, fn] of Object.entries(packageObj.events || {})) {
      if (!eventModules[name]) eventModules[name] = [fn]
      else eventModules[name].push(fn)

      eventSize++
    }

    for (const [name, command] of Object.entries(packageObj.commands || {})) {
      command.moduleName = pName
      command.name = name
      command.enabled = {}
      commands.set(name, command)
      module.commandNames.push(name)
      commandSize++
    }

    modules.set(pName, module)

    const loadedText = commandSize > 0 && eventSize > 0
      ? ` with ${commandSize} commands and ${eventSize} events`
      : (commandSize > 0
          ? ` with ${commandSize} commands`
          : (
              eventSize > 0
                ? ` with ${eventSize} events`
                : ''
            ))

    console.log(`Loaded "${pName}"${loadedText}`)
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

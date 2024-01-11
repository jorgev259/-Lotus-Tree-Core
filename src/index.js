import { Sequelize } from 'sequelize'
import { Client, Events } from 'discord.js'
import fs from 'fs-extra'

import { loadModule } from './loadPackage.js'

const lotusConfig = await fs.readJSON('./config/lotus.json')
const { sequelize: sequelizeConfig, discord: discordConfig, packages: packageList = [] } = lotusConfig
const sequelize = new Sequelize(sequelizeConfig)

const events = new Map()
const commands = new Map()
const modules = new Map()

const intents = new Set()
const partials = new Set()

const defaultConfig = { guild: {}, global: {} }
const config = {}
const localConfig = {}

const packages = (
  await Promise.all(
    packageList.map(p => loadModule(p, sequelize))
  )
).filter(p => p !== null)

packages.forEach(pkg => {
  const {
    name,
    intents: packageIntents = [], partials: packagePartials = [],
    events: packageEvents = {}, commands: packageCommands = {},
    config = { guild: {}, global: {} },
    localConfig: pkgLocalConfig = {}
  } = pkg

  const commandNames = []
  localConfig[name] = {}

  packageIntents.forEach(intent => intents.add(intent))
  packagePartials.forEach(partial => partials.add(partial))

  for (const [name, fn] of Object.entries(packageEvents)) {
    if (!events.has(name)) events.set(name, [fn])
    else events.set(name, [...events.get(name), fn])
  }

  for (const [name, command] of Object.entries(packageCommands)) {
    command.name = name
    command.moduleName = pkg.name
    command.enabled = {}
    commands.set(name, command)
    commandNames.push(name)
  }

  for (const [name, value] of Object.entries(config.global || {})) {
    defaultConfig.global[name] = value
  }

  for (const [name, value] of Object.entries(config.guild || {})) {
    defaultConfig.guild[name] = value
  }

  for (const [configName, value] of Object.entries(pkgLocalConfig)) {
    localConfig[name][configName] = value
  }

  const module = { name, commandNames, enabled: {} }
  modules.set(name, module)
})

const client = new Client({ intents: Array.from(intents), partials: Array.from(partials) })
const globals = { sequelize, client, commands, defaultConfig, config, localConfig, modules, lotusConfig }

for (const [eventName, eventList] of events.entries()) {
  client.on(eventName, (...args) =>
    eventList.forEach(item => {
      try {
        item(globals, ...args)
      } catch (err) {
        console.log(err)
      }
    })
  )
}

client.once(Events.ClientReady, () => {
  console.log(`Discord bot started! Logged in as ${client.user.tag}`)
})

client.login(discordConfig.token)

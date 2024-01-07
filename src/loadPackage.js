// import fs from 'fs-extra'
// import path from 'path'

export async function loadModule (packagePath, sequelize) {
  const { default: packageObj } = await import(packagePath)
  const { name } = packageObj

  try {
    const { preload, /* defaultConfig, */ commands = {}, events = {} } = packageObj

    /* if (defaultConfig) {
      const configPath = path.join('./config/', `${name}.json`)
      const configExists = await fs.pathExists(configPath)

      if (!configExists) {
        await fs.writeJson(configPath, defaultConfig)
        throw new Error(`${configPath} not found. Edit the file then restart the bot`)
      }
    } */
    if (preload) await preload(sequelize)

    const commandSize = Object.values(commands).length
    const eventSize = Object.values(events).length

    const loadedText = commandSize > 0 && eventSize > 0
      ? ` with ${commandSize} commands and ${eventSize} events`
      : (commandSize > 0
        ? ` with ${commandSize} commands`
        : (
          eventSize > 0
            ? ` with ${eventSize} events`
            : ''
        ))

    console.log(`Loaded ${name}${loadedText}`)
    return packageObj
  } catch (err) {
    console.error(err, `Failed to load ${name}`)

    return null
  }
}

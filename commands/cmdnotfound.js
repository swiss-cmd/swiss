module.exports = cmdName => {
    const chalk = require('chalk')
    console.log(chalk.red(`Error: Command ${chalk.cyan(cmdName)} not found`))
}
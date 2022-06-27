module.exports = (cmdArgs) => {
    const chalk = require('chalk')

    const cmdInfo = (cmdName, cmdDesc) => {
        console.log(`${chalk.bgCyan(chalk.white(' ' + cmdName + ' '))} ${chalk.italic(cmdDesc)}`)
    }

    console.log(chalk.bgRed(chalk.white('                      Swiss Commands                      ')))
    cmdInfo('help', 'Displays this help menu')
    cmdInfo('tunnel <port> <protocol>', 'Creates an ngrok tunnel')
    cmdInfo('rsh', 'Creates an remote shell'),
    cmdInfo('connectrsh <token>', 'Connects to an remote shell')
}
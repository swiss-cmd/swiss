const chalk = require('chalk')
const args = process.argv.slice(2)
const cmd = args[0]
const cmdArgs = args.slice(1)

const logo = chalk.red(`                                    .:^\n             ^                     /   :\n'\`.        /;/                    /    /\n\\  \\      /;/                    /    /\n \\\\ \\    /;/                    /  ///\n  \\\\ \\  /;/                    /  ///\n   \\  \\/_/____________________/    /\n    \`/                         \\  /\n    {  o       ${chalk.white(chalk.bgRed(' Swiss '))}       o  }'\n     \\_________________________/`)

if (!cmd) {
    console.log(logo)
    console.log()
    console.log(`Use: ${chalk.redBright('swiss help')} for more infos`)
    process.exit(0)
}

// Commands
const cmds = require('./commands/commandlist.js')

// Process cmd
if (cmd in cmds) {
    cmds[cmd](cmdArgs)
} else {
    cmds.cmdnotfound(cmd)
}
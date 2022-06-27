module.exports = async args => {
    const ngrok = require('ngrok')
    const chalk = require('chalk')

    const port = parseInt(args[0]) || 80
    const protocol = args[1] || 'http'

    console.log(chalk.gray(`[INFO] Tunneling ${protocol}://localhost:${port}`))
    
    try  {
        const url = await ngrok.connect({
            proto: protocol,
            addr: port,
            region: 'eu'
        })

        console.log(chalk.green('[INFO] Tunnel created'))
        console.log(chalk.green(`[INFO] URL: ${url}`))
    } catch {
        console.log(chalk.red('[ERROR] Tunnel creation failed'))
        console.log(chalk.gray('[INFO] Syntax: swiss tunnel <port?> <protocol?>'))
        process.exit(1)
    }
}
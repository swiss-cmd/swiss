module.exports = async args => {
    const chalk = require('chalk')
    const rawToken = args[0]
    if (!rawToken) {
        console.log(chalk.red('[ERROR] Missing token'))
        console.log(chalk.gray('[INFO] Syntax: swiss connectrsh <token>'))
        process.exit(1)
    }

    const ngrokUrl = `https://${rawToken.split('/')[0]}.eu.ngrok.io`
    const shellToken = rawToken.split('/')[1]

    // Connect using socket.io
    const io = require('socket.io-client')(ngrokUrl)

    io.emit('verify', shellToken)

    let vfied = false
    setTimeout(() => {
        if (vfied) return
        console.log(chalk.red('[ERROR] Connection timed out'))
        process.exit(1)
    }, 10 * 1000)

    io.on('youareverified', () => {
        console.log(chalk.green('Connected to remote target!'))
        vfied = true

        // Pipe local stdin into the socket
        process.stdin.on('data', data => {
            io.emit('pipeStdin', data)
        })
    })

    io.on('pipeStdout', data => {
        process.stdout.write(data)
    })

    io.on('pipeStderr', data => {
        process.stderr.write(data)
    })

    io.on('exit', code => {
        console.log(chalk.red('Exited with code ' + code + '!'))
        process.exit(code)
    })
}
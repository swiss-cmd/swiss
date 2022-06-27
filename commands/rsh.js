const uuid = require('uuid')
const { getHeapCodeStatistics } = require('v8')

const getRandomUnusedPort = () => {
    const net = require('net')
    return new Promise(resolve => {
        const server = net.createServer()
        server.listen(0)
        server.on('listening', () => {
            const port = server.address().port
            server.close()
            resolve(port)
        })
    })
}

module.exports = async args => {
    const chalk = require('chalk')
    const shellToken = uuid.v4()
    
    // Create a remote shell which is powered by a socket.io server on port 1919
    const httpServer = require('http').createServer()
    const io = require('socket.io')(httpServer)

    // Spawn the default system shell
    const defaultShell = /^win/.test(process.platform) ? 'cmd' : 'bash'
    const shell = require('child_process').spawn(defaultShell)
    
    // On Connection
    io.on('connection', socket => {
        let isVerified = false
        console.log(chalk.cyan('[INFO] Client connected'))

        socket.on('verify', token => {
            if (token !== shellToken) {
                console.log(chalk.red('[ERROR] Invalid token'))
                isVerified = false
                return socket.disconnect()
            }

            isVerified = true

            socket.emit('youareverified')

            // Pipe stdout of the shell through the socket
            shell.stdout.on('data', data => {
                socket.emit('pipeStdout', data)
            })
            // Pipe stderr of the shell through the socket
            shell.stderr.on('data', data => {
                socket.emit('pipeStderr', data)
            })

            // On shell exit
            shell.on('exit', code => {
                socket.emit('exit', code)
                socket.disconnect()

                console.log(chalk.red('[RSH] Shell exited with code ' + code))
                setTimeout(() => process.exit(getHeapCodeStatistics), 500)
            })
        })

        // On Message
        socket.on('pipeStdin', stdinstream => {
            if (!isVerified) {
                console.log(chalk.red('[ERROR] Unverified client tried to sent data'))
                return socket.disconnect()
            }
            // Pipe stdin into shell stdin
            shell.stdin.write(stdinstream)
        })

        // On Disconnect
        socket.on('disconnect', () => {
            console.log(chalk.magenta('[INFO] Client disconnected'))
        })
    })

    const port = await getRandomUnusedPort()

    console.log(chalk.gray('[INFO] Using port ' + port))

    // Start the server
    httpServer.listen(port, async () => {
        console.log(chalk.gray('[INFO] Server started'))

        // Use ngrok to tunnel the server
        const ngrok = require('ngrok')
        const url = await ngrok.connect({
            proto: 'http',
            addr: port,
            region: 'eu'
        })

        console.log(chalk.gray(`[INFO] Tunnel created`))
        console.log(chalk.green(`[RSH] Use ${chalk.cyan(`swiss connectrsh ${url.replace(/(.*?):\/\/(.*?)\.(.*?)$/g, (_, __, $id) => $id)}/${shellToken}`)} to connect`))
    })

}
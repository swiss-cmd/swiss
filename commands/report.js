module.exports = async args => {
    const fs = require('fs')
    const path = require('path')
    const chalk = require('chalk')
    const os = require('os')
    const fetch = (await import('node-fetch')).default
    const { execSync } = require('child_process')
    const disk = require('diskusage')
    const diskInfo = disk.checkSync('/')
    const getPublicIP = async () => {
        const response = await fetch('https://api.ipify.org/?format=json')
        const data = await response.json()
        return data.ip
    }

    function getCpuInfo() {
        const cpus = os.cpus();
        const cores = {};

        for (let i = 0; i < cpus.length; i++) {
            const model = cpus[i].model;

            if (cores[model]) {
                cores[model]++;
            } else {
                cores[model] = 1;
            }
        }

        const info = [];

        for (let model in cores) {
            const count = cores[model];
            const label = count === 1 ? 'Core' : 'Cores';
            const cpuInfo = `${count}x ${model};`;

            info.push(cpuInfo);
        }

        return info.join(' ');
    }

    const getRouterIP = () => {
        const platform = os.platform();
        switch (platform) {
            case 'linux':
                return execSync("ip route | grep default | awk '{print $3}'").toString().trim();
            case 'darwin':
                return execSync("netstat -nr | grep default | awk '{print $2}'").toString().trim();
            case 'win32':
                const output = execSync('ipconfig').toString();
                const defaultGateway = output.match(/Standardgateway.*: (.*)/i) || output.match(/Default Gateway.*: (.*)/i);
                if (!defaultGateway) {
                    throw new Error('Could not determine default gateway');
                }
                return defaultGateway[1].trim();
            default:
                throw new Error(`Platform ${platform} is not supported`);
        }
    }

    const platform = process.platform;
    let systemInfo;

    if (platform === 'win32') {
        systemInfo = execSync('systeminfo').toString().trim();
    } else if (platform === 'linux') {
        systemInfo = execSync('uname -a').toString().trim();
    } else {
        throw new Error(`Unsupported platform: ${platform}`);
    }



    const file = args[0] || '@CONSOLE:OUT;'
    let report = `----- System Report -----
General Info:
- Time: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
- Date: ${new Date().toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/(\d+)\/(\d+)\/(\d+)/, '$2.$1.$3')}
- Timezone: ${new Date().toLocaleString('en-us', { timeZoneName: 'short' }).split(' ').pop()}
- CPU Arch: ${os.arch()}
- CPU Cores: ${getCpuInfo()}
- CPU Endianness: ${os.endianness()}
- Free Memory: ${os.freemem()} (around ${Math.round(os.freemem() / 1000 / 1000) / 1000}GB)
- Total Memory: ${os.totalmem()} (around ${Math.round(os.totalmem() / 1000 / 1000) / 1000}GB)
- Host Name: ${os.hostname()}
- Home: ${os.homedir()}
- Local IP: ${Object.values(os.networkInterfaces()).flat().filter(({ family, internal }) => family === 'IPv4' && !internal).map(({ address }) => address)[0]}
- Public IP: ${await getPublicIP()}
- Router IP: ${getRouterIP()}
- Subnet Mask: ${Object.values(os.networkInterfaces()).flat().find(({ family, internal }) => family === 'IPv4' && !internal).netmask}
- Mac Adress: ${Object.values(os.networkInterfaces()).flat().find(({ mac, internal }) => !internal && mac !== '00:00:00:00:00:00').mac}
- OS: ${os.platform()} (${os.release()}) -> ${os.type()}
- TMP: ${os.tmpdir()}
- Uptime: ${os.uptime()}
- User: ${os.userInfo().username}

Network Interfaces:
${Object.entries(os.networkInterfaces()).map(([name, nets]) => `- ${name}: ${nets.map(net => net.family === 'IPv4' ? `(${net.address})` : '').join(' ')} ${nets[0].mac}`).join('\n')}

Disk Usage:
- Total: ${diskInfo.total}
- Used: ${diskInfo.available}
- Free: ${diskInfo.free}

System Info:
${systemInfo}
`

    console.log(chalk.green(`[INFO] Reported generated`))
    if (file === '@CONSOLE:OUT;') {
        console.log()
        console.log(report)
    } else {
        try {
            fs.writeFileSync(path.join(process.cwd(), file), report)
            console.log(chalk.green(`[INFO] Saved report as ${file}`))
        } catch {
            console.log(chalk.red(`[ERROR] Failed to save report`))
        }
    }
}
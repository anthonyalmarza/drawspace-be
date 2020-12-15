import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

module.exports = async () => {
    const containerName = 'dynamodb_ft'
    try {
        await execPromise(`docker ps -a | grep ${containerName}`)
    } catch (e) {
        await execPromise(
            `docker create --name ${containerName} -p 9001:8000 amazon/dynamodb-local`
        )
    }
    await execPromise(`docker start ${containerName}`)
}

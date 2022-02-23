
const fs = require('fs')
const Client = require('ssh2-sftp-client')
const SFTP = {}



const {
	FTP_DIR,
	FTP_USER,
	FTP_PASSWORD,
	FTP_KEY,
	FTP_PASSPHRASE,
	FTP_HOST,
} = process.env;

console.log(`using ${FTP_DIR} ${FTP_USER} ${FTP_KEY} ${FTP_HOST}`)


module.exports = {
	/** 
	* 
	* @description Get pre-configured client via username and key-file + key-file passphrase
	*
	* @returns Promise
	*/
	connect,
	/** 
	* 
	* @description Get pre-configured client via username and password
	*
	* @returns Promise
	*/
	connect_basic,
	/**
	 * Get CWD of client
	 * @param {Object} client connected client 
	 */
	currentDirectory,
	/**
	 * 
	 * @param {Object} client connected client 
	 * @param {String} dir path to list; Optional: defaults to process.env.FTP_DIR
	 * @param {String} pattern return only reg matches; Optional: defaults to names w/ .* (files w/ extensions)
	 * 
	 * @returns {Promise}
	 */
	listFiles,
	/**
	* @description Stream file from SFTP
	*
	* @param {Object} client connected client 
	* @param filepath filepath of file on SFTP server
	*
	* @returns {Promise} Resolves to Buffer
	*/
	getFile,
	/**
	 * 
	 * @param {Binary} src file data
	 * @param {String} filename name of file, can include prefix path if inside the default directory
	 * 
	 * @return {Promise} upload result resolves
	 */
	uploadFile,
	/**
	 * 
	 * @param {String} from fromPath: string. Path to existing file to be renamed
	 * @param {String} to toPath: string. Path to new file existing file is to be renamed to. Should not already exist.
	 * @param {Object} client optional; connected client 
	 * 
	 * @returns {Promise}
	 */
	moveFile,
}


/** 
* 
* @description Get pre-configured client
*
* @returns Promise
*/
async function connect_basic() {
	
	const client = new Client('example-client');

	await client.connect({ 
		host: FTP_HOST, 
		port: '22',
		username: FTP_USER, 
		password: FTP_PASSWORD,
	})

	return client
}

/** 
* 
* @description Get pre-configured client
*
* @returns Promise
*/
async function connect() {
	
	const client = new Client('example-client');

	await client.connect({ 
		host: FTP_HOST, 
		port: '22',
		username: FTP_USER, 
		privateKey: fs.readFileSync(FTP_KEY), // Buffer or string that contains
		passphrase: FTP_PASSPHRASE
	})

	return client
}

/**
 * Get CWD of client
 * @param {Object} client connected client 
 */
async function currentDirectory(client) {

	try {

		return client.cwd();
	}
	catch(error){
		console.error(error)
		return error
	}
}

/**
 * 
 * @param {Object} client connected client 
 * @param {String} dir path to list; Optional: defaults to process.env.FTP_DIR
 * @param {String} pattern return only reg matches; Optional: defaults to names w/ .* (files w/ extensions)
 * 
 * @returns {Promise}
 */
async function listFiles(client, dir = FTP_DIR, pattern = '.*') {

	try {

		return client.list(dir, pattern)
	}
	catch(error){
		console.error(error)
		return error
	}
}

/**
 * @description will move file from one location to another; 
 * if file exists, fallback to renaming file and attempt move again
 * 
 * @param {String} fromPath: string. Path to existing file to be renamed
 * @param {String} toPath: string. Path to new file existing file is to be renamed to. Should not already exist.
 * @param {Object} client optional; connected client 
 * 
 * @returns {Promise}
 */
async function moveFile(from, to, client) {

	client = client ? client : await connect()

	return new Promise((resolve, reject) => {

		client.rename(from, to)
		.then(() => {
			resolve(true)
		})
		.catch(error => {

			/* const to_dedupe = `${to.substring(0, to.length-4)}-DEDUPE-${Util.uuid()}.hl7`

			client.rename(from, to_dedupe)
			.then(() => {
				resolve(true)
			})
			.catch(error => { */
				reject(error.message)
			//})
		})
	})
}


/**
* @description Stream file from SFTP
*
* @param {Object} client connected client 
* @param filepath filepath of file on SFTP server
*
* @returns {Promise} Resolves to Buffer
*/
function getFile(client, filepath) {

	try {

		return client.get(filepath)
	}
	catch(error){
		console.error(error)
		//Salesforce.logger({ Status__c: 'Error', Body__c: JSON.stringify(error) })
	}
}



/**
 * 
 * @param {Any} src {String} || {Buffer} || {Stream} file data
 * @param {String} filename name of file, can include prefix path if inside the default directory
 * @param {Object} client Optional; an SFTP connected client
 */
async function uploadFile(src, filename, client) {

	try {


		SFTP.client = client ? client : await connect()

		const remotePath = `${FTP_DIR}/${filename}`
		console.log('sending to')
		console.log(remotePath)

		const options = {
			flags: 'w',  // w - write and a - append
			encoding: null, // use null for binary files
			//mode: 0o666, // mode to use for created file (rwx)
			autoClose: true // automatically close the write stream when finished
		}

		return SFTP.client.put(src, remotePath, options)
	}
	catch(error){
		console.error(error)
		return error
	}
}

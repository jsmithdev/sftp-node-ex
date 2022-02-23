if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const SFTP = require( "./API/SFTP" )

test()
async function test(){


    const sftp_client = await SFTP.connect_basic()

    const cwd = await SFTP.currentDirectory( sftp_client )

    console.log( 'cwd' )
    console.log( cwd )

    const files = await SFTP.listFiles( sftp_client, cwd )

    console.log( 'files' )
    console.log( files )
	
}
 
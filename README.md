# SFTP Node Example

This is an example of sftp communications in node

Wrote js years ago but a dev asked about sftp so updated packages and basic auth, listing, etc worked so sharing

Mileage may vary

## Environment Variables

During development, add `.env` file to the root with the values you want to use for your sftp

FTP_DIR=/

FTP_USER=demo

FTP_PASSWORD=(this is used for basic auth)

FTP_KEY=(if using a key this would be the path to the key file)

FTP_PASSPHRASE=(if using passphrase)

FTP_HOST=your.host.com

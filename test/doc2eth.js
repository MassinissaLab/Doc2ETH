const { assert } = require("console")

const Doc2eth = artifacts.require('./Doc2eth.sol')

contract('Doc2eth', ([deployer, uploader]) => {
    let Doc2eth

    before(async() => {
        Doc2eth = await Doc2eth.deployed()
    })


    it('deploys successfully', async() => {
        const address = await Doc2eth.address
        assert(address != 0x0)
        assert(address != '')
        assert(address != null)
        assert(address != undefined)
    })

    it('has a name', async() => {
        const name = await Doc2eth.name()
        assert(name === 'Doc2eth')
    })


    let result;
    const fileHash = 'XYZ'
    const fileSize = '6'
    const fileType = 'ABC'
    const fileName = 'ABC'


    before(async() => {
        result = await Doc2eth.uploadFile(fileHash, fileSize, fileType, fileName)
    })


    it('upload file', async() => {

        const event = result.logs[0].args

        assert(event.fileHash === fileHash)
        assert(event.fileSize === fileSize)
        assert(event.fileType === fileType)
        assert(event.fileName === fileName)

    })


    it('get count', async() => {
        const count = await Doc2eth.getCount();
        assert(count == 1);
    })

    it('get index file', async() => {
        const fileAtIndexZero = await Doc2eth.getFilesofUser(0);
        console.log(fileAtIndexZero[0])
        assert(fileAtIndexZero[0] === fileHash);
        assert(fileAtIndexZero[1] === fileSize);
        assert(fileAtIndexZero[2] === fileType);
        assert(fileAtIndexZero[3] === fileName);
    })



})
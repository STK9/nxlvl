const { assert } = require('chai')

const hf = artifacts.require('ISA')

require('chai') 
    .use(require('chai-as-promised'))
    .should()

contract('hf',(accounts) => {
    let hf1

    before(async ()=>{
        hf1 = await hf.deployed()   
    })

    describe('deployment', async() =>{
        it('deploys successfully', async()=>{       
            const address = hf1.address
            assert.notEqual(address,0x0)
            assert.notEqual(address,'')
            assert.notEqual(address,undefined)
            assert.notEqual(address,null)

        })   
    })

    describe('storage', async()=>{
        it('store successfully', async()=>{
            const str1 = await hf1.storeHash('222')
            const res = await hf1.getHash()
            assert.equal(res,'22')
            
        })
    })
})

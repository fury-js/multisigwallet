const chai = require('chai')
chai.use(require('chai-as-promised'))

const expect = chai.expect


const MultiSigWallet = artifacts.require("MultiSigWallet")

contract("MultiSigWallet", accounts => {
	const owners = [accounts[0], accounts[1], accounts[2]]

	const NUM_CONFIRMATIONS_REQUIRED = 2


	let wallet

	beforeEach(async () => {
		wallet = await MultiSigWallet.new(owners, NUM_CONFIRMATIONS_REQUIRED)
	})

	describe('execute transaction', () => {
		beforeEach(async () => {
		const to = owners[0]
		const value = 0
		const data = "0x0"

		await wallet.submitTransaction(to, value, data)
		await wallet.confirmTransaction(0, { from: owners[0] })
		await wallet.confirmTransaction(0, { from: owners[1] })
		})

		// execute transaction should succee d
		it('should execute', async ()=> {
		const response = await wallet.executeTransaction(0, {from: owners[0] })
		const { logs } = response

		assert.equal(logs[0].event, 'ExecuteTransaction')
		assert.equal(logs[0].args.owner, owners[0])
		assert.equal(logs[0].args.txIndex, 0)

		const tx = await wallet.getTransaction(0)
		assert.equal(tx.executed, true)
		// console.log(tx)

		})

		//execute transaction should fail if executed
		it('should reject if already executed', async () => {
			await wallet.executeTransaction(0, {from: owners[0] })

			// try{
			// 	await wallet.executeTransaction(0, {from: owners[0] })
			// 	throw new Error('transaction did not fail')

			// } catch (error) {
			// 	assert.equal(error.reason, 'transaction already executed')
			// }

			await expect(wallet.executeTransaction(0, {from: owners[0] })).to.be.rejected

		})
	})

	describe('revoke a transaction', () => {
		beforeEach(async () => {
		const to = owners[0]
		const value = 0
		const data = "0x0"

		await wallet.submitTransaction(to, value, data)
		await wallet.confirmTransaction(0, { from: owners[0] })
		await wallet.confirmTransaction(0, { from: owners[1] })
		})

		it('revoke a transaction', async () => {
		const response = await wallet.revokeTransaction(0, {from: owners[0] })
		const { logs } = response

		assert.equal(logs[0].event, 'RevokeTransaction')
		assert.equal(logs[0].args.owner, owners[0])
		// assert.equal([logs[0].args.txIndex, 0])

		console.log(response)


		const tx = await wallet.getTransaction(0)
		assert.equal(tx.executed, false)
		console.log(tx)

		


		
	})
	})



	
})
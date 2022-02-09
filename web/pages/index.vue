<template>
	<v-row justify="center" align="center">
		<v-col cols="12">
			
			<v-parallax height="600" src="img/sauna.jpg">
				<v-row align="center">
					<v-col class="text-center">
						<h1>JPYC Analytics</h1>
						<p>JPYC is the most issued &amp; traded stable coin pegged to JPY</p>
					</v-col>
				</v-row>
			</v-parallax>
			
			<h2>Market Circulation Statistics</h2>
			
			<div class="text-center" style="font-size: 200%;">
				<div>
					<span style="font-size: 200%;">
						<number :from="0" :to="stat.transfer_values_24h.all" :format="(n) => Math.floor(n).toLocaleString()"></number>
						<span style="font-size: 80%;">JPYC</span>
					</span>
					transfered in 24h.
				</div>
				<div>
					<span style="font-size: 200%;">
						<number :from="0" :to="stat.transfer_count_24h.all" :format="(n) => Math.floor(n).toLocaleString()"></number>
					</span>
					transactions submited in 24h.
				</div>
			</div>
			
			<h2>Top Holders</h2>
			
			<v-data-table :headers="holdersHeaders" :items="holders">
				<template v-slot:item.chain="{ item }">
					<ChainName :value="item.chain" />
				</template>
				<template v-slot:item.address="{ item }">
					<Address :chain="item.chain" :value="item.address" />
				</template>
				<template v-slot:item.value="{ item }">
					<Amount :value="Number.parseFloat(item.value)" />
				</template>
			</v-data-table>
			
			<h2>Recent Transactions</h2>
			
			<v-data-table :headers="txsHeaders" :items="txs">
				<template v-slot:item.chain="{ item }">
					<ChainName :value="item.chain" />
				</template>
				<template v-slot:item.height="{ item }">
					<BlockNumber :chain="item.chain" :value="item.height" />
				</template>
				<template v-slot:item.timestamp="{ item }">
					<TimeStamp :value="item.timestamp" />
				</template>
				<template v-slot:item.txhash="{ item }">
					<TxHash :chain="item.chain" :value="item.txhash" short />
				</template>
				<template v-slot:item.from="{ item }">
					<Address :chain="item.chain" :value="item.from" short />
				</template>
				<template v-slot:item.to="{ item }">
					<Address :chain="item.chain" :value="item.to" short />
				</template>
				<template v-slot:item.value="{ item }">
					<Amount :value="Number.parseFloat(item.value)" />
				</template>
			</v-data-table>
			
			
		</v-col>
	</v-row>
</template>

<script>
import Vue from 'vue';
import VueNumber from 'vue-number-animation';

Vue.use(VueNumber);

export default {
	name: 'IndexPage',
	data() {
		return {
			stat: {
				transfer_values_24h: {
					all: 0,
				},
				transfer_count_24h: {
					all: 0,
				},
			},
			holdersHeaders: [
				{
					text: 'Blockchain',
					value: 'chain',
				},
				{
					text: 'Address',
					value: 'address',
				},
				{
					text: 'Amount',
					value: 'value',
					align: 'right',
				},
			],
			holders: [],
			txsHeaders: [
				{
					text: 'Blockchain',
					value: 'chain',
				},
				{
					text: 'Block Number',
					value: 'height',
				},
				{
					text: 'Timestamp',
					value: 'timestamp',
				},
				{
					text: 'Transaction Hash',
					value: 'txhash',
				},
				{
					text: 'From',
					value: 'from',
				},
				{
					text: 'To',
					value: 'to',
				},
				{
					text: 'Amount Transacted',
					value: 'value',
					align: 'right',
				},
			],
			txs: [],
		};
	},
	async mounted() {
		(async () => { this.stat = (await this.$axios.$get('http://localhost:10484/stat')); })();
		(async () => { this.holders = (await this.$axios.$get('http://localhost:10484/holders')).holders; })();
		(async () => { this.txs = (await this.$axios.$get('http://localhost:10484/txs')).txs; })();
	},
}
</script>

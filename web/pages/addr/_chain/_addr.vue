<template>
	<v-row justify="center" align="center">
		<v-col cols="12">
			
			<h1>Address {{ $route.params.addr }} (<ChainName :value="$route.params.chain" />)</h1>
			
			<div class="text-center" style="margin-top: 30px; margin-bottom: 30px;">
				<a :href="blockExplorerUrl()" target="_blank">
					<v-btn color="primary">
						View On Blockexplorer <v-icon>mdi-open-in-new</v-icon>
					</v-btn>
				</a>
			</div>
			
			<h2>Summary</h2>
			
			<v-row>
				<v-col>
					<v-card>
						<v-card-title>
							Account Balance
						</v-card-title>
						<v-card-text style="font-size: 200%;">
							<Amount :value="Number.parseFloat(addr.balance)" />
						</v-card-text>
					</v-card>
				</v-col>
				<v-col>
					<v-card>
						<v-card-title>
							Number of Transactions
						</v-card-title>
						<v-card-text style="font-size: 200%;">
							{{ addr.txs.length.toLocaleString() }}
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
			
			<h2 style="margin-top: 50px;">Transactions</h2>
			
			<Transactions :value="addr.txs" />
			
		</v-col>
	</v-row>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator';

@Component({
	name: 'IndexPage',
})
export default class Index extends Vue {
	addr = {
		balance: 0,
		txs: [],
	};
	async mounted() {
		const chain = this.$route.params.chain;
		const addr = this.$route.params.addr;
		this.addr = (await this.$axios.$get(`http://localhost:10484/addr/${chain}/${addr}`));
	}
	blockExplorerUrl() {
		const chain = this.$route.params.chain;
		const addr = this.$route.params.addr;
		const urlPrefixes: { [chain: string]: string } = {
			eth    : 'https://etherscan.io/address/',
			polygon: 'https://polygonscan.io/address/',
			xdai   : 'https://blockscout.com/shiden/address/',
			shiden : 'https://shiden.subscan.io/account/',
		};
		if(urlPrefixes[chain]) {
			return (urlPrefixes[chain] + addr);
		} else {
			return null;
		}
	}
}
</script>
